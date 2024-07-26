import { RcFile } from 'antd/lib/upload'

// Mapping the enum based on enrollment-actions definitions:
//  - HLD: https://jira-wiki.ruckuswireless.com/pages/viewpage.action?pageId=345069328#EnrollmentActionHLD(UNDERCONSTRUCTION)-Respondtoenrollmentstepexecutionevents:~:text=developed%20in%20phases.-,Terminology,-Action%20Template
export enum ActionType {
  AUP = 'AUP',
  DATA_PROMPT = 'DATA_PROMPT',
  DISPLAY_MESSAGE = 'DISPLAY_MESSAGE'
}

export interface ActionBase {
  id: string,
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
  title?: string,
  displayTitle: boolean,
  messageHtml?: string,
  displayMessageHtml: boolean
  fields?: DataPromptVariable[],
  bottomLabel?: string // max = 1000
  backButtonText: string,
  continueButtonText: string,
  displayBackButton: boolean,
  displayContinueButton: boolean
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
  type: string,
  label?: string,
  regex?: string,
}

export interface DisplayMessageActionContext {
  title: string,
  messageHtml: string,
  backButtonText: string,
  continueButtonText: string,
  displayBackButton: boolean,
  displayContinueButton: boolean
}

export type AupAction = ActionBase & AupActionFormContext
export type DataPromptAction = ActionBase & DataPromptActionContext
export type DisplayMessageAction = ActionBase & DisplayMessageActionContext

export type GenericActionData =
  ActionBase &
  AupActionFormContext &
  DataPromptActionContext &
  DisplayMessageActionContext

