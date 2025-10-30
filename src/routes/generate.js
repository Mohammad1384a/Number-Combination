import express from "express";
import { pool } from "../db.js";
import { generateCombinations } from "../services/combinationService.js";

const router = express.Router();

/**
 * @openapi
 * /generate:
 *   post:
 *     summary: Generate combinations and store them (transactional).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, length]
 *             properties:
 *               items:
 *                 type: array
 *                 items: { type: number }
 *               length:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Stored combinations with response id.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 combination:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items: { type: string }
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/generate", async (req, res) => {
  const { items, length } = req.body || {};
  if (!Array.isArray(items) || typeof length !== "number" || length < 1) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const combos = generateCombinations(items, length); // plug real logic later

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Upsert items table for every code referenced in combos
    // For now, infer item codes from combos; when your generator is real, it’ll return codes.
    const allCodes = [...new Set(combos.flat())];
    for (const code of allCodes) {
      await conn.execute(
        "INSERT INTO items (code) VALUES (?) ON DUPLICATE KEY UPDATE code = code",
        [code]
      );
    }

    // 2) Insert response row; capture id
    const payload = { combination: combos };
    const [respResult] = await conn.execute(
      "INSERT INTO responses (payload_json) VALUES (JSON_OBJECT())"
    );
    const responseId = respResult.insertId;

    // 3) Insert combinations + combination_items
    for (const combo of combos) {
      const [combResult] = await conn.execute(
        "INSERT INTO combinations (response_id) VALUES (?)",
        [responseId]
      );
      const combinationId = combResult.insertId;

      // map codes -> item ids
      const itemRows = await conn.query(
        `SELECT id, code FROM items WHERE code IN (${combo
          .map(() => "?")
          .join(",")})`,
        combo
      );
      const idByCode = new Map(itemRows[0].map((r) => [r.code, r.id]));

      // insert ordered items
      for (let i = 0; i < combo.length; i++) {
        await conn.execute(
          "INSERT INTO combination_items (combination_id, item_id, pos) VALUES (?,?,?)",
          [combinationId, idByCode.get(combo[i]), i]
        );
      }
    }

    // 4) Update response payload once we know IDs
    await conn.execute("UPDATE responses SET payload_json = ? WHERE id = ?", [
      JSON.stringify({ id: responseId, combination: combos }),
      responseId,
    ]);

    await conn.commit();

    return res.json({ id: responseId, combination: combos });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  } finally {
    conn.release();
  }
});

export default router;
