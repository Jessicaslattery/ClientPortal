/**
 * Minimal MCP Streamable HTTP client for the Granola MCP server.
 * Implements just enough of the JSON-RPC 2.0 + MCP protocol to call tools.
 *
 * Auth: Granola uses OAuth 2.0. Store your access token in GRANOLA_MCP_TOKEN.
 * To get the token: open Granola → Settings → Integrations → Claude/MCP →
 * copy the bearer token shown there, or extract it from:
 *   ~/Library/Application Support/Granola/mcp-token  (if present)
 */

const MCP_URL = "https://mcp.granola.ai/mcp";

let _sessionId: string | null = null;
let _requestId = 1;

function nextId() {
  return _requestId++;
}

async function mcpFetch(
  token: string,
  body: object,
  sessionId?: string
): Promise<{ result?: unknown; error?: { code: number; message: string } }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${token}`,
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;

  const res = await fetch(MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    // No caching — always fresh
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Granola MCP HTTP ${res.status}: ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const newSessionId = res.headers.get("Mcp-Session-Id");
  if (newSessionId) _sessionId = newSessionId;

  if (contentType.includes("text/event-stream")) {
    // Parse SSE — extract the first `data:` line that contains a JSON-RPC response
    const text = await res.text();
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data:")) {
        const json = trimmed.slice(5).trim();
        if (json) return JSON.parse(json);
      }
    }
    throw new Error("Granola MCP: empty SSE response");
  }

  return res.json();
}

async function ensureSession(token: string): Promise<string | undefined> {
  if (_sessionId) return _sessionId;

  const resp = await mcpFetch(token, {
    jsonrpc: "2.0",
    id: nextId(),
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "pivot-co", version: "1.0.0" },
    },
  });

  if (resp.error) {
    // Some servers don't require initialize — carry on
    console.warn("Granola MCP initialize warning:", resp.error.message);
  }

  return _sessionId ?? undefined;
}

export async function callGranolaTool<T = unknown>(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  const token = process.env.GRANOLA_MCP_TOKEN;
  if (!token) throw new Error("GRANOLA_MCP_TOKEN is not set in .env");

  const sessionId = await ensureSession(token);

  const resp = await mcpFetch(
    token,
    {
      jsonrpc: "2.0",
      id: nextId(),
      method: "tools/call",
      params: { name: toolName, arguments: args },
    },
    sessionId
  );

  if (resp.error) {
    throw new Error(`Granola MCP tool error (${toolName}): ${resp.error.message}`);
  }

  // MCP tools/call result wraps content in { content: [{ type, text }] }
  const result = resp.result as {
    content?: Array<{ type: string; text?: string }>;
    isError?: boolean;
  };

  if (result?.isError) {
    const msg = result.content?.map((c) => c.text).join(" ") ?? "Unknown tool error";
    throw new Error(`Granola MCP tool error (${toolName}): ${msg}`);
  }

  // Return the parsed text content if it's JSON, otherwise as-is
  const textBlock = result?.content?.find((c) => c.type === "text");
  if (textBlock?.text) {
    try {
      return JSON.parse(textBlock.text) as T;
    } catch {
      return textBlock.text as unknown as T;
    }
  }

  return result as unknown as T;
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export type GranolaMeeting = {
  id: string;
  title: string;
  created_at: string;
  start_time?: string;
  end_time?: string;
  participants?: Array<{ email?: string; name?: string }>;
  summary?: string;
};

export async function granolaListMeetings(
  timeRange: "this_week" | "last_week" | "last_30_days" = "this_week"
): Promise<GranolaMeeting[]> {
  const result = await callGranolaTool<{ meetings?: GranolaMeeting[] } | GranolaMeeting[]>(
    "list_meetings",
    { time_range: timeRange }
  );

  if (Array.isArray(result)) return result;
  return result.meetings ?? [];
}

export async function granolaGetTranscript(meetingId: string): Promise<string> {
  const result = await callGranolaTool<{ transcript?: string } | string>(
    "get_meeting_transcript",
    { meeting_id: meetingId }
  );

  if (typeof result === "string") return result;
  return result.transcript ?? "";
}
