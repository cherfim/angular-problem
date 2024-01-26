import { timestamp } from "rxjs";

// Jobs data data

export interface Result {
  name: string,
  failed: number,
  passed: number,
  pending: number,
  owneruser: string,
  ownergroup: string
}
export interface Execution {
  execution_id: number,
  execution_time: Date | null,
  completion_time: Date | null,
  result: Result
}
export interface JobType {
  testbook_id: number,
  testbook_name: string,
  executions: Execution[]
}
