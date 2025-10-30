/**
 * Build catalog groups from the numeric array.
 * items[i] = count of letter group (A + i), e.g. [1,2,1] -> A1 | B1,B2 | C1
 * Returns: Array<Array<string>>, e.g. [ ["A1"], ["B1","B2"], ["C1"] ]
 */
function buildGroups(items) {
  const groups = [];
  for (let i = 0; i < items.length; i++) {
    const letter = String.fromCharCode("A".charCodeAt(0) + i);
    const count = items[i] | 0;
    if (count <= 0) continue;
    const arr = [];
    for (let n = 1; n <= count; n++) arr.push(`${letter}${n}`);
    groups.push(arr);
  }
  return groups;
}

/**
 * Choose k distinct group indices out of N (combinations of indices).
 * Returns: number[][] (each inner array is ascending indices)
 */
function chooseGroupIndices(n, k, start = 0, picked = [], out = []) {
  if (picked.length === k) {
    out.push(picked.slice());
    return out;
  }
  for (let i = start; i <= n - (k - picked.length); i++) {
    picked.push(i);
    chooseGroupIndices(n, k, i + 1, picked, out);
    picked.pop();
  }
  return out;
}

/**
 * Cartesian product of arrays, preserving order.
 * [["A1","A2"], ["B1"], ["C1","C2"]] ->
 *   ["A1","B1","C1"], ["A1","B1","C2"], ["A2","B1","C1"], ["A2","B1","C2"]
 */
function product(arrays) {
  if (arrays.length === 0) return [];
  return arrays.reduce(
    (acc, cur) => {
      const next = [];
      for (const a of acc) for (const c of cur) next.push([...a, c]);
      return next;
    },
    [[]]
  );
}

/**
 * Generate all valid combinations:
 * - Pick exactly `length` distinct letter-groups (A,B,C,...)  (no same-prefix rule)
 * - From each chosen group, pick exactly one item.
 * Returns array<string[]> like: [ ["A1","B1"], ["A1","B2"], ... ]
 */
export function generateCombinations(items, length) {
  if (!Array.isArray(items) || typeof length !== "number" || length < 1)
    return [];

  const groups = buildGroups(items);
  if (groups.length === 0 || length > groups.length) return [];

  // 1) choose which groups to use
  const indexSets = chooseGroupIndices(groups.length, length);

  // 2) for each chosen set, take the cartesian product of the corresponding groups
  const combos = [];
  for (const idxSet of indexSets) {
    const chosenGroups = idxSet.map((i) => groups[i]);
    const prods = product(chosenGroups);
    combos.push(...prods);
  }

  // Optional: stable sort for deterministic outputs (lexicographic by joined string)
  combos.sort((a, b) => a.join(",").localeCompare(b.join(",")));
  return combos;
}
