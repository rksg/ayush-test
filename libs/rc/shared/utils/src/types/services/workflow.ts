import { ActionType } from './workflowAction'

export interface Workflow {
  id: string,
  name: string,
  description: string,
  publishedState: string
  publishedDate?: string,

  allowedIps: string[]
}

export type WorkflowStep = Step & SplitStep

interface BaseStep {
  id: string,
  type?: ActionType,
  actionType?: string,
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

  actionType: ActionType,
  description?: string,
  terminationType?: 'NONE' | 'OPTIONAL' | 'REQUIRED',
  dependencyType?: 'NONE' | 'ONE_OF' | 'ALL',
}

export interface WorkflowActionDef extends Pick<WorkflowActionDefinition, 'id' | 'actionType'> {}

export interface WorkflowUiStyleTemplate {
  id: string,

  bannerMaxWitch: string
}

export interface WorkflowUiColorSchema {
  id: string,

  lineColor: string
}
