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
  <title>Redirecting to Tesla</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column;
      align-items: center; justify-content: center; min-height: 100vh; margin: 0;
      color: #666; gap: 1rem; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <p>Redirecting to Tesla…</p>
  <a id="tesla-link" href="${authorizeUrl.replace(/"/g, "&quot;")}" rel="noreferrer noopener" referrerpolicy="no-referrer">Continue to Tesla</a>
  <script>
    (function () {
      var url = ${safeUrl};
      var link = document.createElement("a");
      link.href = url;
      link.rel = "noreferrer noopener";
      link.referrerPolicy = "no-referrer";
      document.body.appendChild(link);
      link.click();
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
