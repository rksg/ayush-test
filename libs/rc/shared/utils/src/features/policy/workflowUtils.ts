import { MessageDescriptor }              from '@formatjs/intl'
import { defineMessage, useIntl }         from 'react-intl'
import { ConnectionLineType, Edge, Node } from 'reactflow'
import { validate }                       from 'uuid'

import {
  AupActionTypeIcon,
  DataPromptActionTypeIcon,
  DisplayMessageActionTypeIcon,
  DpskActionTypeIcon,
  MacRegActionTypeIcon,
  CertTemplateActionTypeIcon
} from '@acx-ui/icons'

import {
  ActionType,
  AupActionContext,
  DataPromptActionContext, DataPromptVariable,
  DisplayMessageActionContext,
  UIConfiguration,
  StepType,
  WorkflowStep,
  LogoSize,
  WorkflowPanelMode,
  WorkflowNodeTypes
} from '../../types'

export const InitialEmptyStepsCount = 2
export const MaxAllowedSteps = 20
export const MaxTotalSteps = InitialEmptyStepsCount + MaxAllowedSteps

export const useGetActionDefaultValueByType = (actionType: ActionType) => {
  const { $t } = useIntl()

  return Object.entries(ActionDefaultValueMap[actionType])
    .reduce((acc: Record<string, string | boolean | object>, [key, value]) => {
      if (typeof value === 'string' || typeof value === 'boolean' || Array.isArray(value)) {
        acc[key] = value
      } else {
        acc[key] = $t(value)
      }
      return acc
    }, {})
}

export const findAllFirstSteps = (steps: WorkflowStep[]): WorkflowStep[] | undefined => {
  return steps.filter(step =>
    step.priorStepId === undefined && !step.splitOptionId
  )
}

export const toStepMap = (steps: WorkflowStep[])
  : Map<string, WorkflowStep> =>
{
  const map = new Map<string, WorkflowStep>()

  steps.forEach(step => {
    map.set(step.id, step)
  })

  return map
}

export const ActionNodeDisplay: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Acceptable Use Policy' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Display a Form' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Custom Message' }),
  [ActionType.DPSK]: defineMessage({ defaultMessage: 'Provide DPSK' }),
  [ActionType.MAC_REG]: defineMessage({ defaultMessage: 'Mac Registration' }),
  [ActionType.CERT_TEMPLATE]: defineMessage({ defaultMessage: 'Install a Certificate' })
}

export const ActionTypeCardIcon: Record<ActionType, React.FunctionComponent> = {
  [ActionType.AUP]: AupActionTypeIcon,
  [ActionType.DATA_PROMPT]: DataPromptActionTypeIcon,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageActionTypeIcon,
  [ActionType.DPSK]: DpskActionTypeIcon,
  [ActionType.MAC_REG]: MacRegActionTypeIcon,
  [ActionType.CERT_TEMPLATE]: CertTemplateActionTypeIcon
}

export const ActionTypeTitle: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Acceptable Use Policy (AUP)' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Display a Form' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Custom Message' }),
  [ActionType.DPSK]: defineMessage({ defaultMessage: 'Provide DPSK' }),
  [ActionType.MAC_REG]: defineMessage({ defaultMessage: 'MAC Address Registration' }),
  [ActionType.CERT_TEMPLATE]: defineMessage({ defaultMessage: 'Install a certificate' })
}

export const ActionTypeDescription: Record<ActionType, MessageDescriptor> = {
  [ActionType.AUP]: defineMessage({ defaultMessage: 'Requires that users signal their acceptance of the AUP or Terms & Conditions' }),
  [ActionType.DATA_PROMPT]: defineMessage({ defaultMessage: 'Displays a prompt screen with customizable data entry fields' }),
  [ActionType.DISPLAY_MESSAGE]: defineMessage({ defaultMessage: 'Displays a message to the user along with a single button to continue' }),
  [ActionType.DPSK]: defineMessage({ defaultMessage: 'Generates a Ruckus DPSK and identity, for the requested Identity Group.' }),
  [ActionType.MAC_REG]: defineMessage({ defaultMessage: 'MAC Address registers and authenticated with RADIUS, assigned to an Identity Group' }),
  [ActionType.CERT_TEMPLATE]: defineMessage({ defaultMessage: 'Creates private key from Certificate Template for the requested Identity Group' })
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

  useAupFile: false
}

export const DataPromptActionDefaultValue: {
  [key in keyof DataPromptActionContext]: MessageDescriptor | boolean | string | DataPromptVariable[]
} = {
  title: '',
  displayTitle: true,
  messageHtml: '',
  displayMessageHtml: true,
  backButtonText: 'Back',
  continueButtonText: 'Continue',
  displayBackButton: true,
  displayContinueButton: true,
  variables: [{ type: 'USER_NAME', label: 'Username' }]
}

export const DisplayMessageActionDefaultValue: {
  [key in keyof DisplayMessageActionContext]: MessageDescriptor | string | boolean
} = {
  title: '',
  messageHtml: '',
  backButtonText: 'Back',
  continueButtonText: 'Continue',
  displayBackButton: true,
  displayContinueButton: true
}

export const ActionDefaultValueMap: Record<ActionType, object> = {
  [ActionType.AUP]: AupActionDefaultValue,
  [ActionType.DATA_PROMPT]: DataPromptActionDefaultValue,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageActionDefaultValue,
  [ActionType.DPSK]: {},
  [ActionType.MAC_REG]: {},
  [ActionType.CERT_TEMPLATE]: {}
}
/* eslint-enable max-len */

