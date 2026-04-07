export function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = [
    "https://www.lattice-protocol.com",
    "capacitor://localhost",
    "ionic://localhost",
    "http://localhost:3000",
  ];
  const allowOrigin = allowedOrigins.includes(origin) ? origin : "https://www.lattice-protocol.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export function jsonWithCors(req: Request, data: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(req),
      ...(init.headers || {}),
    },
  });
}

export function corsOptions(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}
