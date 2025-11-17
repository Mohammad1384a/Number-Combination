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
function chooseGroupIndices(groupsLength, length) {
  const result = [];

  // basic sanity checks
  if (length <= 0 || length > groupsLength) {
    return result;
  }

  const combo = new Array(length);

  // state variables
  let phase = 0; // "Build the first combination"(0) -> "push the combination to resut"(1)
  //   -> "find the position to increment and get to the next combination"(2)
  // -> "after incrementing find the order"(3)
  //for step 0
  let initIndex = 0;
  //for step 2 the default index to get started with is the last one
  let indexToIncrement = -1;
  //for step 3
  let resetIndex = -1;

  // single loop for the whole algorithm can use for(;;) as well
  while (true) {
    //first combo phase
    if (phase === 0) {
      // first fill the combination with each index as the value [0,1,2...,k-1]
      combo[initIndex] = initIndex;
      initIndex++;

      if (initIndex === length) {
        //after generating the first combination push it to resutl and go for finding the right position to increment
        phase = 1;
      }
      continue;
    }
    //search for the position from right
    if (phase === 1) {
      // save the current combination
      result.push(combo.slice());

      indexToIncrement = length - 1;
      phase = 2;
      continue;
    }

    if (phase === 2) {
      // nothing left
      if (indexToIncrement < 0) {
        break;
      }

      // the maximum value a position can take
      const maxAtPos = groupsLength - (length - indexToIncrement);
      if (combo[indexToIncrement] === maxAtPos) {
        indexToIncrement--;
        continue;
      }

      // we can bump this position
      combo[indexToIncrement]++;
      resetIndex = indexToIncrement + 1;
      phase = 3;
      continue;
    }

    if (phase === 3) {
      // reset all positions to the right to be just after the previous one
      if (resetIndex >= length) {
        // tail is fixed, emit the next combination on next iteration
        phase = 1;
        continue;
      }

      combo[resetIndex] = combo[resetIndex - 1] + 1;
      resetIndex++;
      continue;
    }
  }

  return result;
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
  combos.sort((a, b) => a.join(",").localeCompare(b.join(",")));
  return combos;
}
