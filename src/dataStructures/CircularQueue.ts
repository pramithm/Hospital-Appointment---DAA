/**
 * Circular Queue (ring buffer) for doctor slot allocation.
 * Enqueue:  O(1)
 * Dequeue:  O(1)
 * IsFull:   O(1)
 *
 * Front and rear wrap around using modulo.
 */
export class CircularQueue<T> {
  private items: (T | null)[];
  private front = 0;
  private rear = -1;
  private _size = 0;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.items = new Array(capacity).fill(null);
  }

  get size(): number {
    return this._size;
  }

  get isFull(): boolean {
    return this._size === this.capacity;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  get cap(): number {
    return this.capacity;
  }

  enqueue(value: T): boolean {
    if (this.isFull) return false;
    this.rear = (this.rear + 1) % this.capacity;
    this.items[this.rear] = value;
    this._size++;
    return true;
  }

  dequeue(): T | undefined {
    if (this.isEmpty) return undefined;
    const value = this.items[this.front];
    this.items[this.front] = null;
    this.front = (this.front + 1) % this.capacity;
    this._size--;
    return value ?? undefined;
  }

  peek(): T | undefined {
    return this.items[this.front] ?? undefined;
  }

  getSlot(index: number): T | null {
    return this.items[index % this.capacity];
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      const idx = (this.front + i) % this.capacity;
      const val = this.items[idx];
      if (val !== null) result.push(val);
    }
    return result;
  }

  getAllSlots(): (T | null)[] {
    return [...this.items];
  }

  clear(): void {
    this.items = new Array(this.capacity).fill(null);
    this.front = 0;
    this.rear = -1;
    this._size = 0;
  }
}
