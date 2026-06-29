"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAiInsight, useAssistantChat } from "@/features/assistant/hooks/use-assistant";

export default function AssistantPage() {
  const { data: insightData } = useAiInsight();
  const chat = useAssistantChat();
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);

  const handleSend = () => {
    if (!message.trim()) return;
    const userMsg = message.trim();
    setMessage("");
    setHistory((h) => [...h, { role: "user", text: userMsg }]);
    chat.mutate(userMsg, {
      onSuccess: (data) => {
        setHistory((h) => [...h, { role: "ai", text: data.response }]);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Assistant</h2>
        <p className="text-sm text-muted-foreground">AI-powered driving insights</p>
      </div>

      {insightData?.insight && (
        <Card className="shadow-card border-accent/30">
          <CardHeader>
            <CardTitle>Weekly insight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{insightData.insight.summary}</p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Ask DriveLens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Try: &quot;Explain this week&apos;s battery usage&quot; or &quot;Suggest charging
                time&quot;
              </p>
            )}
            {history.map((entry, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-sm ${
                  entry.role === "user"
                    ? "bg-primary/10 text-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {entry.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your trips, charging, or efficiency…"
              rows={2}
            />
            <Button onClick={handleSend} disabled={chat.isPending || !message.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
