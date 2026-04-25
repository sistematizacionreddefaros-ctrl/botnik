// Edge Function: Webhook Handler for Meta Cloud API v21.0
// Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface WebhookLog {
    message_id: string | null;
    direction: "inbound" | "outbound";
    payload: Record<string, unknown>;
    status: "received" | "processed" | "failed" | "ignored";
    error_message?: string;
    processing_ms?: number;
}

function extractMessageId(payload: Record<string, unknown>): string | null {
    try {
        const entry = payload.entry as Array<Record<string, unknown>> | undefined;
        if (!Array.isArray(entry) || entry.length === 0) return null;
        const changes = entry[0].changes as Array<Record<string, unknown>> | undefined;
        if (!Array.isArray(changes) || changes.length === 0) return null;
        const value = changes[0].value as Record<string, unknown> | undefined;
        if (!value) return null;
        const messages = value.messages as Array<Record<string, unknown>> | undefined;
        if (!Array.isArray(messages) || messages.length === 0) return null;
        const id = messages[0].id;
        return typeof id === "string" ? id : null;
    } catch {
        return null;
    }
}

function isValidWhatsAppPayload(payload: Record<string, unknown>): boolean {
    return extractMessageId(payload) !== null;
}

function handleVerification(url: URL): Response {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (!mode || !token || !challenge) {
        return new Response("Missing required parameters", { status: 400 });
    }

    const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken) {
        return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
}

async function handleMessage(req: Request): Promise<Response> {
    const startTime = performance.now();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let payload: Record<string, unknown>;

    try {
        payload = await req.json();
    } catch {
        const processingMs = Math.round(performance.now() - startTime);
        const log: WebhookLog = {
            message_id: null,
            direction: "inbound",
            payload: {},
            status: "ignored",
            error_message: "Invalid JSON body",
            processing_ms: processingMs,
        };
        await supabase.from("webhook_logs").insert(log);
        return new Response("OK", { status: 200 });
    }

    try {
        if (!isValidWhatsAppPayload(payload)) {
            const processingMs = Math.round(performance.now() - startTime);
            const log: WebhookLog = {
                message_id: null,
                direction: "inbound",
                payload,
                status: "ignored",
                processing_ms: processingMs,
            };
            await supabase.from("webhook_logs").insert(log);
            return new Response("OK", { status: 200 });
        }

        const messageId = extractMessageId(payload)!;

        const { data: existing } = await supabase
            .from("webhook_logs")
            .select("id")
            .eq("message_id", messageId)
            .maybeSingle();

        if (existing) {
            return new Response("OK", { status: 200 });
        }

        const processingMs = Math.round(performance.now() - startTime);
        const log: WebhookLog = {
            message_id: messageId,
            direction: "inbound",
            payload,
            status: "received",
            processing_ms: processingMs,
        };
        await supabase.from("webhook_logs").insert(log);
        return new Response("OK", { status: 200 });
    } catch (error) {
        const processingMs = Math.round(performance.now() - startTime);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const log: WebhookLog = {
            message_id: extractMessageId(payload),
            direction: "inbound",
            payload,
            status: "failed",
            error_message: errorMessage,
            processing_ms: processingMs,
        };
        await supabase.from("webhook_logs").insert(log).catch(() => {
            console.error("Failed to insert error log:", errorMessage);
        });
        return new Response("OK", { status: 200 });
    }
}

Deno.serve(async (req: Request): Promise<Response> => {
    const url = new URL(req.url);

    if (req.method === "GET") {
        return handleVerification(url);
    }

    if (req.method === "POST") {
        return await handleMessage(req);
    }

    return new Response("Method not allowed", { status: 405 });
});
