import userEvent                        from '@testing-library/user-event'
import { rest }                         from 'msw'
import { NodeProps, ReactFlowProvider } from 'reactflow'

import { useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { ActionType, WorkflowStep, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor }    from '@acx-ui/test-utils'

import { WorkflowContext,
  WorkflowContextProps,
  WorkflowContextProvider } from '../WorkflowContextProvider'

import BaseStepNode from './BaseStepNode'

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

describe('BaseStepNode', () => {
  const spyDeleteStepFn = jest.fn()
  const spyDeleteIndividualStepFn = jest.fn()
  const spyDeleteStepChildrenFn = jest.fn()

  beforeEach(() => {
    spyDeleteStepFn.mockClear()
    spyDeleteIndividualStepFn.mockClear()
    spyDeleteStepChildrenFn.mockClear()

    mockServer.use(
      rest.delete(
        WorkflowUrls.deleteWorkflowStep.url,
        (req, res, ctx) => {
          if(req.headers.get('accept') === 'application/vnd.ruckus.v2+json') {
            spyDeleteIndividualStepFn()
          } else {
            spyDeleteStepFn()
          }
          return res(ctx.json({}))
        }
      ),
      rest.delete(
        WorkflowUrls.deleteWorkflowStepDescendants.url,
        (_, res, ctx) => {
          spyDeleteStepChildrenFn()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should render BaseStepNode with children correctly', async () => {
    render(
      <Provider>
        <ReactFlowProvider>
          <BaseStepNode
            {...mockNodeProps}
            children={child}
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
    expect(screen.getByTestId('expectedChild')).toBeVisible()
    expect(screen.getByTestId('StartFlag')).toBeVisible()
    expect(screen.getByTestId('EndFlag')).toBeVisible()

    // selected style would not show up
    expect(screen.queryByTestId('Plus')).toBeNull()
    expect(screen.queryByTestId('MoreVertical')).toBeNull()
  })

  it('should render BaseStepNode in invalid state correctly', async () => {
    render(
      <Provider>
        <ReactFlowProvider>
          <BaseStepNode
            {...mockInvalidNodeProps}
            children={child}
            data={{
              ...mockInvalidNodeProps.data,
              isStart: true,
              isEnd: true
            }}
          />
        </ReactFlowProvider>
      </Provider>
    )

    // default style
    expect(screen.getByTestId('expectedChild')).toBeVisible()
    expect(screen.getByTestId('StartFlag')).toBeVisible()
    expect(screen.getByTestId('EndFlag')).toBeVisible()
    expect(screen.getByTestId('WarningCircleSolid')).toBeVisible()

    // selected style would not show up
    expect(screen.queryByTestId('Plus')).toBeNull()
    expect(screen.queryByTestId('MoreVertical')).toBeNull()
  })

  it('should render BaseStepNode while is selected', async () => {
    render(
      <Provider>
        <ReactFlowProvider>
          <BaseStepNode
            {...mockNodeProps}
            children={child}
            selected={true}
          />
        </ReactFlowProvider>
      </Provider>
    )

    expect(screen.queryByTestId('StartFlag')).toBeNull()
    expect(screen.queryByTestId('EndFlag')).toBeNull()

    expect(screen.getByTestId('expectedChild')).toBeVisible()
    expect(screen.getByTestId('Plus')).toBeVisible()

    const moreButton = screen.getByTestId('MoreVertical')
    await userEvent.hover(moreButton)

    // Make sure the ToolBar is in the document
    expect(await screen.findByTestId('EditOutlined')).toBeInTheDocument()
    expect(await screen.findByTestId('EyeOpenOutlined')).toBeInTheDocument()
    expect(await screen.findByTestId('DeleteOutlined')).toBeInTheDocument()
  })

  it('should delete step correctly', async () => {
    render(
      <Provider>
        <ReactFlowProvider>
          <WorkflowContextProvider workflowId={'mock-workflow-id'}>
            <BaseStepNode
              {...mockNodeProps}
              children={child}
              selected={true}
            />
          </WorkflowContextProvider>
        </ReactFlowProvider>
      </Provider>,
      { route: { params: { policyId: 'mock-workflow-id' } } }
    )

    await userEvent.hover(screen.getByTestId('MoreVertical'))
    await userEvent.click(await screen.findByTestId('DeleteOutlined'))
    await userEvent.click(await screen.findByRole('button', { name: /delete step/i }))

    await waitFor(() => expect(spyDeleteStepFn).toHaveBeenCalled())
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /delete step/i })).toBeNull()
    })
  })

  it('should delete individual step correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <ReactFlowProvider>
          <WorkflowContextProvider workflowId={'mock-workflow-id'}>
            <BaseStepNode
              {...mockNodeProps}
              children={child}
              selected={true}
            />
          </WorkflowContextProvider>
        </ReactFlowProvider>
      </Provider>,
      { route: { params: { policyId: 'mock-workflow-id' } } }
    )

    await userEvent.hover(screen.getByTestId('MoreVertical'))
    await userEvent.hover(await screen.findByTestId('DeleteOutlined'))
    await userEvent.click(await screen.findByRole('menuitem', { name: /Delete Action Only/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Action' }))

    await waitFor(() => expect(spyDeleteIndividualStepFn).toHaveBeenCalled())
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Delete Action' })).toBeNull()
    })
  })

  it('should delete steps children correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <ReactFlowProvider>
          <WorkflowContextProvider workflowId={'mock-workflow-id'}>
            <BaseStepNode
              {...mockNodeProps}
              children={child}
              selected={true}
            />
          </WorkflowContextProvider>
        </ReactFlowProvider>
      </Provider>,
      { route: { params: { policyId: 'mock-workflow-id' } } }
    )

    await userEvent.hover(screen.getByTestId('MoreVertical'))
    await userEvent.hover(await screen.findByTestId('DeleteOutlined'))
    await userEvent.click(await screen.findByRole('menuitem',
      { name: /Delete Action\'s Children/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Action\'s Children' }))

    await waitFor(() => expect(spyDeleteStepChildrenFn).toHaveBeenCalled())
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Delete Action\'s Children' })).toBeNull()
    })
  })

  it('should render BaseStepNode with WorkflowContext correctly for edit/preview/add', async () => {
    const spyStepDrawerOnOpen = jest.fn()
    const spyActionDrawerOnOpen = jest.fn()

    render(
      <Provider>
        <ReactFlowProvider>
          <WorkflowContext.Provider value={{
            workflowId: 'mock-workflow-id',
            stepDrawerState: {
              onOpen: spyStepDrawerOnOpen
            },
            actionDrawerState: {
              onOpen: spyActionDrawerOnOpen
            },
            nodeState: {
              setInteractedNode: jest.fn()
            }
          } as unknown as WorkflowContextProps}>
            <BaseStepNode
              {...mockNodeProps}
              children={child}
              selected={true}
            />
          </WorkflowContext.Provider>
        </ReactFlowProvider>
      </Provider>,
      { route: { params: { policyId: 'mock-workflow-id' } } }
    )

    await userEvent.hover(screen.getByTestId('MoreVertical'))
    await userEvent.click(await screen.findByTestId('EditOutlined'))
    expect(spyStepDrawerOnOpen).toHaveBeenCalledWith(true, mockNodeProps.type)

    await userEvent.hover(screen.getByTestId('MoreVertical'))
    await userEvent.click(await screen.findByTestId('EyeOpenOutlined'))
    expect(await screen.findByTestId('WorkflowActionPreviewModalTestId')).toBeVisible()

    await userEvent.click(await screen.findByTestId('Plus'))
    expect(spyActionDrawerOnOpen).toHaveBeenCalled()
  })
})
