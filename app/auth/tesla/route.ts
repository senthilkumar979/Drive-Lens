import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth/auth";
import { getAuthUrl } from "@/lib/env";

export async function GET() {
  try {
    const authorizeUrl = await signIn("tesla", {
      redirectTo: "/dashboard",
      redirect: false,
    });

    if (!authorizeUrl || typeof authorizeUrl !== "string") {
      return NextResponse.redirect(
        new URL("/login?error=tesla", getAuthUrl()),
      );
    }

    const safeUrl = JSON.stringify(authorizeUrl);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="referrer" content="no-referrer">
  <title>Connect Tesla — DriveLens</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0; padding: 1.5rem;
      background: #0a0a0a; color: #e5e5e5;
    }
    main {
      max-width: 28rem; width: 100%;
      background: #171717; border: 1px solid #333; border-radius: 12px;
      padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;
    }
    h1 { font-size: 1.125rem; margin: 0; }
    p { font-size: 0.875rem; color: #a3a3a3; margin: 0; line-height: 1.5; }
    .actions { display: flex; flex-direction: column; gap: 0.5rem; }
    button, a.btn {
      display: block; text-align: center; padding: 0.75rem 1rem;
      border-radius: 8px; font-size: 0.875rem; font-weight: 500;
      cursor: pointer; text-decoration: none; border: none;
    }
    .primary { background: #2563eb; color: #fff; }
    .primary:hover { background: #1d4ed8; }
    .hint { font-size: 0.75rem; color: #737373; }
    .spinner {
      width: 1.25rem; height: 1.25rem; margin: 0 auto;
      border: 2px solid #404040; border-top-color: #2563eb;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <main>
    <h1>Connect your Tesla account</h1>
    <div class="spinner" aria-hidden="true"></div>
    <p id="status">Redirecting to Tesla login…</p>
    <p class="hint">
      Stay in this browser tab. Do not copy the link — PKCE security requires
      the same session you started here.
    </p>
    <div class="actions">
      <button type="button" class="btn primary" id="continue-tesla">
        Continue to Tesla
      </button>
    </div>
  </main>
  <script>
    (function () {
      var url = ${safeUrl};
      function go() {
        window.location.replace(url);
      }
      document.getElementById("continue-tesla").addEventListener("click", go);
      setTimeout(go, 600);
    })();
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Tesla OAuth start failed:", error);
    return NextResponse.redirect(new URL("/login?error=tesla", getAuthUrl()));
  }
}
