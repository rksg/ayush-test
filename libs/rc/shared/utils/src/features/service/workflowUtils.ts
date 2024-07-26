import { MessageDescriptor }              from '@formatjs/intl'
import { defineMessage, useIntl }         from 'react-intl'
import { ConnectionLineType, Edge, Node } from 'reactflow'

import {
  AupIcon,
  DataPromptIcon,
  DisplayMessageIcon
} from '@acx-ui/icons'

import {
  ActionType,
  AupActionContext,
  DataPromptActionContext,
  DisplayMessageActionContext,
  StepType,
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
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Custom Message' })
  // [ActionType.DPSK]: defineMessage({ defaultMessage: 'DPSK Node' }),
}

export const ActionTypeCardIcon: Record<ActionType, React.FunctionComponent> = {
  [ActionType.AUP]: AupIcon,
  [ActionType.DATA_PROMPT]: DataPromptIcon,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageIcon
}

export const ActionTypeTitle: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Acceptable Use Policy (AUP)' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Display a form' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Custom message' })
  // [ActionType.DPSK]: defineMessage({ defaultMessage: 'Generate a Ruckus DPSK' }),
}

export const ActionTypeDescription: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Requires that users signal their acceptance of the AUP or Terms & Conditions' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Displays a prompt screen with customizable data entry fields' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Displays a message to the user along with a single button to continue' })
  // [ActionType.DPSK]: defineMessage({ defaultMessage: 'Generates a DPSK, either via DPSK pools (for use in Ruckus WLAN controllers as "External DPSK") or via a Ruckus WLAN controller.' }),
}

// FIXME: Deprecated => due to we don't support action template selector anymore.
export const ActionTypeSelectionTerms: Record<ActionType, MessageDescriptor | undefined> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Select the existing AUP to use:' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Select the existing data prompt template to use:' }),
  [ActionType.DISPLAY_MESSAGE]: undefined
  // [ActionType.DPSK]: undefined,
}

// FIXME: Deprecated => due to we don't support action template selector anymore.
export const ActionTypeNewTemplateTerms: Record<ActionType, MessageDescriptor | undefined> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'A new AUP created from a standard template.' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'A new prompt created from a standard template.' }),
  [ActionType.DISPLAY_MESSAGE]: undefined
  // [ActionType.DPSK]: undefined,
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

export const ActionDefaultValueMap: Record<ActionType, object> = {
  [ActionType.AUP]: AupActionDefaultValue,
  [ActionType.DATA_PROMPT]: DataPromptActionDefaultValue,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageActionDefaultValue
  // [ActionType.DPSK]: {},
}
/* eslint-enable max-len */


export const composeNext = (
  stepId: string, stepMap: Map<string, WorkflowStep>,
  nodes: Node<WorkflowStep, ActionType>[], edges: Edge[],
  currentX: number, currentY: number,
  isStart?: boolean
) => {
  const SPACE_OF_NODES = 110
  const step = stepMap.get(stepId)

  if (!step) return

  const {
    id,
    nextStepId,
    type,
    actionType
  } = step
  const nodeType: ActionType = (actionType ?? 'START') as ActionType
  const nextStep = stepMap.get(nextStepId ?? '')

  // console.log('Step :: ', nodeType, type, enrollmentActionId)

  nodes.push({
    id,
    type: nodeType,
    position: { x: currentX, y: currentY },
    data: {
      ...step,
      isStart,
      isEnd: nextStep?.type === StepType.End
    },

    hidden: type === StepType.End || (type === StepType.Start && stepMap.size !== 2),
    deletable: false
  })

  if (nextStepId) {
    edges.push({
      id: `${id} -- ${nextStepId}`,
      source: id,
      target: nextStepId,
      type: ConnectionLineType.Step,
      style: { stroke: 'var(--acx-primary-black)' },

      deletable: false
    })

    composeNext(nextStepId, stepMap, nodes, edges,
      currentX, currentY + SPACE_OF_NODES, type === StepType.Start)
  }
}


export function toReactFlowData (steps: WorkflowStep[], definitionMap: Map<string, ActionType>)
  : { nodes: Node[], edges: Edge[] } {
  const nodes: Node<WorkflowStep, ActionType>[] = []
  const edges: Edge[] = []
  const START_X = 100
  const START_Y = 0

  if (steps.length === 0) {
    return { nodes: getInitialNodes(START_X, START_Y), edges }
  }

  const firstStep = findFirstStep(steps)
  const stepMap = toStepMap(steps, definitionMap)

  if (firstStep) {
    composeNext(firstStep.id, stepMap, nodes, edges,
      START_X, START_Y, firstStep.type === StepType.Start)
  }

  return { nodes, edges }
}