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
    .secondary { background: #262626; color: #e5e5e5; border: 1px solid #404040; }
    .secondary:hover { background: #333; }
    .hint { font-size: 0.75rem; color: #737373; }
    textarea {
      width: 100%; height: 4.5rem; font-size: 0.7rem;
      background: #0a0a0a; color: #a3a3a3; border: 1px solid #333;
      border-radius: 6px; padding: 0.5rem; resize: none;
    }
  </style>
</head>
<body>
  <main>
    <h1>Connect your Tesla account</h1>
    <p>
      Tesla’s login page sometimes blocks automatic redirects (Akamai).
      Use <strong>Open Tesla login</strong> or copy the link and paste it into
      a new browser tab’s address bar.
    </p>
    <div class="actions">
      <a class="btn primary" id="open-tesla" href="${authorizeUrl.replace(/"/g, "&quot;")}"
         rel="noreferrer noopener" target="_blank" referrerpolicy="no-referrer">
        Open Tesla login (new tab)
      </a>
      <button type="button" class="btn secondary" id="copy-link">Copy authorization link</button>
    </div>
    <textarea id="auth-url" readonly></textarea>
    <p class="hint" id="copy-status"></p>
    <p class="hint">After approving access, you will return to DriveLens dashboard.</p>
  </main>
  <script>
    (function () {
      var url = ${safeUrl};
      var input = document.getElementById("auth-url");
      input.value = url;
      document.getElementById("copy-link").addEventListener("click", function () {
        navigator.clipboard.writeText(url).then(function () {
          document.getElementById("copy-status").textContent = "Link copied — paste it in a new tab address bar.";
        });
      });
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
