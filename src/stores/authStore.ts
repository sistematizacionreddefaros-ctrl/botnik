import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type {
    Restaurant,
    UserProfile,
    UserRestaurant,
    UserRole,
} from "../lib/types";

export interface AuthState {
    // State
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    activeRestaurant: Restaurant | null;
    role: UserRole | null;
    userRestaurants: UserRestaurant[];
    isLoading: boolean;

    // Actions
    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        fullName: string,
    ) => Promise<void>;
    signOut: () => Promise<void>;
    setActiveRestaurant: (restaurant: Restaurant, role: UserRole) => void;
}

/**
 * Fetch the user profile from user_profiles table.
 */
async function fetchProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error || !data) return null;
    return data as UserProfile;
}

/**
 * Fetch all active user_restaurants for a given user, including the
 * related restaurant data so we can set the active restaurant.
 */
async function fetchUserRestaurants(
    userId: string,
): Promise<{ userRestaurants: UserRestaurant[]; restaurants: Restaurant[] }> {

    const { data, error } = await supabase
        .from("user_restaurants")
        .select("*, restaurants(*)")
        .eq("user_id", userId)
        .eq("is_active", true);

    if (error || !data) {
        return { userRestaurants: [], restaurants: [] };
    }

    const userRestaurants: UserRestaurant[] = data.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        restaurant_id: row.restaurant_id,
        role: row.role,
        is_active: row.is_active,
        created_at: row.created_at,
    }));

    const restaurants: Restaurant[] = data
        .map((row: any) => row.restaurants)
        .filter(Boolean);

    return { userRestaurants, restaurants };
}

export const useAuthStore = create<AuthState>((set, get) => ({
    // Initial state
    session: null,
    user: null,
    profile: null,
    activeRestaurant: null,
    role: null,
    userRestaurants: [],
    isLoading: true,

    /**
     * Subscribe to Supabase auth state changes.
     * Called once when the app mounts.
     */
    initialize: async () => {
        set({ isLoading: true });

        // Get the current session
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            const { userRestaurants, restaurants } = await fetchUserRestaurants(
                session.user.id,
            );

            // Auto-select the first restaurant if available
            const firstUR = userRestaurants[0] ?? null;
            const firstRestaurant = restaurants[0] ?? null;

            set({
                session,
                user: session.user,
                profile,
                userRestaurants,
                activeRestaurant: firstRestaurant,
                role: firstUR?.role ?? null,
                isLoading: false,
            });
        } else {
            set({ isLoading: false });
        }

        // Listen for future auth changes (login, logout, token refresh)
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_OUT" || !session) {
                set({
                    session: null,
                    user: null,
                    profile: null,
                    activeRestaurant: null,
                    role: null,
                    userRestaurants: [],
                    isLoading: false,
                });
                return;
            }

            // SIGNED_IN, TOKEN_REFRESHED, etc.
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                const { userRestaurants, restaurants } = await fetchUserRestaurants(
                    session.user.id,
                );

                const currentActive = get().activeRestaurant;
                // Keep the current active restaurant if it's still in the list
                const stillValid = currentActive
                    ? userRestaurants.some(
                        (ur) => ur.restaurant_id === currentActive.id,
                    )
                    : false;

                const firstUR = userRestaurants[0] ?? null;
                const firstRestaurant = restaurants[0] ?? null;

                set({
                    session,
                    user: session.user,
                    profile,
                    userRestaurants,
                    activeRestaurant: stillValid ? currentActive : firstRestaurant,
                    role: stillValid
                        ? get().role
                        : firstUR?.role ?? null,
                    isLoading: false,
                });
            }
        });
    },

    /**
     * Sign in with email and password.
     * On success, fetches user_restaurants and sets the active restaurant/role.
     */
    signIn: async (email: string, password: string) => {
        set({ isLoading: true });

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            set({ isLoading: false });
            throw error;
        }

        const { session, user } = data;
        const profile = await fetchProfile(user.id);
        const { userRestaurants, restaurants } = await fetchUserRestaurants(
            user.id,
        );

        const firstUR = userRestaurants[0] ?? null;
        const firstRestaurant = restaurants[0] ?? null;

        set({
            session,
            user,
            profile,
            userRestaurants,
            activeRestaurant: firstRestaurant,
            role: firstUR?.role ?? null,
            isLoading: false,
        });
    },

    /**
     * Sign up a new user and create their user_profile record.
     */
    signUp: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true });

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            set({ isLoading: false });
            throw error;
        }

        const user = data.user;
        if (!user) {
            set({ isLoading: false });
            throw new Error("Sign up succeeded but no user was returned.");
        }

        // Create the user_profile record (Requirement 3.4)
        // Note: type assertion needed until Database type is generated from Supabase
        const { error: profileError } = await supabase
            .from("user_profiles")
            .insert({ id: user.id, full_name: fullName } as any);

        if (profileError) {
            set({ isLoading: false });
            throw profileError;
        }

        const profile: UserProfile = {
            id: user.id,
            full_name: fullName,
            avatar_url: null,
            phone: null,
            created_at: new Date().toISOString(),
        };

        set({
            session: data.session,
            user,
            profile,
            userRestaurants: [],
            activeRestaurant: null,
            role: null,
            isLoading: false,
        });
    },

    /**
     * Sign out and clear all auth state.
     */
    signOut: async () => {
        set({ isLoading: true });

        await supabase.auth.signOut();

        set({
            session: null,
            user: null,
            profile: null,
            activeRestaurant: null,
            role: null,
            userRestaurants: [],
            isLoading: false,
        });
    },

    /**
     * Set the active restaurant and role.
     * Used when the user switches between restaurants.
     */
    setActiveRestaurant: (restaurant: Restaurant, role: UserRole) => {
        set({
            activeRestaurant: restaurant,
            role,
        });
    },
}));