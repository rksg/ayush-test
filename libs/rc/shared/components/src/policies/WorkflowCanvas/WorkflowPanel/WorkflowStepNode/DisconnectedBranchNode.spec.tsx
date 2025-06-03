import { NodeProps, ReactFlowProvider } from 'reactflow'

import { useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { ActionType, WorkflowStep } from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { render, screen }    from '@acx-ui/test-utils'

import DisconnectedBranchNode from './DisconnectedBranchNode'

const child = <div data-testid={'expectedChild'} />

const mockNodeProps: NodeProps<WorkflowStep> = {
  id: 'mock-step-id',
  type: 'AUP' as ActionType,
  data: {
    enrollmentActionId: 'mock-enrollment-action-id',
    actionType: ActionType.AUP
  } as WorkflowStep,
  selected: false,
  dragging: false,
  zIndex: 0,
  isConnectable: false,
  xPos: 0,
  yPos: 0
}

const mockInvalidNodeProps: NodeProps<WorkflowStep> = {
  id: 'mock-step-id',
  type: 'AUP' as ActionType,
  data: {
    enrollmentActionId: 'mock-enrollment-action-id',
    actionType: ActionType.AUP,
    status: 'INVALID',
    statusReasons: [{ statusCode: 'multiple.onboarding.steps',
      statusReason: 'Test Status Reason 1234' }]
  } as WorkflowStep,
  selected: false,
  dragging: false,
  zIndex: 0,
  isConnectable: false,
  xPos: 0,
  yPos: 0
}

jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  useNodeId: () => 'mock-step-id'
}))
jest.mock('../../../../WorkflowActionPreviewModal', () => ({
  WorkflowActionPreviewModal: () => (
    <div data-testid={'WorkflowActionPreviewModalTestId'} />
  )
}))

describe('DisconnectedBranchNode', () => {

  it('should render DisconnectedBranchNode correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <ReactFlowProvider>
          <DisconnectedBranchNode
            {...mockNodeProps}
            data={{
              ...mockNodeProps.data,
              isStart: true,
              isEnd: true
            }}
          />
        </ReactFlowProvider>
      </Provider>
    )

    // default style
    expect(screen.queryByTestId('Plus')).toBeVisible()
    expect(screen.queryByTestId('WarningCircleSolid')).toBeVisible()
  })

  it('should render DisconnectedBranchNode without warning icon if ff is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(
      <Provider>
        <ReactFlowProvider>
          <DisconnectedBranchNode
            {...mockNodeProps}
            data={{
              ...mockNodeProps.data,
              isStart: true,
              isEnd: true
            }}
          />
        </ReactFlowProvider>
      </Provider>
    )

    // default style
    expect(screen.queryByTestId('Plus')).toBeVisible()
    expect(screen.queryByTestId('WarningCircleSolid')).toBeNull()
  })

})
