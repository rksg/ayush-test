
import { RcFile } from 'antd/lib/upload'

// Mapping the enum based on enrollment-actions definitions:
//  - Code: https://bitbucket.rks-cloud.com/projects/RKSCLOUD/repos/workflow-actions/browse/workflow-action-common/src/main/java/com/ruckus/cloud/workflow/action/workflow/payload/ActionDto.java#21
//  - HLD: https://jira-wiki.ruckuswireless.com/pages/viewpage.action?pageId=345069328#EnrollmentActionHLD(UNDERCONSTRUCTION)-Respondtoenrollmentstepexecutionevents:~:text=developed%20in%20phases.-,Terminology,-Action%20Template
export enum ActionType {
  AUP = 'AUP',
  DPSK = 'DPSK',
  DATA_PROMPT = 'DATA_PROMPT',
  DISPLAY_MESSAGE = 'DISPLAY_MESSAGE',

  USER_SELECTION_SPLIT = 'USER_SELECTION_SPLIT'
}

export const SplitActionTypes: ActionType[] = [


]

export interface WorkflowAction {
  id: string,
  name: string

  // TODO: confusing between the `id` and `actionId`
  actionId: string
  actionType: ActionType,
  version: number
}

export interface ActionBase {
  actionId: string,
  name: string,
  description: string,
  actionType: ActionType,
  version: number
}

export interface AupActionContext {
  title: string, // max:100
  messageHtml: string, // max = 1000

  checkboxText: string, // max = 100
  backButtonText: string, // max = 20
  continueButtonText: string, // max = 20
  bottomLabel: string, // max = 1000
  checkboxDefaultState?: boolean,
  checkboxHighlightColor?: string,

  useAupFile?: boolean,
  aupFileLocation?: string,

  useContentFile?: boolean,
  contentFileLocation?: string
}

export type AupActionFormContext = AupActionContext & {
  aupFileLocation?: RcFile,
  contentFileLocation?: RcFile
}

export interface DpskActionContext {
  dpskPoolId: string
}

export interface DataPromptActionContext {
  backButtonText: string, // max = 20
  continueButtonText: string, // max = 20

  title?: string,
  messageHtml?: string,
  variables?: DataPromptVariable[],

  bottomLabel?: string // max = 1000
}

// TODO: need to confirm the nullable or not for each variables
export interface UserSelectionSplitContext {
  title: string,
  messageHtml: string,
  shortName?: string,
  enabled?: boolean,

  iconFileLocation?: string
}

export interface DataPromptVariable {
  label: string,
  regex?: string,
  name?: string
}

export interface DisplayMessageActionContext {
  title: string,
  messageHtml: string,
  backButtonText: string,
  continueButtonText: string
}

export type AupAction = ActionBase & AupActionContext
export type DpskAction = ActionBase & DpskActionContext
export type DataPromptAction = ActionBase & DataPromptActionContext
export type UserSelectionAction = ActionBase & UserSelectionSplitContext
export type DisplayMessageAction = ActionBase & DisplayMessageActionContext

export type GenericActionData =
  ActionBase &
  AupActionFormContext &
  DataPromptActionContext &
  UserSelectionAction &
  DisplayMessageAction

