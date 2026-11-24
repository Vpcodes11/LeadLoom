import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyWebhook } from "./webhook-signature";

const rawKey = Buffer.from("leadloom-test-signing-key-0123456789");
const secret = `whsec_${rawKey.toString("base64")}`;
const body = JSON.stringify({ type: "subscription.active", data: { subscription_id: "sub_1" } });

function sign(id: string, ts: string, payload: string, key = rawKey) {
  return `v1,${createHmac("sha256", key).update(`${id}.${ts}.${payload}`).digest("base64")}`;
}
const now = () => String(Math.floor(Date.now() / 1000));
const headers = (h: Record<string, string>) => new Headers(h);

test("accepts a correctly signed webhook", () => {
  const ts = now();
  assert.equal(verifyWebhook(body, headers({ "webhook-id": "msg_1", "webhook-timestamp": ts, "webhook-signature": sign("msg_1", ts, body) }), secret), true);
});

test("accepts when one of several signatures matches", () => {
  const ts = now();
  const sig = `v1,bm9wZQ== ${sign("msg_1", ts, body)}`;
  assert.equal(verifyWebhook(body, headers({ "webhook-id": "msg_1", "webhook-timestamp": ts, "webhook-signature": sig }), secret), true);
});

test("rejects a tampered body", () => {
  const ts = now();
  assert.equal(verifyWebhook(body + " ", headers({ "webhook-id": "msg_1", "webhook-timestamp": ts, "webhook-signature": sign("msg_1", ts, body) }), secret), false);
});

test("rejects a signature made with another key", () => {
  const ts = now();
  const sig = sign("msg_1", ts, body, Buffer.from("some-other-key"));
  assert.equal(verifyWebhook(body, headers({ "webhook-id": "msg_1", "webhook-timestamp": ts, "webhook-signature": sig }), secret), false);
});

test("rejects an old timestamp (replay)", () => {
  const ts = String(Math.floor(Date.now() / 1000) - 3600);
  assert.equal(verifyWebhook(body, headers({ "webhook-id": "msg_1", "webhook-timestamp": ts, "webhook-signature": sign("msg_1", ts, body) }), secret), false);
});

test("rejects missing headers", () => {
  assert.equal(verifyWebhook(body, headers({}), secret), false);
});
