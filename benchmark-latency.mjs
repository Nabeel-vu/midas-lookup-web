import { performance } from "node:perf_hooks";

const modulePath = process.argv[2] || "./netlify/functions/query.mjs";
const { handler } = await import(new URL(modulePath, import.meta.url));
const ids = ["5333302466", "52464227951", "51571680977", "52151352992", "5920828320"];
const timings = [];
const startedAt = performance.now();

for (const id of ids) {
  const requestStartedAt = performance.now();
  const result = await handler({
    httpMethod: "GET",
    headers: { "x-forwarded-for": "benchmark-client" },
    queryStringParameters: { id },
  });
  const body = JSON.parse(result.body);
  timings.push({
    id,
    elapsedMs: Math.round(performance.now() - requestStartedAt),
    statusCode: result.statusCode,
    success: body.success === true,
    cached: body.cached === true,
  });
}

const cachedStartedAt = performance.now();
await handler({
  httpMethod: "GET",
  headers: { "x-forwarded-for": "benchmark-client" },
  queryStringParameters: { id: ids[0] },
});

console.log(JSON.stringify({
  modulePath,
  timings,
  cachedLookupMs: Math.round(performance.now() - cachedStartedAt),
  totalMs: Math.round(performance.now() - startedAt),
}, null, 2));
