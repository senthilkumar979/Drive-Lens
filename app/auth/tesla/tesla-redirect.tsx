"use client";

import { useEffect } from "react";

interface TeslaOAuthRedirectProps {
  authorizeUrl: string;
}

/** Navigate without Referer — Akamai often blocks OAuth when Referer is vercel.app. */
export function TeslaOAuthRedirect({ authorizeUrl }: TeslaOAuthRedirectProps) {
  useEffect(() => {
    const link = document.createElement("a");
    link.href = authorizeUrl;
    link.rel = "noreferrer noopener";
    link.referrerPolicy = "no-referrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [authorizeUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <p className="text-muted-foreground text-sm">Redirecting to Tesla…</p>
      <a
        href={authorizeUrl}
        rel="noreferrer noopener"
        referrerPolicy="no-referrer"
        className="text-primary text-sm underline"
      >
        Continue to Tesla if you are not redirected
      </a>
    </div>
  );
}
