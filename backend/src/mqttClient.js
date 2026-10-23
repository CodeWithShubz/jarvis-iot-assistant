/**
 * mqttClient.js — MQTT Adapter for Jarvis IoT Backend (Stage 2B)
 *
 * Connects to a local Mosquitto broker and exposes a helper to publish
 * device state changes.  All errors are caught and logged so the REST
 * API keeps working even when the broker is down.
 *
 * Topic convention:  home/<deviceId>/set   →  payload "ON" | "OFF"
 *
 * NOTE: This module publishes *commands* to the broker.  There is no
 * ESP32 subscriber yet, so the physical device state is not confirmed.
 * The simulated state in deviceManager.js remains the source of truth
 * for the dashboard until we add firmware that acknowledges commands
 * via a `home/<deviceId>/status` topic in a later stage.
 */

const mqtt = require("mqtt");

// ── Configuration ────────────────────────────────────────────────────
const BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";

// ── Connect ──────────────────────────────────────────────────────────
const client = mqtt.connect(BROKER_URL, {
  reconnectPeriod: 5000,       // retry every 5 s if the broker goes away
  connectTimeout: 10000,       // give up the initial attempt after 10 s
});

// Track connection state so callers can check before publishing.
let connected = false;

client.on("connect", () => {
  connected = true;
  console.log(`📡 MQTT connected to ${BROKER_URL}`);
});

client.on("reconnect", () => {
  console.log("📡 MQTT reconnecting …");
});

client.on("close", () => {
  connected = false;
  console.log("📡 MQTT connection closed");
});

client.on("offline", () => {
  connected = false;
  console.log("📡 MQTT client offline");
});

client.on("error", (err) => {
  // Don't let an MQTT error crash the Express process.
  connected = false;
  console.error("📡 MQTT error:", err.message);
});

// ── Public API ───────────────────────────────────────────────────────

/**
 * Publish a device's resolved state to the broker.
 *
 * @param {string} deviceId  – e.g. "study_light"
 * @param {string} status    – "on" | "off" (from deviceManager)
 * @returns {{ published: boolean, topic: string, payload: string, error?: string }}
 */
function publishDeviceState(deviceId, status) {
  const topic = `home/${deviceId}/set`;
  const payload = status.toUpperCase();          // "ON" | "OFF"

  if (!connected) {
    const msg = "MQTT broker not connected — command was NOT published";
    console.warn(`📡 ${msg}  (topic: ${topic}, payload: ${payload})`);
    return { published: false, topic, payload, error: msg };
  }

  // mqtt.js client.publish is fire-and-forget by default for QoS 0.
  // We use QoS 1 (at-least-once) so the broker ACKs, and wrap the
  // callback in a synchronous-style return by reporting optimistically
  // but logging failures.  A truly async approach would complicate the
  // REST response; we'll revisit if needed.
  let publishError = null;

  client.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) {
      publishError = err;
      console.error(`📡 MQTT publish failed → ${topic}: ${err.message}`);
    } else {
      console.log(`📡 MQTT published → ${topic} : ${payload}`);
    }
  });

  // Because QoS 1 ACK is async, we can't know the result synchronously.
  // We report "published: true" meaning "handed to the client library
  // while connected".  The route layer surfaces the mqtt.connected flag
  // so the caller knows whether the broker was reachable.
  return { published: true, topic, payload };
}

/** Expose connection state for the route layer. */
function isConnected() {
  return connected;
}

module.exports = { publishDeviceState, isConnected };
