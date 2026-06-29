import { Client } from "@upstash/qstash";

export function getQStashClient(): Client {
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    throw new Error("QSTASH_TOKEN is not defined");
  }

  return new Client({
    token,
    baseUrl: process.env.QSTASH_URL,
  });
}
