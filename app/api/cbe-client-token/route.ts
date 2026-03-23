import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const upstreamBaseUrl = process.env.CBE_API_BASE_URL;
  const upstreamApiKey = process.env.CBE_API_KEY;

  if (!upstreamBaseUrl || !upstreamApiKey) {
    return NextResponse.json(
      {
        error: "Server is missing CBE proxy env vars",
        missing: [
          !upstreamBaseUrl ? "CBE_API_BASE_URL" : null,
          !upstreamApiKey ? "CBE_API_KEY" : null,
        ].filter(Boolean),
      },
      { status: 500 }
    );
  }

  type TokenRequestBody = {
    app_code?: string;
    customer_identifier?: string;
  };

  let body: TokenRequestBody = {};
  try {
    body = (await req.json()) as TokenRequestBody;
  } catch {
    body = {};
  }

  const app_code = body?.app_code;
  const customer_identifier = body?.customer_identifier;

  if (!app_code) {
    return NextResponse.json(
      { error: "Missing required field: app_code" },
      { status: 400 }
    );
  }

  const cookieFromClient = req.headers.get("cookie");
  const cookieFromEnv = process.env.CBE_COOKIE;
  const cookieToForward = cookieFromClient || cookieFromEnv;

  const upstreamUrl = `${upstreamBaseUrl}/mini-apps/client/token`;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        "x-api-key": upstreamApiKey,
        "Content-Type": "application/json",
        ...(cookieToForward ? { Cookie: cookieToForward } : {}),
      },
      body: JSON.stringify({
        app_code,
        ...(customer_identifier ? { customer_identifier } : {}),
      }),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown fetch error";
    return NextResponse.json(
      {
        error: "Upstream fetch failed",
        message,
        upstreamUrl,
        cookieSent: Boolean(cookieToForward),
      },
      { status: 502 }
    );
  }

  const contentType = upstreamRes.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await upstreamRes.json();
      return NextResponse.json(data, { status: upstreamRes.status });
    } catch {
      const text = await upstreamRes.text();
      return new NextResponse(text, {
        status: upstreamRes.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  const text = await upstreamRes.text();
  return new NextResponse(text, {
    status: upstreamRes.status,
    headers: { "Content-Type": contentType || "text/plain" },
  });
}

