import { ApiVersionEnum } from '../common'

export interface CountAndNames {
  count: number
  names: string[]
}

export type ApiVersion = {
  rbacApiVersion?: ApiVersionEnum
}