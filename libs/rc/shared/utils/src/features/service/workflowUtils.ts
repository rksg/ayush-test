import { MessageDescriptor }      from '@formatjs/intl'
import { defineMessage, useIntl } from 'react-intl'
import { Node }                   from 'reactflow'

import {
  AupIcon,
  DataPromptIcon,
  DisplayMessageIcon,
  DpskActionTypeIcon
} from '@acx-ui/icons'

import {
  ActionType,
  AupActionContext,
  DataPromptActionContext,
  DisplayMessageActionContext,
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

export const findFirstStep = (steps: WorkflowStep[]): WorkflowStep => {
  const firstIndex = steps.findIndex(step =>
    step.priorStepId === undefined && !step.splitOptionId
  )

  return firstIndex ? steps[firstIndex] : steps[0]
}

export const toStepMap = (steps: WorkflowStep[], definitionMap: Map<string, ActionType>)
  : Map<string, WorkflowStep> =>
{
  const map = new Map<string, WorkflowStep>()

  steps.forEach(step => {
    map.set(step.id, {
      ...step,
      actionType: definitionMap.get(step?.actionDefinitionId ?? '') ?? step.actionType
    })
  })

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
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Acceptable Use Policy' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Display a Form' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Custom Message' }),
  [ActionType.DPSK]: defineMessage({ defaultMessage: 'Provide DPSK' })
}

export const ActionTypeCardIcon: Record<ActionType, React.FunctionComponent> = {
  [ActionType.AUP]: AupIcon,
  [ActionType.DATA_PROMPT]: DataPromptIcon,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageIcon,
  [ActionType.DPSK]: DpskActionTypeIcon
}

export const ActionTypeTitle: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Acceptable Use Policy (AUP)' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Display a form' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Custom message' }),
  [ActionType.DPSK]: defineMessage({ defaultMessage: 'Generate a RUCKUS DPSK' })
}

export const ActionTypeDescription: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Requires that users signal their acceptance of the AUP or Terms & Conditions' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Displays a prompt screen with customizable data entry fields' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Displays a message to the user along with a single button to continue' }),
  [ActionType.DPSK]: defineMessage({ defaultMessage: 'Generates a DPSK, either via DPSK pools (for use in RUCKUS WLAN controllers as "External DPSK") or via a RUCKUS WLAN controller.' })
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
  [key in keyof DisplayMessageActionContext]: MessageDescriptor | string | boolean
} = {
  title: defineMessage({ defaultMessage: 'Default Display Message Title' }),
  messageHtml: defineMessage({ defaultMessage: 'Default Display Message Body' }),
  backButtonText: 'Back',
  continueButtonText: 'Continue',
  displayBackButton: true,
  displayContinueButton: true
}

// TODO: add default values for DPSK

export const ActionDefaultValueMap: Record<ActionType, object> = {
  [ActionType.AUP]: AupActionDefaultValue,
  [ActionType.DATA_PROMPT]: DataPromptActionDefaultValue,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageActionDefaultValue,
  [ActionType.DPSK]: {},
}
/* eslint-enable max-len */
