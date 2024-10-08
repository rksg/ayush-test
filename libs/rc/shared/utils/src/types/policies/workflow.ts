import { RcFile } from 'antd/lib/upload'

import { ActionType } from './workflowAction'

export interface Workflow {
  id?: string
  name: string
  description?: string
  publishedDetails?: PublishDetail
  allowedIps?: string[]
  disallowedIps?: string[]
  startStepId?: string
  links?: { rel: string, href: string }[]
}

export type PublishStatus = 'WORK_IN_PROGRESS' | 'PUBLISHED' | 'RETIRED' | 'VALIDATE'

export interface PublishDetail {
  status: PublishStatus
  version?: number
  publishedDate?: string
  parentWorkflowId?: string
}

export interface UIColorSchema {
  fontHeaderColor: string
  fontColor: string
  backgroundColor: string
  buttonColor: string
  buttonFontColor: string
}

export type LogoSize = 'SMALL' | 'MEDIUM' | 'LARGE'

export interface UIStyleSchema {
  logoSize: LogoSize
  headerFontSize: number
  logoImageFileName?: string
  backgroundImageName?: string
}

export interface UIConfiguration {
  wifi4EUNetworkId?: string
  disablePoweredBy: boolean
  logoImage?: string
  logoFile?: RcFile
  backgroundImage?: string
  backgroundImageFile?: RcFile
  uiColorSchema: UIColorSchema
  uiStyleSchema: UIStyleSchema
  welcomeTitle: string
  welcomeName: string
}

export interface ImageUrl {
  fileUrl: string
}

// Workflow Step Part
export type WorkflowStep = Step & SplitStep

export enum StepType {
  Basic = 'stepDto',
  Split = 'splitStepDto',
  Start = 'startStepDto',
  End = 'endStepDto'
}

export enum WorkflowPanelMode {
  Default = 'default',
  Design = 'design',
  Edit = 'edit'
}

// Only for Canvas used
interface StepState {
  isStart?: boolean,
  isEnd?: boolean,
  mode?: WorkflowPanelMode
}

interface BaseStep extends StepState {
  id: string,
  type?: StepType,
  actionType?: ActionType,
  actionDefinitionId?: string,
  priorStepId?: string,
  splitOptionId?: string
}

interface Step extends BaseStep {
  enrollmentActionId: string,
  nextStepId?: string,
  isTerminating?: boolean
}

interface SplitStep extends BaseStep {
  splitOptionsList?: SplitOption[]
}

export interface SplitOption {
  id: string,
  optionName?: string,
  enrollmentActionId: string,
  actionDefinitionId?: string,
  nextStepId?: string,
  actionType?: string
}

export interface WorkflowActionDefinition {
  id: string,
  name: string,
  category: string
  isSplit: boolean,
  localizationDescriptionId: string,
  hasEndActions: boolean,

  actionType: ActionType,
  description?: string,
  terminationType?: 'NONE' | 'OPTIONAL' | 'REQUIRED',
  dependencyType?: 'NONE' | 'ONE_OF' | 'ALL',
}
