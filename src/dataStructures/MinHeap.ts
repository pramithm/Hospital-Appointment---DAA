/**
 * Custom Binary Min-Heap Priority Queue for Dijkstra's Shortest Path Algorithm.
 *
 * Properties:
 * - Complete Binary Tree represented as a 0-indexed array.
 * - Min-Heap Property: heap[parent].priority <= heap[child].priority
 *
 * Time Complexities:
 * - Insertion: O(log V) — siftUp
 * - Extract-Min: O(log V) — siftDown
 * - Peek-Min: O(1)
 * - Space: O(V)
 */

export interface HeapItem<T> {
  element: T;
  priority: number;
}

export class MinHeap<T> {
  private heap: HeapItem<T>[] = [];

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Inserts an element with a specified numerical priority (e.g. cumulative distance).
   * Time Complexity: O(log V)
   */
  insert(element: T, priority: number): void {
    this.heap.push({ element, priority });
    this.siftUp(this.heap.length - 1);
  }

  /**
   * Extracts and returns the minimum element (lowest priority value).
   * Time Complexity: O(log V)
   */
  extractMin(): HeapItem<T> | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return min;
  }

  /**
   * Peeks at the minimum element without removing it.
   * Time Complexity: O(1)
   */
  peekMin(): HeapItem<T> | undefined {
    return this.heap[0];
  }

  /**
   * Returns a copy of the internal heap items for visual inspection.
   */
  toArray(): HeapItem<T>[] {
    return [...this.heap];
  }

  /**
   * Resets the heap.
   */
  clear(): void {
    this.heap = [];
  }

  private siftUp(idx: number): void {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.heap[idx].priority < this.heap[parentIdx].priority) {
        // Swap
        [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
        idx = parentIdx;
      } else {
        break;
      }
    }
  }

  private siftDown(idx: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChild = 2 * idx + 1;
      const rightChild = 2 * idx + 2;
      let smallest = idx;

      if (
        leftChild < length &&
        this.heap[leftChild].priority < this.heap[smallest].priority
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < length &&
        this.heap[rightChild].priority < this.heap[smallest].priority
      ) {
        smallest = rightChild;
      }

      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
        idx = smallest;
      } else {
        break;
      }
    }
  }
}
