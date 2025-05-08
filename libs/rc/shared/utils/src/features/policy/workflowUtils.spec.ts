import { Edge, Node } from 'reactflow'

import { renderHook } from '@acx-ui/test-utils'

import { ActionType, WorkflowPanelMode, WorkflowStep } from '../../types'

import {
  AupActionDefaultValue,
  composeNext,
  findAllFirstSteps,
  toReactFlowData,
  toStepMap,
  useGetActionDefaultValueByType,
  validateWifi4EuNetworkId
} from './workflowUtils'


const mockWorkflowSteps: WorkflowStep[] = [
  {
    id: 'step-1',
    actionDefinitionId: 'definition-id-1',
    actionType: ActionType.AUP,
    enrollmentActionId: 'enrollment-id-1'
  },
  {
    id: 'step-2',
    actionDefinitionId: 'definition-id-2',
    actionType: ActionType.DISPLAY_MESSAGE,
    enrollmentActionId: 'enrollment-id-2'
  }
]

const mockReverseOrderSteps: WorkflowStep[] = [
  {
    id: 'step-1',
    actionDefinitionId: 'definition-id-3',
    enrollmentActionId: 'enrollment-id-1',
    priorStepId: 'step-2',
    actionType: ActionType.DATA_PROMPT
  },
  {
    id: 'step-2',
    actionDefinitionId: 'definition-id-2',
    enrollmentActionId: 'enrollment-id-2',
    nextStepId: 'step-1',
    priorStepId: 'step-3',
    actionType: ActionType.DISPLAY_MESSAGE
  },
  {
    id: 'step-3',
    actionDefinitionId: 'definition-id-1',
    enrollmentActionId: 'enrollment-id-3',
    nextStepId: 'step-2',
    actionType: ActionType.AUP
  }
]


const mockDisconnectedSteps: WorkflowStep[] = [
  {
    id: 'step-1a',
    actionDefinitionId: 'definition-id-3',
    enrollmentActionId: 'enrollment-id-1',
    nextStepId: 'step-1b',
    actionType: ActionType.DATA_PROMPT
  },
  {
    id: 'step-1b',
    actionDefinitionId: 'definition-id-2',
    enrollmentActionId: 'enrollment-id-2',
    priorStepId: 'step-1a',
    actionType: ActionType.DISPLAY_MESSAGE
  },
  {
    id: 'step-2a',
    actionDefinitionId: 'definition-id-3',
    enrollmentActionId: 'enrollment-id-1',
    nextStepId: 'step-2b',
    actionType: ActionType.DATA_PROMPT
  },
  {
    id: 'step-2b',
    actionDefinitionId: 'definition-id-2',
    enrollmentActionId: 'enrollment-id-2',
    priorStepId: 'step-2a',
    nextStepId: 'step-2c',
    actionType: ActionType.DISPLAY_MESSAGE
  },
  {
    id: 'step-2c',
    actionDefinitionId: 'definition-id-1',
    enrollmentActionId: 'enrollment-id-3',
    priorStepId: 'step-2b',
    actionType: ActionType.AUP
  }
]


