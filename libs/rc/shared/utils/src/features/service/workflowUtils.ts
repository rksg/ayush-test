import { MessageDescriptor }      from '@formatjs/intl'
import { defineMessage, useIntl } from 'react-intl'
import { Node }                   from 'reactflow'

import {
  ActionType,
  AupActionContext,
  DataPromptActionContext,
  DisplayMessageActionContext,
  SplitActionTypes,
  UserSelectionSplitContext,
  WorkflowStep
} from '../../types'


export const useGetActionDefaultValueByType = (actionType: ActionType) => {
  const { $t } = useIntl()

  return Object.entries(ActionDefaultValueMap[actionType])
    .reduce((acc: Record<string, string | boolean>, [key, value]) => {
      if (typeof value === 'string' || typeof value === 'boolean') {
        acc[key] = value
      } else {
        acc[key] = $t(value)
      }
      return acc
    }, {})
}

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
  const firstIndex = steps.findIndex(step =>
    step.priorStepId === undefined && !step.splitOptionId
  )

  console.groupCollapsed('[Processing] - findFirstStep function')
  console.log('FirstStep is ', steps[firstIndex])
  console.log('FirstStep possible to be ', steps.filter(step =>
    step.priorStepId === undefined && !step.splitOptionId
  ))
  console.groupEnd()

  return firstIndex ? steps[firstIndex] : steps[0]
}

export const toStepMap = (steps: WorkflowStep[], definitionMap: Map<string, ActionType>)
  : Map<string, WorkflowStep> =>
{
  const map = new Map<string, WorkflowStep>()

  steps.forEach(step => {
    map.set(step.id, {
      ...step,
      // FIXME: replace the specific id as ''
      type: definitionMap.get(step?.actionDefinitionId ?? 'd1342c9e-c379-4fe6-9a18-8eec67e34eb6')
    })
  })

  console.groupCollapsed('[toStepMap]')
  console.log('[StepMap]:', map)
  console.groupEnd()

  return map
}

export const getInitialNodes = (x: number, y: number): Node[] => {
  // FIXME: START type move to enum or not? maybe it would impact some validation? need to be checked
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
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Data Prompt Node' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Display Message Node' }),
  // [ActionType.DPSK]: defineMessage({ defaultMessage: 'DPSK Node' }),

  [ActionType.USER_SELECTION_SPLIT]: defineMessage({ defaultMessage: 'Split Option Node' })
}

export const ActionTypeTitle: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Display an Acceptable Use Policy (AUP)' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Prompt the user for information' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Display message' }),
  // [ActionType.DPSK]: defineMessage({ defaultMessage: 'Generate a Ruckus DPSK' }),

  [ActionType.USER_SELECTION_SPLIT]: defineMessage({ defaultMessage: 'User selection split' })
}

// FIXME: Deprecated => due to we don't support action template selector anymore.
export const ActionTypeSelectionTerms: Record<ActionType, MessageDescriptor | undefined> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Select the existing AUP to use:' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Select the existing data prompt template to use:' }),
  [ActionType.DISPLAY_MESSAGE]: undefined,
  // [ActionType.DPSK]: undefined,

  [ActionType.USER_SELECTION_SPLIT]: undefined
}

// FIXME: Deprecated => due to we don't support action template selector anymore.
export const ActionTypeNewTemplateTerms: Record<ActionType, MessageDescriptor | undefined> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'A new AUP created from a standard template.' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'A new prompt created from a standard template.' }),
  [ActionType.DISPLAY_MESSAGE]: undefined,
  // [ActionType.DPSK]: undefined,

  [ActionType.USER_SELECTION_SPLIT]: defineMessage({ defaultMessage: 'A new user selection split option created from a standard template.' })
}

export const ActionTypeDescription: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Displays a message to the user and requires that they signal their acceptance. This is normally used for an acceptable use policy (AUP) or end-user license agreement (EULA).' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Displays a prompt screen with customizable data entry fields.' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Display message' }),
  // [ActionType.DPSK]: defineMessage({ defaultMessage: 'Generates a DPSK, either via DPSK pools (for use in Ruckus WLAN controllers as "External DPSK") or via a Ruckus WLAN controller.' }),

  [ActionType.USER_SELECTION_SPLIT]: defineMessage({ defaultMessage: 'User selection split' })
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

export const DisplayMessageActionDefaultValue: {
  [key in keyof DisplayMessageActionContext]: MessageDescriptor | string
} = {
  title: defineMessage({ defaultMessage: 'Default Display Message Title' }),
  messageHtml: defineMessage({ defaultMessage: 'Default Display Message Body' }),
  backButtonText: defineMessage({ defaultMessage: 'Back' }),
  continueButtonText: defineMessage({ defaultMessage: 'Continue' })
}

export const ActionDefaultValueMap: Record<ActionType, object> = {
  [ActionType.AUP]: AupActionDefaultValue,
  [ActionType.DATA_PROMPT]: DataPromptActionDefaultValue,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageActionDefaultValue,
  // [ActionType.DPSK]: {},

  [ActionType.USER_SELECTION_SPLIT]: UserSelectionActionDefaultValue
}
/* eslint-enable max-len */
