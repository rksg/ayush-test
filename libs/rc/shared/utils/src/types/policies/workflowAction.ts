
// Mapping the enum based on enrollment-actions definitions:
//  - HLD: https://jira-wiki.ruckuswireless.com/pages/viewpage.action?pageId=345069328#EnrollmentActionHLD(UNDERCONSTRUCTION)-Respondtoenrollmentstepexecutionevents:~:text=developed%20in%20phases.-,Terminology,-Action%20Template
export enum ActionType {
  AUP = 'AUP',
  DATA_PROMPT = 'DATA_PROMPT',
  DISPLAY_MESSAGE = 'DISPLAY_MESSAGE',
  DPSK = 'DPSK'
}

export interface ActionBase {
  id: string,
  name: string,
  description: string,
  actionType: ActionType,
  version: number
}

export interface AupAction extends ActionBase {
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

export interface DpskAction extends ActionBase {
  identityGroupId?: String
  identityId?: string,
  emailNotification?: boolean,
  smsNotification?: boolean,
  qrCodeDisplay?: boolean
}

export interface DataPromptAction extends ActionBase {
  backButtonText: string, // max = 20
  continueButtonText: string, // max = 20

  title?: string,
  messageHtml?: string,
  variables?: DataPromptVariable[],

  bottomLabel?: string // max = 1000
}

export interface DataPromptVariable {
  label: string,
  regex?: string,
  name?: string
}

export interface DisplayMessageAction extends ActionBase {
  title: string,
  messageHtml: string,
  backButtonText: string,
  continueButtonText: string,
  displayBackButton: boolean,
  displayContinueButton: boolean
}

export type AupActionContext = Omit<AupAction, keyof ActionBase>
export type DataPromptActionContext = Omit<DataPromptAction, keyof ActionBase>
export type DisplayMessageActionContext = Omit<DisplayMessageAction, keyof ActionBase>
export type DpskActionContext = Omit<DpskAction, keyof ActionBase>

export type GenericActionData =
  ActionBase &
  AupActionContext &
  DataPromptActionContext &
  DisplayMessageActionContext &
  DpskAction
