import { handler } from "./netlify/functions/query.mjs";

const ids = ["5333302466", "52464227951", "51571680977", "52151352992", "5920828320"];

for (const id of ids) {
  const result = await handler({
    httpMethod: "GET",
    queryStringParameters: { id },
    headers: { "x-forwarded-for": "127.0.0.1" },
  });
  console.log(JSON.stringify({ id, statusCode: result.statusCode, body: JSON.parse(result.body) }));
}