describe('WorkflowUtils', () => {
  it('should handle toStepMap correctly', () => {
    // Make sure empty input with empty output
    expect(toStepMap([]).size).toBe(0)

    // Make sure function is working
    const result = toStepMap(mockWorkflowSteps)
    expect(result.size).toBe(mockWorkflowSteps.length)

    mockWorkflowSteps.forEach(step => {
      expect(result.get(step.id)?.actionType).toBe(step.actionType)
    })
  })

  it('should handle findAllFirstSteps correctly', () => {
    const mockNotCompletedSteps: WorkflowStep[] = [
      {
        id: 'step-1',
        enrollmentActionId: 'enrollment-id-1',
        priorStepId: 'step-2'
      },
      {
        id: 'step-2',
        enrollmentActionId: 'enrollment-id-2',
        nextStepId: 'step-1',
        priorStepId: 'step-3'
      },
      {
        id: 'step-3',
        enrollmentActionId: 'enrollment-id-3',
        nextStepId: 'step-2',
        priorStepId: 'step-4'
      }
    ]
    expect(findAllFirstSteps([])).toHaveLength(0)

    const reverseResult = findAllFirstSteps(mockReverseOrderSteps)
    expect(reverseResult).toHaveLength(1)
    expect(reverseResult).toContain(mockReverseOrderSteps[mockReverseOrderSteps.length - 1])

    const notCompletedResult = findAllFirstSteps(mockNotCompletedSteps)
    expect(notCompletedResult).toHaveLength(0)


    const disconnectedResult = findAllFirstSteps(mockDisconnectedSteps)
    expect(disconnectedResult).toHaveLength(2)
    expect(disconnectedResult).toContain(mockDisconnectedSteps[0])
    expect(disconnectedResult).toContain(mockDisconnectedSteps[2])

  })

  it('should handle useGetActionDefaultValueByType correctly', () => {
    const result = renderHook(() => useGetActionDefaultValueByType(ActionType.AUP)).result.current

    // boolean type
    expect(result.checkboxDefaultState).toBe(AupActionDefaultValue.checkboxDefaultState)
    expect(result.checkboxDefaultState).not.toBe('true')

    // string type
    expect(result.checkboxHighlightColor).toBe(AupActionDefaultValue.checkboxHighlightColor)
  })

  it('should handle composeNext correctly', () => {
    const targetNodes: Node<WorkflowStep, ActionType>[] = []
    const targetEdges: Edge[] = []
    composeNext(
      WorkflowPanelMode.Default,
      findAllFirstSteps(mockReverseOrderSteps)?.[0].id!,
      toStepMap(mockReverseOrderSteps),
      targetNodes, targetEdges, 0, 0
    )

    expect(targetNodes).toHaveLength(3)
    expect(targetEdges).toHaveLength(2)
  })

  it('should handle composeNext with empty input correctly', () => {
    // mock the number of array
    const targetNodes: Node<WorkflowStep, ActionType>[] = [
      { } as Node<WorkflowStep, ActionType>,
      { } as Node<WorkflowStep, ActionType>
    ]
    const targetEdges: Edge[] = [{ } as Edge]
    composeNext(
      WorkflowPanelMode.Default,
      'step-unknown-id',
      new Map(),
      targetNodes, targetEdges, 0, 0
    )

    // if it can not find the next one, it should not modify the original Node[] and Edge[] input sources.
    expect(targetNodes).toHaveLength(2)
    expect(targetEdges).toHaveLength(1)
  })

  it('should handle toReactFlowData with empty input correctly', () => {
    expect(toReactFlowData([])).toStrictEqual({ nodes: [], edges: [] })
  })

  it('should handle toReactFlowData correctly', () => {
    const expectedNodesOrders = mockReverseOrderSteps.map(s => s.id)
    const result = toReactFlowData(mockReverseOrderSteps, WorkflowPanelMode.Design)

    expect(result.nodes).toHaveLength(3)
    // Make sure the ordering of Nodes
    result.nodes.forEach(node => {
      expect(node.id).toBe(expectedNodesOrders.pop())
      expect(node.data.mode).toBe(WorkflowPanelMode.Design)
    })
    expect(result.nodes.map(n => n.type))
      .toEqual([ActionType.AUP, ActionType.DISPLAY_MESSAGE, ActionType.DATA_PROMPT])

    expect(result.edges).toHaveLength(2)
  })

  it('should validateWifi4EuNetworkId correctly', () => {
    expect(validateWifi4EuNetworkId()).toBeFalsy()
    expect(validateWifi4EuNetworkId('1244')).toBeFalsy()
    expect(validateWifi4EuNetworkId('345097ee-e951-4bb9-b227-dd35e7f479d1')).toBeTruthy()
  })
})


