import { ReactNode } from 'react'

import { EdgePortTypeEnum } from '@acx-ui/rc/utils'

export interface CompatibilityNodeError<RecordType = unknown> {
  nodeId: string
  nodeName?: string
  errors: RecordType
}
export interface SingleNodeDetailsField<RecordType = unknown> {
  title: string,
  key: string,
  render: (errors: RecordType) => ReactNode
}

export interface InterfaceCompatibilityError {
  interfaces: number,
  corePorts: number,
  portTypes: EdgePortTypeEnum[]
}