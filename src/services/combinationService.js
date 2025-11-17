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
// used for loop O(n) instread of recursion
function chooseGroupIndices(n, k) {
  if (k < 0 || k > n) return [];
  if (k === 0) return [[]];

  const res = [];
  // initial combination: [0,1,...,k-1]
  const comb = Array.from({ length: k }, (_, i) => i);

  while (true) {
    res.push(comb.slice());

    // generate next combination in lexicographic order
    let i = k - 1;
    while (i >= 0 && comb[i] === n - k + i) i--;
    if (i < 0) break;

    comb[i]++;
    for (let j = i + 1; j < k; j++) comb[j] = comb[j - 1] + 1;
  }
  return res;
}

/**
 * Cartesian product of arrays, preserving order.
 * [["A1","A2"], ["B1"], ["C1","C2"]] ->
 *   ["A1","B1","C1"], ["A1","B1","C2"], ["A2","B1","C1"], ["A2","B1","C2"]
 */
//used for loop O(n) instread of reduce
function product(arrays) {
  if (arrays.length === 0) return [];
  let acc = [[]];
  for (let i = 0; i < arrays.length; i++) {
    const next = [];
    for (let a = 0; a < acc.length; a++) {
      for (let c = 0; c < arrays[i].length; c++) {
        next.push([...acc[a], arrays[i][c]]);
      }
    }
    acc = next;
  }
  return acc;
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
