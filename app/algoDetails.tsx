const algoDetails = {
  "Bubble Sort": {
    description: 
    `Bubble Sort repeatedly swaps adjacent elements if they are in the wrong order. 

Algorithm:
------------
bubbleSort(array) 
    for i <- 1 to sizeOfArray - 1 
        for j <- 1 to sizeOfArray - 1 - i 
            if leftElement > rightElement 
                swap leftElement and rightElement 
    end bubbleSort.

Time Complexity: O(n^2).`,
    videoId: "nmhjrI-aW5o",
    problemLink: "https://codeforces.com/problemset/problem/339/A",
  },
  "Selection Sort": {
    description: `Selection Sort finds the minimum element and places it at the beginning. 

Algorithm:
------------
selectionSort(array, size)
    for i from 0 to size - 1 do
        set i as the index of the current minimum
        for j from i + 1 to size - 1 do
        if array[j] < array[current minimum]
            set j as the new current minimum index
        if current minimum is not i
        swap array[i] with array[current minimum]
    end selectionSort

Time Complexity: O(n^2).`,
    videoId: "Ns4LCeeOFS4",
    problemLink: "https://leetcode.com/problems/sort-an-array/",
  },
  "Insertion Sort": {
    description: `Insertion Sort builds the final sorted array one item at a time. 

Algorithm:
------------
insertionSort(array)
    mark first element as sorted
    for each unsorted element X
        'extract' the element X
        for j <- lastSortedIndex down to 0
        if current element j > X
            move sorted element to the right by 1
        break loop and insert X here
    end insertionSort


Time Complexity: O(n^2).`,
    videoId: "OGzPmgsI-pQ",
    problemLink: "https://leetcode.com/problems/insertion-sort-list/",
  },
  "Linear Search": {
    description: `Linear Search sequentially checks each element. 

Algorithm:
-------------
LinearSearch(array, key)
  for each item in the array
    if item == value
      return its index

Time Complexity: O(n).`,
    videoId: "C46QfTjVCNU",
    problemLink: "https://www.hackerearth.com/practice/algorithms/searching/linear-search/practice-problems/algorithm/find-mex-62916c25/",
  },
  "Binary Search": {
    description: `Binary Search repeatedly divides the search interval in half. 

Algorithm:
------------
while low <= high
    mid = (low + high)/2
    if (x == arr[mid])
        return mid
    else if (x > arr[mid]) // x is on the right side
        low = mid + 1
    else                       // x is on the left side
        high = mid - 1

Time Complexity: O(log n).`,
    videoId: "P3YID7liBug",
    problemLink: "https://leetcode.com/problems/binary-search/",
  },
  "Ternary Search": {
    description: `Ternary Search divides the array into three parts and reduces the search space. 

Algorithm:
------------
ternarySearch(array, start, end, key)
Begin
   if start <= end then
      midFirst := start + (end - start) /3
      midSecond := midFirst + (end - start) / 3
      if array[midFirst] = key then
         return midFirst
      if array[midSecond] = key then
         return midSecond
      if key < array[midFirst] then
         call ternarySearch(array, start, midFirst-1, key)
      if key > array[midSecond] then
         call ternarySearch(array, midFirst+1, end, key)
      else
         call ternarySearch(array, midFirst+1, midSecond-1, key)
   else
      return invalid location
End

Time Complexity: O(log n).`,
    videoId: "WyWL1PBNvb8",
    problemLink: "https://codeforces.com/problemset/problem/378/A",
  },
  "Depth First Search (DFS)": {
    description: `DFS explores as far as possible along each branch before backtracking.

Algorithm:
------------
DFS(G, u)
    u.visited = true
    for each v ∈ G.Adj[u]
        if v.visited == false
            DFS(G,v)
     
init() {
    For each u ∈ G
        u.visited = false
     For each u ∈ G
       DFS(G, u)
}
`,
    videoId: "Qzf1a--rhp8",
    problemLink: "https://leetcode.com/problems/number-of-islands/",
  },
  "Breadth First Search (BFS)": {
    description: `BFS explores all neighbors at the present depth before moving on to nodes at the next depth.

Algorithm:
------------
create a queue Q 
mark v as visited and put v into Q 
while Q is non-empty 
    remove the head u of Q 
    mark and enqueue all (unvisited) neighbours of u
`,
    videoId: "oDqjPvD54Ss",
    problemLink: "https://leetcode.com/problems/word-ladder/",
  },
  "Dijkstra’s Algorithm": {
    description: `Dijkstra’s algorithm finds the shortest path in a weighted graph with non-negative edges.

Algorithm:
------------
function dijkstra(G, S)
    for each vertex V in G
        distance[V] <- infinite
        previous[V] <- NULL
        If V != S, add V to Priority Queue Q
    distance[S] <- 0
	
    while Q IS NOT EMPTY
        U <- Extract MIN from Q
        for each unvisited neighbour V of U
            tempDistance <- distance[U] + edge_weight(U, V)
            if tempDistance < distance[V]
                distance[V] <- tempDistance
                previous[V] <- U
    return distance[], previous[]
`,
    videoId: "GazC3A4OQTE",
    problemLink: "https://leetcode.com/problems/network-delay-time/",
  },
  "Memoization": {
    description: `The dynamic programming approach stores the results of the subproblems so they are not recalculated. This is called memoization (a top-down approach).

Algorithm:
------------
Create an array (or a hash map) to store the results.

In the recursive function, before making the recursive calls, check if the result for the current input n is already in your storage. If it is, return the stored value.

If the value isn't stored, calculate it, store it, and then return it.
`,
    videoId: "ZBHKZF5w4YU",
    problemLink: "https://codeforces.com/problemset/problem/55/D",
  },
  "Longest Increasing Subsequence (LIS)": {
    description: `LIS finds the longest subsequence where elements are strictly increasing.

Algorithm:
------------
The tabulation approach for finding the Longest Increasing Subsequence (LIS) solves the problem iteratively in a bottom-up manner. The idea is to maintain a 1D array lis[], where lis[i] stores the length of the longest increasing subsequence that ends at index i. Initially, each element in lis[] is set to 1, as the smallest possible subsequence for any element is the element itself.

The algorithm then iterates over each element of the array. For each element arr[i], it checks all previous elements arr[0] to arr[i-1]. If arr[i] is greater than arr[prev] (ensuring the subsequence is increasing), it updates lis[i] to the maximum of its current value or lis[prev] + 1, indicating that we can extend the subsequence ending at arr[prev] by including arr[i].

Finally, the length of the longest increasing subsequence is the maximum value in the lis[] array.
`,
    videoId: "odrfUCS9sQk",
    problemLink: "https://leetcode.com/problems/longest-increasing-subsequence/",
  },
  "Longest Common Subsequence (LCS)": {
    description: `LCS finds the longest subsequence common to two sequences.

Algorithm:
------------
X and Y be two given sequences
Initialize a table LCS of dimension X.length * Y.length
X.label = X
Y.label = Y
LCS[0][] = 0
LCS[][0] = 0
Start from LCS[1][1]
Compare X[i] and Y[j]
    If X[i] = Y[j]
        LCS[i][j] = 1 + LCS[i-1, j-1]   
        Point an arrow to LCS[i][j]
    Else
        LCS[i][j] = max(LCS[i-1][j], LCS[i][j-1])
        Point an arrow to max(LCS[i-1][j], LCS[i][j-1])
`,
    videoId: "Ua0GhsJSlWM",
    problemLink: "https://leetcode.com/problems/longest-common-subsequence/",
  },
  "Rabin-Karp Algorithm": {
    description:`Rabin-Karp uses hashing to find patterns in strings. 

Algorithm:
------------
n = t.length
m = p.length
h = dm-1 mod q
p = 0
t0 = 0
for i = 1 to m
    p = (dp + p[i]) mod q
    t0 = (dt0 + t[i]) mod q
for s = 0 to n - m
    if p = ts
        if p[1.....m] = t[s + 1..... s + m]
            print "pattern found at position" s
    If s < n-m
        ts + 1 = (d (ts - t[s + 1]h) + t[s + m + 1]) mod q

Average Time Complexity: O(n+m).`,
    videoId: "qQ8vS2btsxI",
    problemLink: "https://leetcode.com/problems/implement-strstr/",
  },
  "KMP Algorithm": {
    description: `KMP is a linear-time string matching algorithm using prefix function.

Algorithm:
------------
The KMP algorithm works in two main steps:

1. Preprocessing Step – Build the LPS Array:
------------------------------------------------
i.      First, we process the pattern to create an array called LPS (Longest Prefix Suffix).
ii.     This array tells us: "If a mismatch happens at this point, how far back in the pattern can we jump without missing any potential matches?"
iii.    It helps us avoid starting from the beginning of the pattern again after a mismatch.
iv.     This step is done only once, before we start searching in the text.

2. Matching Step – Search the Pattern in the Text
------------------------------------------------------
i.      Now, we start comparing the pattern with the text, one character at a time.
ii.     If the characters match: Move forward in both the text and the pattern.
iii.    If the characters don’t match:
    => If we're not at the start of the pattern, we use the LPS value at the previous index (i.e., lps[j - 1]) to move the pattern pointer j back to that position. This means: jump to the longest prefix that is also a suffix — no need to recheck those characters.
    => If we're at the start (i.e., j == 0), simply move the text pointer i forward to try the next character.
iv. If we reach the end of the pattern (i.e., all characters matched), we found a match! Record the starting index and continue searching.
`,
    videoId: "JoF0Z7nVSrA",
    problemLink: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
  },
  Trie: {
    description: `Trie is a tree-like data structure used for efficient string retrieval.

Algorithm:
------------
    1. Search (word): To check if the string 'word' is present in the Trie or not.
    2. Insert (word): To insert a string 'word' in the Trie.
    3. Start With(word): To check if there is a string that has the prefix 'word'.

Trie is a data structure that is like a tree data structure in its organisation. It consists of nodes that store letters or alphabets of words, which can be added, retrieved, and deleted from it in a very efficient way.
`,
    videoId: "zIjfhVPRZCg",
    problemLink: "https://leetcode.com/problems/implement-trie-prefix-tree/",
  },
};

export default algoDetails;