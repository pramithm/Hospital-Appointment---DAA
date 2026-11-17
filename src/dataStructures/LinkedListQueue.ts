export interface LLNode<T> {
  value: T;
  next: LLNode<T> | null;
}

/**
 * Linked-list based FIFO queue.
 * Enqueue: O(1) — append to tail
 * Dequeue: O(1) — remove from head
 * Peek:    O(1) — read head
 */
export class LinkedListQueue<T> {
  private head: LLNode<T> | null = null;
  private tail: LLNode<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  enqueue(value: T): void {
    const node: LLNode<T> = { value, next: null };
    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this._size++;
  }

  dequeue(): T | undefined {
    if (!this.head) return undefined;
    const node = this.head;
    this.head = node.next;
    if (!this.head) this.tail = null;
    this._size--;
    return node.value;
  }

  peek(): T | undefined {
    return this.head?.value;
  }

  toArray(): T[] {
    const arr: T[] = [];
    let cur = this.head;
    while (cur) {
      arr.push(cur.value);
      cur = cur.next;
    }
    return arr;
  }

  remove(predicate: (value: T) => boolean): T | undefined {
    let prev: LLNode<T> | null = null;
    let cur = this.head;
    while (cur) {
      if (predicate(cur.value)) {
        if (prev) prev.next = cur.next;
        else this.head = cur.next;
        if (cur === this.tail) this.tail = prev;
        this._size--;
        return cur.value;
      }
      prev = cur;
      cur = cur.next;
    }
    return undefined;
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }
}
