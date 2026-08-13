import { readFileSync } from "node:fs";
import { randomInt } from "node:crypto";
import { JSDOM } from "jsdom";

const HOME_URL = "https://www.midasbuy.com/midasbuy/pk/homepage/pubgm";
const MIDAS_ENDPOINT = "https://www.midasbuy.com/interface/getCharac";
const REFERER = "https://www.midasbuy.com/midasbuy/pk/homepage/pubgm";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const APP_ID = "1450015065";
const CACHE_TTL_MS = 5 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 20;
const xmidasContent = readFileSync(new URL("./xmidas_real.js", import.meta.url), "utf8");

const resultCache = new Map();
const rateBuckets = new Map();

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "private, max-age=300",
};

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...jsonHeaders, ...extraHeaders },
    body: JSON.stringify(body),
  };
}

function randomDigits(length) {
  let value = String(randomInt(1, 10));
  while (value.length < length) value += String(randomInt(0, 10));
  return value;
}

function getClientKey(event) {
  const forwarded = event.headers?.["x-forwarded-for"] || event.headers?.["X-Forwarded-For"];
  return forwarded?.split(",")[0]?.trim() || event.headers?.["client-ip"] || "anonymous";
}

function isRateLimited(clientKey) {
  const now = Date.now();
  const existing = rateBuckets.get(clientKey);
  if (!existing || now - existing.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(clientKey, { startedAt: now, count: 1 });
    return false;
  }
  existing.count += 1;
  return existing.count > RATE_LIMIT;
}

