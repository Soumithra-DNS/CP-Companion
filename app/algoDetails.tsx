type AlgoDetail = {
  description: string;
  videoId?: string;
  problemLink?: string;
};

const algoDetails: Record<string, AlgoDetail> = {
  "Bubble Sort": {
    description: `Repeatedly step through the list, compare adjacent elements and swap them if they are in the wrong order. After each full pass the largest remaining element is placed at the end.

Algorithm (Pseudocode):
function bubbleSort(arr):
  n = length(arr)
  for i = 0 to n-2:
    swapped = false
    // Last i elements are already in place
    for j = 0 to n-2-i:
      if arr[j] > arr[j+1]:
        swap(arr[j], arr[j+1])
        swapped = true
    // If no two elements were swapped
    // in inner loop, then array is sorted
    if not swapped:
      break

Time complexity: O(n^2) worst/average, O(n) best (with optimization)
Space complexity: O(1)`,
    videoId: "nmhjrI-aW5o",
    problemLink: "https://codeforces.com/problemset/problem/339/A",
  },

  "Selection Sort": {
    description: `Find the minimum element from the unsorted portion and move it to the front. Fewer swaps than bubble sort but still O(n^2).

Algorithm (Pseudocode):
function selectionSort(arr):
  n = length(arr)
  for i = 0 to n-2:
    // Find the minimum element in unsorted array
    minIndex = i
    for j = i+1 to n-1:
      if arr[j] < arr[minIndex]:
        minIndex = j
        
    // Swap the found minimum element with the first element
    swap(arr[i], arr[minIndex])

Time complexity: O(n^2)
Space complexity: O(1)`,
    videoId: "Ns4LCeeOFS4",
    problemLink: "https://leetcode.com/problems/sort-an-array/",
  },

  "Insertion Sort": {
    description: `Builds a sorted portion at the front by inserting each new element into its correct position.

Algorithm (Pseudocode):
function insertionSort(arr):
  n = length(arr)
  for i = 1 to n-1:
    key = arr[i]
    j = i - 1
    
    // Move elements of arr[0..i-1], that are
    // greater than key, to one position ahead
    // of their current position
    while j >= 0 and arr[j] > key:
      arr[j + 1] = arr[j]
      j = j - 1
    arr[j + 1] = key

Time complexity: O(n^2) worst, O(n) best (already sorted)
Space complexity: O(1)`,
    videoId: "OGzPmgsI-pQ",
    problemLink: "https://leetcode.com/problems/insertion-sort-list/",
  },

  "Linear Search": {
    description: `Scan elements one by one until the target is found. Simple but O(n) time.

Algorithm (Pseudocode):
function linearSearch(arr, target):
  n = length(arr)
  for i = 0 to n-1:
    if arr[i] == target:
      return i  // Return index of found element
  return -1 // Element not found

Time complexity: O(n)
Space complexity: O(1)`,
    videoId: "C46QfTjVCNU",
    problemLink: "https://www.hackerearth.com/practice/algorithms/searching/linear-search/practice-problems/algorithm/find-mex-62916c25/",
  },

  "Binary Search": {
    description: `Efficient search on a sorted array by repeatedly halving the search interval.

Algorithm (Iterative Pseudocode):
function binarySearch(sortedArr, target):
  low = 0
  high = length(sortedArr) - 1
  
  while low <= high:
    mid = floor((low + high) / 2)
    
    if sortedArr[mid] == target:
      return mid // Found
    else if sortedArr[mid] < target:
      low = mid + 1
    else: // sortedArr[mid] > target
      high = mid - 1
      
  return -1 // Not found

Time complexity: O(log n)
Space complexity: O(1)`,
    videoId: "P3YID7liBug",
    problemLink: "https://leetcode.com/problems/binary-search/",
  },

  "Ternary Search": {
    description: `Divide the search interval into three parts and determine which segment contains the target. Useful for finding the maximum or minimum of a unimodal function.

Algorithm (Pseudocode for finding max of unimodal function):
function ternarySearch(f, low, high):
  // f is the unimodal function
  // We are searching in the integer range [low, high]
  
  while (high - low) > 2: // Or a small epsilon for real numbers
    m1 = low + floor((high - low) / 3)
    m2 = high - floor((high - low) / 3)
    
    if f(m1) < f(m2):
      low = m1 // The max is in [m1, high]
    else:
      high = m2 // The max is in [low, m2]
      
  // Post-processing: check the remaining small range [low, high]
  maxVal = f(low)
  maxIndex = low
  for i = low+1 to high:
    if f(i) > maxVal:
      maxVal = f(i)
      maxIndex = i
  return maxIndex

Time complexity: O(log n)
Space complexity: O(1)`,
    videoId: "WyWL1PBNvb8",
    problemLink: "https://codeforces.com/problemset/problem/378/A",
  },

  "Depth First Search (DFS)": {
    description: `Explore as far as possible along each branch before backtracking. Useful for connectivity, topological sort, and many graph problems.

Algorithm (Recursive Pseudocode):
// Global or persistent 'visited' set/array
visited = new Set()

function DFS(graph, startNode):
  // Wrapper function to start the search
  _DFS_recursive(graph, startNode)

function _DFS_recursive(graph, u):
  visited.add(u)
  // Process node u (e.g., add to a list)
  
  for each neighbor v of u in graph:
    if not visited.has(v):
      _DFS_recursive(graph, v)

Time complexity: O(V + E)
Space complexity: O(V) (recursion stack)`,
    videoId: "Qzf1a--rhp8",
    problemLink: "https://leetcode.com/problems/number-of-islands/",
  },

  "Breadth First Search (BFS)": {
    description: `Explore neighbors level by level using a queue. Useful for shortest path on unweighted graphs and layering.

Algorithm (Pseudocode):
function BFS(graph, startNode):
  queue = new Queue()
  visited = new Set()
  
  queue.enqueue(startNode)
  visited.add(startNode)
  
  while queue is not empty:
    u = queue.dequeue()
    // Process node u
    
    for each neighbor v of u in graph:
      if not visited.has(v):
        visited.add(v)
        queue.enqueue(v)

Time complexity: O(V + E)
Space complexity: O(V)`,
    videoId: "oDqjPvD54Ss",
    problemLink: "https://leetcode.com/problems/word-ladder/",
  },

  "Dijkstra's Algorithm": {
    description: `Finds shortest paths from a source to all vertices in a graph with non-negative edge weights using a priority queue.

Algorithm (Pseudocode):
function Dijkstra(graph, source):
  // 1. Initialization
  dist = new Map() // Stores shortest distance from source
  pq = new PriorityQueue() // Min-priority queue (stores [distance, vertex])

  for each vertex v in graph:
    dist[v] = INFINITY
  
  dist[source] = 0
  pq.add([0, source])

  // 2. Main loop
  while pq is not empty:
    [d, u] = pq.extractMin() // d = distance, u = vertex
    
    // Optimization: if we already found a shorter path, skip
    if d > dist[u]:
      continue 
    
    // 3. Relax neighbors
    for each neighbor v of u with edge weight w:
      newDist = dist[u] + w
      if newDist < dist[v]:
        dist[v] = newDist
        pq.add([newDist, v])
                    
  return dist

Time complexity: O((V+E) log V) with binary heap
Space complexity: O(V)`,
    videoId: "GazC3A4OQTE",
    problemLink: "https://leetcode.com/problems/network-delay-time/",
  },

  "Memoization": {
    description: `Top-down dynamic programming: cache results of expensive function calls to avoid recomputation.

Algorithm (Pattern using Fibonacci as example):
// 1. Create a cache/memo
memo = new Map()

function fib(n):
  // 2. Base cases
  if n <= 1:
    return n
    
  // 3. Check cache
  if memo.has(n):
    return memo.get(n)
    
  // 4. Compute and store
  result = fib(n - 1) + fib(n - 2)
  memo.set(n, result)
  
  // 5. Return result
  return result

Time complexity: O(n) for Fibonacci (reduces from O(2^n))
Space complexity: O(n) (for cache and recursion stack)`,
    videoId: "ZBHKZF5w4YU",
    problemLink: "https://codeforces.com/problemset/problem/55/D",
  },

  "Longest Increasing Subsequence (LIS)": {
    description: `Finds the longest strictly increasing subsequence. Common approaches: O(n^2) DP or O(n log n) patience sorting using a tails array.

Algorithm (O(n^2) DP):
function LIS_N_Squared(arr):
  n = length(arr)
  dp = new Array(n) initialized to 1
  
  for i = 1 to n-1:
    for j = 0 to i-1:
      if arr[i] > arr[j] and dp[i] < dp[j] + 1:
        dp[i] = dp[j] + 1
        
  return max(dp)

Algorithm (O(n log n) Binary Search):
function LIS_N_Log_N(arr):
  // 'tails' array stores the smallest tail of all increasing
  // subsequences with length i+1
  tails = [] 
  
  for num in arr:
    // Find first element in 'tails' >= num (binary search)
    i = binarySearch_lowerBound(tails, num) 
    
    if i == length(tails):
      tails.push(num)
    else:
      tails[i] = num
      
  return length(tails)

Time complexity: O(n^2) or O(n log n)
Space complexity: O(n)`,
    videoId: "odrfUCS9sQk",
    problemLink: "https://leetcode.com/problems/longest-increasing-subsequence/",
  },

  "Longest Common Subsequence (LCS)": {
    description: `Find the longest subsequence present in both sequences. Classic DP builds a 2D table where dp[i][j] = LCS length for prefixes.

Algorithm (Pseudocode):
function LCS(str1, str2):
  n = length(str1)
  m = length(str2)
  // dp[i][j] = LCS of str1[0..i-1] and str2[0..j-1]
  dp = new 2D_Array(n + 1, m + 1) initialized to 0
  
  for i = 1 to n:
    for j = 1 to m:
      if str1[i - 1] == str2[j - 1]:
        // Characters match
        dp[i][j] = 1 + dp[i - 1][j - 1]
      else:
        // Characters don't match
        dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        
  return dp[n][m]

Time complexity: O(n*m)
Space complexity: O(n*m) (can be optimized to O(min(n,m)))`,
    videoId: "Ua0GhsJSlWM",
    problemLink: "https://leetcode.com/problems/longest-common-subsequence/",
  },

  "Rabin-Karp Algorithm": {
    description: `String-search algorithm using rolling hash to quickly find matching substrings.

Algorithm (Pseudocode):
function RabinKarp(text, pattern):
  n = length(text), m = length(pattern)
  prime = 101 // A prime number for modulo
  d = 256     // Number of characters in alphabet
  h = (d ^ (m-1)) % prime // (d^(m-1)) mod prime
  
  patternHash = 0
  textHash = 0

  // 1. Calculate initial hashes for pattern and first window of text
  for i = 0 to m-1:
    patternHash = (d * patternHash + pattern[i]) % prime
    textHash = (d * textHash + text[i]) % prime
    
  // 2. Slide the window
  for i = 0 to n - m:
    // Check if hashes match
    if patternHash == textHash:
      // If hashes match, verify character by character
      if text.substring(i, i + m) == pattern:
        return i // Match found

    // 3. Calculate hash for next window
    if i < n - m:
      // Remove leading digit, add trailing digit
      textHash = (d * (textHash - text[i] * h) + text[i + m]) % prime
      if textHash < 0: textHash = textHash + prime
          
  return -1 // No match

Time complexity: Average O(n + m), worst-case O(n*m)
Space complexity: O(1)`,
    videoId: "qQ8vS2btsxI",
    problemLink: "https://leetcode.com/problems/implement-strstr/",
  },

  "KMP Algorithm": {
    description: `Knuth–Morris–Pratt builds a longest-prefix-suffix (LPS) table to skip redundant comparisons while matching a pattern in text.

Algorithm (Pseudocode):
// 1. Build Longest Prefix Suffix (LPS) table
function computeLPS(pattern):
  m = length(pattern)
  lps = new Array(m) initialized to 0
  length = 0 // length of the previous longest prefix suffix
  i = 1
  
  while i < m:
    if pattern[i] == pattern[length]:
      length = length + 1
      lps[i] = length
      i = i + 1
    else:
      if length != 0:
        length = lps[length - 1]
      else:
        lps[i] = 0
        i = i + 1
  return lps

// 2. KMP Search
function KMP_Search(text, pattern):
  n = length(text), m = length(pattern)
  lps = computeLPS(pattern)
  i = 0 // index for text
  j = 0 // index for pattern
  
  while i < n:
    if pattern[j] == text[i]:
      i = i + 1
      j = j + 1

    if j == m:
      return (i - j) // Found pattern at index (i - j)
      // j = lps[j - 1] // (if searching for all occurrences)
    
    // Mismatch after j matches
    else if i < n and pattern[j] != text[i]:
      if j != 0:
        j = lps[j - 1] // Use LPS table
      else:
        i = i + 1
  return -1 // Not found

Time complexity: O(n + m)
Space complexity: O(m)`,
    videoId: "JoF0Z7nVSrA",
    problemLink: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
  },

  "Trie": {
    description: `A prefix tree for efficient retrieval of strings by prefix. Supports insert, search and prefix queries in O(length) time.

Algorithm (Core Operations Pseudocode):
// Node structure
class TrieNode:
  children = new Map() // char -> TrieNode
  isEndOfWord = false

class Trie:
  root = new TrieNode()

  // 1. Insertion
  function insert(word):
    node = root
    for char in word:
      if not node.children.has(char):
        node.children.set(char, new TrieNode())
      node = node.children.get(char)
    node.isEndOfWord = true
  
  // 2. Search
  function search(word):
    node = root
    for char in word:
      if not node.children.has(char):
        return false // Word not in trie
      node = node.children.get(char)
    return node.isEndOfWord

  // 3. Prefix Search
  function startsWith(prefix):
    node = root
    for char in prefix:
      if not node.children.has(char):
        return false // Prefix not in trie
      node = node.children.get(char)
    return true // Prefix exists

Time complexity: O(L) per operation (L = string length)
Space complexity: O(N*L_avg) (N = num words, L_avg = avg length)`,
    videoId: "zIjfhVPRZCg",
    problemLink: "https://leetcode.com/problems/implement-trie-prefix-tree/",
  },
};

export default algoDetails;