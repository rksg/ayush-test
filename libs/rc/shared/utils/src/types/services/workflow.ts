import { ActionType } from './workflowAction'


export type WorkflowStep = Step & SplitStep

export enum StepType {
  Basic = 'stepDto',
  Split = 'splitStepDto',
  Start = 'startStepDto',
  End = 'endStepDto'
}

interface BaseStep extends StepState{
  id: string,
  type?: StepType,
  actionType?: ActionType,
  actionDefinitionId?: string,
  priorStepId?: string,
  splitOptionId?: string
}

// Only for Canvas used
interface StepState {
  isStart?: boolean,
  isEnd?: boolean
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
