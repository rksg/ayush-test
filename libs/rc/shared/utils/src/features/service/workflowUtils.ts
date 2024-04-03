import { MessageDescriptor } from '@formatjs/intl'
import { defineMessage }     from 'react-intl'
import { Node }              from 'reactflow'

import {
  ActionType,
  AupActionContext,
  DataPromptActionContext,
  SplitActionTypes,
  UserSelectionSplitContext,
  WorkflowStep
} from '../../types'


export const isSplitActionType = (type: ActionType | string): boolean => {
  if (typeof type === 'string') {
    console.log('Type is string: ', type, SplitActionTypes.map(t => t.toString()).includes(type))
    return SplitActionTypes.map(t => t.toString()).includes(type)
  } else {
    console.log('Type is ActionType: ', type)
    return SplitActionTypes.includes(type)
  }
}

export const findFirstStep = (steps: WorkflowStep[]): WorkflowStep => {
  // TODO: Validation is needed or not ?
  const firstIndex = steps.findIndex(step =>
    step.priorStepId === undefined && !step.splitOptionId
  )

  console.log('FirstStep is ', steps[firstIndex])
  console.log('FirstStep possible to be ', steps.filter(step =>
    step.priorStepId === undefined && !step.splitOptionId
  ))

  return firstIndex ? steps[firstIndex] : steps[0]
}

export const toStepMap = (steps: WorkflowStep[], definitionMap: Map<string, ActionType>)
  : Map<string, WorkflowStep> =>
{
  const map = new Map<string, WorkflowStep>()

  steps.forEach(step => {
    map.set(step.id, {
      ...step,
      type: definitionMap.get(step?.actionDefinitionId ?? '')
    })
  })

  console.log('[StepMap]:', map)

  return map
}

export const getInitialNodes = (x: number, y: number): Node[] => {
  return [
    {
      id: 'initial-id',
      position: { x, y },
      data: { },
      type: 'START'
    }
  ]
}

/* eslint-disable max-len */
// TODO: need to be defined by UX designer
export const ActionNodeDisplay: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'AUP Node' }),
  [ActionType.DPSK]: defineMessage({ defaultMessage: 'DPSK Node' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Data Prompt Node' }),
  [ActionType.USER_SELECTION_SPLIT]: defineMessage({ defaultMessage: 'Split Option Node' })
  // [ActionType.SPLIT]: defineMessage({ defaultMessage: 'Split Node' })
}

export const ActionTypeTitle: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Display an Acceptable Use Policy (AUP)' }),
  [ActionType.DPSK]: defineMessage({ defaultMessage: 'Generate a Ruckus DPSK' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Prompt the user for information' }),
  [ActionType.USER_SELECTION_SPLIT]: defineMessage({ defaultMessage: 'User selection split' })
  // [ActionType.SPLIT]: defineMessage({ defaultMessage: 'Split users into different branches' })
}

export const ActionTypeSelectionTerms: Record<ActionType, MessageDescriptor | undefined> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Select the existing AUP to use:' }),
  [ActionType.DPSK]: undefined,
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Select the existing data prompt template to use:' }),
  [ActionType.USER_SELECTION_SPLIT]: undefined
  // [ActionType.SPLIT]: undefined
}

export const ActionTypeNewTemplateTerms: Record<ActionType, MessageDescriptor | undefined> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'A new AUP created from a standard template.' }),
  [ActionType.DPSK]: undefined,
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'A new prompt created from a standard template.' }),
  [ActionType.USER_SELECTION_SPLIT]: defineMessage({ defaultMessage: 'A new user selection split option created from a standard template.' })
  // [ActionType.SPLIT]: defineMessage({ defaultMessage: 'A new split option created from a standard template.' })
}

export const ActionTypeDescription: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Displays a message to the user and requires that they signal their acceptance. This is normally used for an acceptable use policy (AUP) or end-user license agreement (EULA).' }),
  [ActionType.DPSK]: defineMessage({ defaultMessage: 'Generates a DPSK, either via DPSK pools (for use in Ruckus WLAN controllers as "External DPSK") or via a Ruckus WLAN controller.' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Displays a prompt screen with customizable data entry fields.' }),
  [ActionType.USER_SELECTION_SPLIT]: defineMessage({ defaultMessage: 'User selection split' })
  // [ActionType.SPLIT]: defineMessage({ defaultMessage: 'Creates a branch or fork in the enrollment process.  This can occur (1) visually by having the user make a selection or (2) it can occur automatically based on criteria associated with each option.  For example, a user that selects "Guest" may be sent through a different process than a user that selects to enroll as an "Employee".  Likewise, an Android device may be presented a different enrollment sequence than a Windows device.' })
}

export const AupActionDefaultValue: {
  [key in keyof AupActionContext]: MessageDescriptor | string | boolean
} = {
  title: defineMessage({ defaultMessage: 'Welcome to the ACCOUNT_NAME Network' }),
  messageHtml: defineMessage({ defaultMessage: 'Access to the ACCOUNT_NAME network is restricted to authorized users and requires acceptance of the Terms & Conditions below.\n\nOnce authorized for access, your device will be configured with a unique certificate for network access.' }),
  checkboxText: defineMessage({ defaultMessage: 'I agree to the Terms & Conditions.' }),
  bottomLabel: defineMessage({ defaultMessage: 'bottomLabel' }),
  backButtonText: defineMessage({ defaultMessage: '< Back' }),
  continueButtonText: defineMessage({ defaultMessage: 'Start' }),
  checkboxHighlightColor: 'FCFFB3',
  checkboxDefaultState: true,

  useAupFile: false,
  useContentFile: false
  // contentFileLocation: 'fakeContentFileLocation',
}

export const DataPromptActionDefaultValue: {
  [key in keyof DataPromptActionContext]: MessageDescriptor | string
} = {
  backButtonText: defineMessage({ defaultMessage: '< Back' }),
  continueButtonText: defineMessage({ defaultMessage: 'Continue >' })
}

export const UserSelectionActionDefaultValue: {
  [key in keyof UserSelectionSplitContext]: MessageDescriptor | string
} = {
  title: defineMessage({ defaultMessage: 'DefaultUserSplitTitle' }),
  messageHtml: defineMessage({ defaultMessage: 'Default HTML template.' })
}

export const ActionDefaultValueMap: Record<ActionType, object> = {
  [ActionType.AUP]: AupActionDefaultValue,
  [ActionType.USER_SELECTION_SPLIT]: UserSelectionActionDefaultValue,
  // [ActionType.SPLIT]: UserSelectionActionDefaultValue,
  [ActionType.DATA_PROMPT]: DataPromptActionDefaultValue,
  [ActionType.DPSK]: {}
}
/* eslint-enable max-len */
