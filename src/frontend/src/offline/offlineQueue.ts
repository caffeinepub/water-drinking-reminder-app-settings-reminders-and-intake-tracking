// Device-local offline action queue with persistence and FIFO ordering
// Manages queued mutations that need to be synced when back online

import { writeOfflineData, readOfflineData, clearOfflineData } from './offlineStorage';

export type OfflineActionType = 
  | 'addDailyIntake'
  | 'addSleepLog'
  | 'logRun'
  | 'updateUserSettings';

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: any;
  timestamp: number;
}

const QUEUE_KEY = 'action_queue';

export class OfflineQueue {
  private principal: string;

  constructor(principal: string) {
    this.principal = principal;
  }

  enqueue(type: OfflineActionType, payload: any): void {
    const queue = this.getQueue();
    const action: OfflineAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
    };
    queue.push(action);
    this.saveQueue(queue);
  }

  dequeue(): OfflineAction | null {
    const queue = this.getQueue();
    if (queue.length === 0) {
      return null;
    }
    const action = queue.shift()!;
    this.saveQueue(queue);
    return action;
  }

  peek(): OfflineAction | null {
    const queue = this.getQueue();
    return queue.length > 0 ? queue[0] : null;
  }

  removeById(id: string): void {
    const queue = this.getQueue();
    const filtered = queue.filter(action => action.id !== id);
    this.saveQueue(filtered);
  }

  getQueue(): OfflineAction[] {
    const stored = readOfflineData<OfflineAction[]>(this.principal, QUEUE_KEY);
    return stored?.data || [];
  }

  size(): number {
    return this.getQueue().length;
  }

  clear(): void {
    clearOfflineData(this.principal, QUEUE_KEY);
  }

  private saveQueue(queue: OfflineAction[]): void {
    writeOfflineData(this.principal, QUEUE_KEY, queue);
  }
}