function readToken(html, id) {
  const patterns = [
    new RegExp(`id=["']${id}["']\\s+value=["']([^"']+)["']`, "i"),
    new RegExp(`value=["']([^"']+)["']\\s+id=["']${id}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function fetchTokens() {
  const page = await fetch(HOME_URL, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!page.ok) throw new Error(`Midasbuy homepage returned HTTP ${page.status}`);
  const html = await page.text();
  const token = readToken(html, "xMidasToken");
  const version = readToken(html, "xMidasVersion") || "1.0.1";
  if (!token) throw new Error("Midasbuy security token was not found");
  return { token, version };
}

function createPayload(playerId, deviceId, sessionId) {
  return {
    appid: APP_ID,
    currency_type: "PKR",
    country: "PK",
    midasbuyArea: "pk",
    sc: "",
    from: "self.midasbuy_saas",
    pid: "",
    task_token: "",
    shop_id: "",
    pf: "mds_pc_browser-yy-android-midasweb-midasbuy-self.midasbuy_saas",
    zoneid: "1",
    _id: Math.random(),
    drm_info: "",
    shopcode: "midasbuy",
    cgi_extend: {
      device_id: deviceId,
      muid: "",
      risk_device_finger: "",
      tdrc_fp: "",
      pagetoken: "",
    },
    buyType: "recharge",
    shortId: playerId,
    cgi_extend_obj: {},
    openid: playerId,
    area_id: "1",
    zone_id: "1",
    plat_id: "0",
    __product_id: "1",
    extra: {
      session_id: sessionId,
      accept_lang: "en",
      return_url: "https://www.midasbuy.com/h5/overseah5/views/riskcontrol/landing.html",
      website_country: "pk",
    },
  };
}

function createDom(token, version) {
  const dom = new JSDOM(
    `<!doctype html><html><head><input type="hidden" id="xMidasToken" value="${token}"><input type="hidden" id="xMidasVersion" value="${version}"></head><body></body></html>`,
    {
      url: "https://www.midasbuy.com/common-sdk?id=playerid_enter&appid=1450015065&country=pk&shopcode=midasbuy",
      referrer: REFERER,
      userAgent: USER_AGENT,
      runScripts: "dangerously",
      resources: "usable",
    },
  );

  const { window } = dom;
  const setGlobal = (name, value) => {
    try {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        enumerable: true,
        writable: true,
        value,
      });
    } catch {
      try { globalThis[name] = value; } catch { /* read-only runtime global */ }
    }
  };

  setGlobal("window", window);
  setGlobal("document", window.document);
  setGlobal("navigator", window.navigator);
  setGlobal("location", window.location);
  setGlobal("screen", window.screen);
  setGlobal("history", window.history);
  setGlobal("Element", window.Element);
  setGlobal("Node", window.Node);
  setGlobal("localStorage", window.localStorage);
  setGlobal("sessionStorage", window.sessionStorage);
  setGlobal("self", window);
  setGlobal("btoa", (value) => Buffer.from(value).toString("base64"));
  setGlobal("atob", (value) => Buffer.from(value, "base64").toString("binary"));

  const originalToString = Function.prototype.toString;
  Function.prototype.toString = function toString() {
    if (this === window.HTMLCanvasElement.prototype.getContext) return "function getContext() { [native code] }";
    if (this === window.HTMLCanvasElement.prototype.toDataURL) return "function toDataURL() { [native code] }";
    if (this === window.requestAnimationFrame) return "function requestAnimationFrame() { [native code] }";
    return originalToString.call(this);
  };

  try {
    Object.defineProperties(window.navigator, {
      platform: { value: "Win32", configurable: true },
      hardwareConcurrency: { value: 8, configurable: true },
      deviceMemory: { value: 8, configurable: true },
      webdriver: { value: false, configurable: true },
      languages: { value: ["en-US", "en"], configurable: true },
      appVersion: { value: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", configurable: true },
      vendor: { value: "Google Inc.", configurable: true },
      plugins: { value: { length: 0 }, configurable: true },
    });
  } catch {
    // Some JSDOM versions expose non-configurable navigator properties.
  }

  window.HTMLCanvasElement.prototype.getContext = function getContext() {
    return {
      fillRect() {}, clearRect() {},
      getImageData: (x, y, width, height) => ({ data: new Uint8ClampedArray(width * height * 4) }),
      putImageData() {}, createImageData: () => [], setTransform() {}, drawImage() {},
      save() {}, fillText() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {},
      closePath() {}, stroke() {}, translate() {}, scale() {}, rotate() {}, arc() {},
      fill() {}, measureText: () => ({ width: 0 }), transform() {}, rect() {}, clip() {},
    };
  };
  window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,";
  window.chrome = { runtime: {} };
  window.requestAnimationFrame = (callback) => setTimeout(callback, 16);
  window.cancelAnimationFrame = (id) => clearTimeout(id);

  const script = window.document.createElement("script");
  script.textContent = xmidasContent;
  window.document.head.appendChild(script);

  try {
    window.xMidas();
  } catch {
    // The SDK may initialize lazily; the signing call below remains authoritative.
  }
  return dom;
}

async function encryptPayload(payload, token, version) {
  const dom = createDom(token, version);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    if (typeof window.xMidas !== "function") throw new Error("xMidas was not initialized");
    const raw = window.xMidas({ d: JSON.stringify(payload) });
    if (!raw || typeof raw !== "string") throw new Error("xMidas returned an empty signature");
    const bytes = raw.match(/../g).map((hex) => Number.parseInt(hex, 16));
    return {
      encrypt_msg: Buffer.from(bytes).toString("base64"),
      ctoken: token,
      ctoken_ver: version,
    };
  } finally {
    dom.window.close();
  }
}

function decodeName(value) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function lookup(playerId) {
  const cached = resultCache.get(playerId);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return { ...cached.result, cached: true };
  if (cached) resultCache.delete(playerId);

  const { token, version } = await fetchTokens();
  const deviceId = randomDigits(30);
  const sessionId = randomDigits(36);
  const payload = createPayload(playerId, deviceId, sessionId);
  const encrypted = await encryptPayload(payload, token, version);
  const requestData = { ...payload, ...encrypted };

  const remote = await fetch(MIDAS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Origin: "https://www.midasbuy.com",
      Referer: REFERER,
      "User-Agent": USER_AGENT,
      Cookie: `midasbuyDeviceId=${deviceId}; select_cookie=1; select_country=pk; shopcode=midasbuy; country=pk; UUID=${sessionId}`,
    },
    body: JSON.stringify(requestData),
  });
  const remoteJson = await remote.json();
  if (!remote.ok) throw new Error(`Midasbuy lookup returned HTTP ${remote.status}`);

  if (remoteJson.ret !== 0) {
    return {
      success: false,
      player_id: playerId,
      error: remoteJson.msg || "Midasbuy rejected the lookup",
      ret: remoteJson.ret,
    };
  }

  const info = remoteJson.info || {};
  const result = {
    success: true,
    player_id: playerId,
    name: decodeName(info.charac_name),
    openid: info.openid,
    zoneid: info.zoneid,
  };
  resultCache.set(playerId, { savedAt: Date.now(), result });
  return result;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return response(204, null);
  if (event.httpMethod !== "GET") return response(405, { success: false, error: "Method not allowed" }, { Allow: "GET, OPTIONS" });

  const playerId = String(event.queryStringParameters?.id || "").trim();
  if (!/^\d{6,20}$/.test(playerId)) {
    return response(400, { success: false, error: "Player ID must contain 6 to 20 digits." });
  }
  if (isRateLimited(getClientKey(event))) {
    return response(429, { success: false, error: "Too many lookup requests. Please wait a minute and try again." }, { "Retry-After": "60" });
  }

  try {
    return response(200, await lookup(playerId));
  } catch (error) {
    console.error("Player lookup failed", error);
    const detail = process.env.NODE_ENV === "production"
      ? undefined
      : error instanceof Error
        ? error.message
        : String(error);
    return response(502, {
      success: false,
      error: "The player lookup service is temporarily unavailable.",
      ...(detail ? { detail } : {}),
    });
  }
};
