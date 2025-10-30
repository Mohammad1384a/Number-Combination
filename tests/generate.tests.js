import request from "supertest";
import { pool } from "../src/db.js";
import appFactory from "./testServerFactory.js";

const app = await appFactory();

afterAll(async () => {
  await pool.end();
});

describe("POST /generate", () => {
  test("400 on invalid body", async () => {
    const res = await request(app).post("/generate").send({ items: "nope" });
    expect(res.status).toBe(400);
  });

  test("returns correct combos for [1,2,1], length=2", async () => {
    const res = await request(app)
      .post("/generate")
      .send({ items: [1, 2, 1], length: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(Array.isArray(res.body.combination)).toBe(true);

    const combos = res.body.combination.map((x) => x.join("|"));
    expect(combos).toEqual(["A1|B1", "A1|B2", "A1|C1", "B1|C1", "B2|C1"]);
  });
});
