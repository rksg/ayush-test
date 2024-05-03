import { ApiVersionEnum } from '../common'

export interface CountAndNames {
  count: number
  names: string[]
}

export type ApiVersionType = {
  rbacApiVersion?: ApiVersionEnum
}