export interface Workflow {
  id?: string
  name: string
  description?: string
  publishDetails?: PublishDetail
  allowedIps?: string[]
  disallowedIps?: string[]
  startStepId?: string
}

export type PublishStatus = 'WORK_IN_PROGRESS' | 'PUBLISHED' | 'RETIRED'

export interface PublishDetail {
  status: PublishStatus
  version?: number
  publishedDate?: string
  parentWorkflowId?: string
}

export interface UIColorSchema {
  titleFontColor: string
  bodyFontColor: string
  backgroundColor: string
  buttonColor: string
  buttonFontColor: string
}

export interface UIStyleSchema {
  logoRatio: number
  titleFontSize: number
  bodyFontSize: number
}

export interface UIConfiguration {
  wifi4EUNetworkId?: string
  disablePoweredBy: boolean
  logoImage?: string
  backgroundImage?: string
  uiColorSchema: UIColorSchema
  uiStyleSchema: UIStyleSchema
}