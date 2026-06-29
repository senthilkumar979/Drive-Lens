import { Receiver } from "@upstash/qstash";

function isQStashDevMode(): boolean {
  return (
    process.env.QSTASH_DEV === "true" ||
    (process.env.NODE_ENV === "development" && !process.env.QSTASH_CURRENT_SIGNING_KEY)
  );
}

async function verifyQStashRequest(request: Request): Promise<boolean> {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (!currentSigningKey || !nextSigningKey) {
    return false;
  }

  const signature = request.headers.get("upstash-signature");
  if (!signature) {
    return false;
  }

  const receiver = new Receiver({
    currentSigningKey,
    nextSigningKey,
  });

  const body = await request.text();

  return receiver.verify({
    signature,
    body,
    url: request.url,
  });
}

export function withQStash(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    if (!isQStashDevMode()) {
      const isValid = await verifyQStashRequest(request);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return handler(request);
  };
}