export const composeNext = (
  mode: WorkflowPanelMode,
  stepId: string, 
  stepMap: Map<string, WorkflowStep>,
  parentId: string | undefined,
  nodes: Node<WorkflowStep, WorkflowNodeTypes>[], 
  edges: Edge[],
  currentX: number, 
  currentY: number,
  disconnectedBranchZIndex: number,
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
  const nodeType: WorkflowNodeTypes = (actionType ?? 'START')
  const nextStep = stepMap.get(nextStepId ?? '')

  nodes.push({
    id,
    parentNode: parentId ?? undefined,
    extent: parentId ? 'parent' : undefined,
    type: nodeType,
    position: { x: currentX, y: currentY },
    draggable: false,
    zIndex: parentId ? disconnectedBranchZIndex : 1000,
    data: {
      ...step,
      isStart,
      isEnd: nextStep?.type === StepType.End,
      mode
    },

    hidden: type === StepType.End || (type === StepType.Start && stepMap.size !== 2),
    deletable: false
  })

  let nextY = step.type === StepType.Start ? currentY : currentY + SPACE_OF_NODES

  if (nextStepId) {
    edges.push({
      id: `${id} -- ${nextStepId}`,
      source: id,
      target: nextStepId,
      type: ConnectionLineType.Step,
      style: { stroke: 'var(--acx-primary-black)' },
      zIndex: parentId ? (disconnectedBranchZIndex + 50) : 0,

      deletable: false
    })

    composeNext(mode, nextStepId, stepMap, parentId, nodes, edges,
      currentX, nextY, disconnectedBranchZIndex, type === StepType.Start)
  }
}

function addParentNode (firstStepId: string, 
  stepMap: Map<string, WorkflowStep>,
  disconnectedBranchZIndex:number,
  nodes: Node<WorkflowStep, WorkflowNodeTypes>[],
  currentX: number, 
  currentY: number
  ) {
  
  // create parent node
  let parentNodeId = firstStepId + 'parent'
  let firstStep = stepMap.get(firstStepId)
  
  if(!firstStep) return

  // Calculate the height of the parent node based on the number of nodes it will contain
  // height = number of nodes (64) + number of edges (46)
  let height = 0
  if (firstStep.nextStepId) {
    let nextNode = stepMap.get(firstStep.nextStepId)
    while(nextNode) {
      if(!nextNode.isEnd || !nextNode.isStart) {
        height += 64 + 46
      }
      nextNode = nextNode.nextStepId ? stepMap.get(nextNode.nextStepId) : undefined
    }
    height -= 46 // remove the height of an edge since we added an extra one
  }

  nodes.push({
    id: parentNodeId,
    type: 'DISCONNECTED_BRANCH',
    position: { x: currentX, y: currentY },
    style: {
      width: '260px',
      height: height + 40
    },
    zIndex: disconnectedBranchZIndex,
    hidden: false,
    deletable: false,
    data: {id: parentNodeId, enrollmentActionId: ''}
  })

  return parentNodeId
}


export function toReactFlowData (
  steps: WorkflowStep[],
  mode: WorkflowPanelMode = WorkflowPanelMode.Default
): { nodes: Node[], edges: Edge[] } {
  const nodes: Node<WorkflowStep, WorkflowNodeTypes>[] = []
  const edges: Edge[] = []
  let START_X = 100
  const START_Y = 0

  if (steps.length === 0) {
    return { nodes, edges }
  }

  // find all nodes with no prior node, then render each in turn spaced horizontally
  const firstSteps = findAllFirstSteps(steps)
  const stepMap = toStepMap(steps)

  let disconnectedBranchZIndex = 1250

  firstSteps?.forEach((firstStep) => {

    var isDisconnectedBranch = firstStep.statusReasons 
      && firstStep.statusReasons.findIndex(e => e.statusCode === 'disconnected.step') != -1

    let startX = START_X
    let startY = START_Y
    let parentNodeId = undefined
    
    if(isDisconnectedBranch) {
      disconnectedBranchZIndex += 100
      
      parentNodeId = addParentNode(firstStep.id, stepMap, disconnectedBranchZIndex, 
        nodes, START_X, START_Y)

      // Child nodes are positioned relative to the parent, so these are set to (20,20)
      startX = 20
      startY = 20

      // add additonal room for the extra wide subflow node
      START_X += 30
    }

    composeNext(mode, firstStep.id, stepMap, parentNodeId, nodes, edges,
      startX, startY, disconnectedBranchZIndex, firstStep.type === StepType.Start)

    START_X += 250
  })

  return { nodes, edges }
}

export const DefaultUIConfiguration : UIConfiguration = {
  uiColorSchema: {
    fontHeaderColor: 'var(--acx-neutrals-100)',
    backgroundColor: 'var(--acx-primary-white)',
    fontColor: 'var(--acx-neutrals-100)',

    buttonFontColor: 'var(--acx-primary-white)',
    buttonColor: 'var(--acx-accents-orange-50)'
  },
  uiStyleSchema: {
    logoSize: 'MEDIUM',
    headerFontSize: 16,
    wifi4EuNetworkId: '',
    disablePoweredBy: false
  },
  welcomeName: '',
  welcomeTitle: ''
}

export function getLogoImageSize (size: LogoSize):number {
  if (size === 'SMALL') return 105
  else if (size ==='LARGE') return 105 * 2.25
  return 105 * 1.5
}

export function validateWifi4EuNetworkId (id?: string): boolean{
  if (!id || !validate(id))
    return false
  return true
}
