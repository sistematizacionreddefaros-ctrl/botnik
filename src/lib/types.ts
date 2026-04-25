// ============================================================
// BOTNIK POS — TypeScript Types
// Generated from the database schema (design.md Data Models)
// ============================================================

// Roles del sistema
export type UserRole = "owner" | "admin" | "cashier" | "waiter" | "kitchen";

// Estados
export type TableStatus = "free" | "occupied" | "reserved";
export type ShiftStatus = "active" | "closed";
export type OrderType = "dinein" | "pickup" | "delivery" | "whatsapp";
export type OrderStatus =
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "paid"
    | "cancelled"
    | "refunded";
export type PaymentStatus = "pending" | "paid" | "refunded";
export type InventoryMovementType =
    | "purchase"
    | "consumption"
    | "adjustment"
    | "waste";
export type IngredientUnit = "g" | "ml" | "unit";
export type WebhookDirection = "inbound" | "outbound";
export type WebhookStatus = "received" | "processed" | "failed" | "ignored";

// Entidades principales
export interface Restaurant {
    id: string;
    name: string;
    slug: string;
    phone: string | null;
    address: string | null;
    timezone: string;
    currency: string;
    tax_rate: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserProfile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    created_at: string;
}

export interface UserRestaurant {
    id: string;
    user_id: string;
    restaurant_id: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
}

export interface MenuItem {
    id: string;
    restaurant_id: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    image_url: string | null;
    is_available: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Ingredient {
    id: string;
    restaurant_id: string;
    name: string;
    unit: IngredientUnit;
    current_stock: number;
    min_stock: number;
    cost_per_unit: number;
    created_at: string;
    updated_at: string;
}

export interface ProductRecipe {
    id: string;
    menu_item_id: string;
    ingredient_id: string;
    quantity_needed: number;
    created_at: string;
}

export interface Table {
    id: string;
    restaurant_id: string;
    label: string;
    capacity: number;
    status: TableStatus;
    zone: string | null;
    sort_order: number;
    created_at: string;
}

export interface Shift {
    id: string;
    restaurant_id: string;
    user_id: string;
    status: ShiftStatus;
    opening_cash: number;
    closing_cash: number | null;
    expected_cash: number | null;
    total_sales: number | null;
    total_orders: number | null;
    difference: number | null;
    notes: string | null;
    opened_at: string;
    closed_at: string | null;
}

export interface Order {
    id: string;
    restaurant_id: string;
    order_number: string;
    order_type: OrderType;
    status: OrderStatus;
    table_id: string | null;
    shift_id: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    delivery_address: string | null;
    subtotal: number;
    tax: number;
    total: number;
    payment_status: PaymentStatus;
    notes: string | null;
    cancel_reason: string | null;
    wa_message_id: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    modifiers: string[];
    notes: string | null;
    created_at: string;
}

export interface InventoryMovement {
    id: string;
    restaurant_id: string;
    ingredient_id: string;
    type: InventoryMovementType;
    quantity: number;
    reference_id: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
}

export interface WebhookLog {
    id: string;
    restaurant_id: string | null;
    message_id: string | null;
    direction: WebhookDirection;
    payload: Record<string, unknown>;
    status: WebhookStatus;
    error_message: string | null;
    processing_ms: number | null;
    created_at: string;
}

export interface AuditLog {
    id: string;
    restaurant_id: string;
    user_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
}

// Placeholder type for Supabase generated database types.
// Replace with the auto-generated type from `supabase gen types typescript`
// once the database is deployed.
export type Database = Record<string, unknown>;
