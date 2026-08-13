import { handler } from "./netlify/functions/query.mjs";

const result = await handler({
  httpMethod: "GET",
  headers: { "x-forwarded-for": "127.0.0.1" },
  queryStringParameters: { id: "5333302466" },
});

console.log(JSON.stringify({ statusCode: result.statusCode, body: JSON.parse(result.body) }, null, 2));
