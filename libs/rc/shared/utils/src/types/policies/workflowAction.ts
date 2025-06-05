
// Mapping the enum based on enrollment-actions definitions:

import { MessageDescriptor } from 'react-intl'

//  - HLD: https://jira-wiki.ruckuswireless.com/pages/viewpage.action?pageId=345069328#EnrollmentActionHLD(UNDERCONSTRUCTION)-Respondtoenrollmentstepexecutionevents:~:text=developed%20in%20phases.-,Terminology,-Action%20Template
import { UIConfiguration } from './workflow'

export type WorkflowNodeTypes = ActionType | 'START' | 'DISCONNECTED_BRANCH'

export enum ActionType {
  AUP = 'AUP',
  DATA_PROMPT = 'DATA_PROMPT',
  DISPLAY_MESSAGE = 'DISPLAY_MESSAGE',
  DPSK = 'DPSK',
  MAC_REG = 'MAC_REG',
  CERT_TEMPLATE = 'CERT_TEMPLATE',
}

export interface ActionBase {
  id: string,
  name: string,
  description: string,
  actionType: ActionType,
  version: number,
  valid: boolean
}

export interface AupAction extends ActionBase {
  title: string, // max:100
  messageHtml: string, // max = 1000

  checkboxText?: string, // max = 100
  backButtonText?: string, // max = 20
  continueButtonText?: string, // max = 20
  bottomLabel?: string, // max = 1000
  checkboxDefaultState?: boolean,
  checkboxHighlightColor?: string,

  useAupFile: boolean,
  aupFileLocation?: string,
  aupFileName?: string,
  aupPlainText?: string
}

export interface DpskAction extends ActionBase {
  identityGroupId: string
  identityId?: string,
  dpskPoolId?: string,
  emailNotification?: boolean,
  smsNotification?: boolean,
  qrCodeDisplay?: boolean
}

export interface DataPromptAction extends ActionBase {
  title?: string, // max:100
  displayTitle: boolean,
  messageHtml?: string, // max = 1000
  displayMessageHtml: boolean
  variables?: DataPromptVariable[],
  bottomLabel?: string // max = 1000
  backButtonText: string,
  continueButtonText: string,
  displayBackButton: boolean,
  displayContinueButton: boolean
}

export interface DataPromptVariable {
  type: string,
  label?: string | MessageDescriptor,
  regex?: string,
}

export interface DisplayMessageAction extends ActionBase {
  title: string,
  messageHtml: string,
  backButtonText: string,
  continueButtonText: string,
  displayBackButton: boolean,
  displayContinueButton: boolean
}
export interface MacRegAction extends ActionBase {
  identityGroupId: string,
  macRegListId?: string,
  identityId?: string,
  clientEnterMacAddress?: boolean
}
export interface CertTempAction extends ActionBase {
  identityGroupId?: string,
  certTemplateId: string,
  identityId?: string
}
export type AupActionContext = Omit<AupAction, keyof ActionBase>
export type DataPromptActionContext = Omit<DataPromptAction, keyof ActionBase>
export type DisplayMessageActionContext = Omit<DisplayMessageAction, keyof ActionBase>
export type DpskActionContext = Omit<DpskAction, keyof ActionBase>
export type MacRegActionContext = Omit<MacRegAction, keyof ActionBase>
export type CertTempActionContext = Omit<CertTempAction, keyof ActionBase>

export type GenericActionData =
  ActionBase &
  AupActionContext &
  DataPromptActionContext &
  DisplayMessageActionContext &
  DpskActionContext &
  MacRegActionContext &
  CertTempActionContext

export enum FileType {
  AUP_FILE = 'AUP_FILE'
}

export interface FileDto{
  url: string
  type: FileType
}

export interface FileContext {
  name?: string;
  type: FileType;
}

export interface GenericActionPreviewProps<T> {
  data?: T,
  uiConfiguration?: UIConfiguration
}

export interface FileDownloadResponse {
  url: string
}
