import { handler } from "./netlify/functions/query.mjs";

const testCases = [
  ["5333302466", "I'ｍＧｒｏｏｔ"],
  ["52464227951", "mohsinali5335"],
  ["51571680977", "人Murشد父"],
  ["52151352992", "『71』HUÑTER"],
  ["5920828320", "NȘAȘFȘAș"],
];

for (const [id, expectedName] of testCases) {
  const result = await handler({
    httpMethod: "GET",
    headers: { "x-forwarded-for": "127.0.0.1" },
    queryStringParameters: { id },
  });
  const body = JSON.parse(result.body);
  const passed = result.statusCode === 200 && body.success === true && body.name === expectedName;
  console.log(JSON.stringify({ id, expectedName, statusCode: result.statusCode, body, passed }, null, 2));
  if (!passed) process.exitCode = 1;
}
