/**
 * Binary Max-Heap based Priority Queue.
 * Enqueue:  O(log n) — sift up
 * Dequeue:  O(log n) — sift down (extract max)
 * Peek:     O(1)
 *
 * Higher priority value = extracted first.
 */
export class MaxHeap<T> {
  private heap: { priority: number; value: T }[] = [];

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  insert(value: T, priority: number): void {
    this.heap.push({ priority, value });
    this.siftUp(this.heap.length - 1);
  }

  extractMax(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const max = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return max.value;
  }

  peekMax(): T | undefined {
    return this.heap[0]?.value;
  }

  toArray(): T[] {
    return [...this.heap]
      .sort((a, b) => b.priority - a.priority)
      .map((e) => e.value);
  }

  clear(): void {
    this.heap = [];
  }

  private siftUp(idx: number): void {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[idx].priority <= this.heap[parent].priority) break;
      [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
      idx = parent;
    }
  }

  private siftDown(idx: number): void {
    const n = this.heap.length;
    while (true) {
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      let largest = idx;
      if (left < n && this.heap[left].priority > this.heap[largest].priority)
        largest = left;
      if (right < n && this.heap[right].priority > this.heap[largest].priority)
        largest = right;
      if (largest === idx) break;
      [this.heap[idx], this.heap[largest]] = [
        this.heap[largest],
        this.heap[idx],
      ];
      idx = largest;
    }
  }
}
