/**
 * The engine worker threads of the CR Sweep Bench: one per spare CPU core, each running worker.ts. A run hands them
 * one pairing at a time and reports each swept pairing as it finishes.
 */
import os from 'node:os'
import { Worker } from 'node:worker_threads'
import type { Job, JobResult } from './worker.ts'

export const THREADS = Math.max(1, os.availableParallelism() - 1)

interface Slot {
  worker: Worker
  ready: boolean
  busy: boolean
}

export class Pool {
  private slots: Slot[] = []
  private gen = 0
  private queue: Job[] = []
  private running = 0
  private onResult: (result: JobResult) => void = () => {}
  private onDone: () => void = () => {}
  /** Resolves once the first worker thread has loaded the engine, and rejects when the engine does not load. */
  ready: Promise<void> = Promise.resolve()

  private readonly impl: string

  constructor(impl: string) {
    this.impl = impl
  }

  /** Starts the worker threads again, so that they load the engine as it is on disk now; drops any run. */
  start(): void {
    this.stop()
    for (const slot of this.slots) {
      void slot.worker.terminate()
    }
    const mine: Slot[] = []
    this.slots = mine
    this.ready = new Promise<void>((resolve, reject) => {
      for (let i = 0; i < THREADS; i += 1) {
        const worker = new Worker(new URL('./worker.ts', import.meta.url), { workerData: { impl: this.impl } })
        const slot: Slot = { worker, ready: false, busy: false }
        mine.push(slot)
        worker.on('message', (m: { type: 'ready' } | { type: 'error'; message: string } | JobResult) => {
          if (this.slots !== mine) {
            return
          }
          if (m.type === 'ready') {
            slot.ready = true
            resolve()
            this.pump()
          } else if (m.type === 'error') {
            reject(new Error(m.message))
          } else {
            slot.busy = false
            if (m.gen === this.gen) {
              this.running -= 1
              this.onResult(m)
            }
            this.pump()
          }
        })
        worker.on('error', (e) => {
          console.error('engine worker failed:', e.message)
          reject(e)
        })
      }
    })
    this.ready.catch(() => {})
  }

  /** Sweeps the jobs, replacing any run before; resolves when all are swept or the run is stopped. */
  run(jobs: Omit<Job, 'gen'>[], onResult: (result: JobResult) => void): Promise<void> {
    this.stop()
    this.gen += 1
    this.queue = jobs.map((job) => ({ ...job, gen: this.gen }))
    this.running = 0
    this.onResult = onResult
    return new Promise<void>((resolve) => {
      this.onDone = resolve
      this.pump()
    })
  }

  /** Ends the run: its pairings not yet handed out are dropped and those still on a thread are ignored. */
  stop(): void {
    this.gen += 1
    this.queue = []
    this.running = 0
    const done = this.onDone
    this.onDone = () => {}
    this.onResult = () => {}
    done()
  }

  terminate(): void {
    for (const slot of this.slots) {
      void slot.worker.terminate()
    }
  }

  private pump(): void {
    for (const slot of this.slots) {
      if (!slot.ready || slot.busy) {
        continue
      }
      const job = this.queue.shift()
      if (job === undefined) {
        break
      }
      slot.busy = true
      this.running += 1
      slot.worker.postMessage(job)
    }
    if (this.queue.length === 0 && this.running === 0) {
      const done = this.onDone
      this.onDone = () => {}
      done()
    }
  }
}
