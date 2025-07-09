import { ReactNode, useEffect } from 'react'

import userEvent                        from '@testing-library/user-event'
import { Switch }                       from 'antd'
import { NodeProps, ReactFlowProvider } from 'reactflow'

import { Button }         from '@acx-ui/components'
import { ActionType }     from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { mockInitialNodes }                            from './__tests__/fixtures'
import { useWorkflowContext, WorkflowContextProvider } from './WorkflowContextProvider'

jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow')
}))

describe('WorkflowContextProvider', () => {
  const mockWorkflowId = 'mock-workflow-id'

  const RenderContext = (props: { children: ReactNode }) => {
    return (<Provider>
      <ReactFlowProvider>
        <WorkflowContextProvider
          workflowId={mockWorkflowId}
        >
          {/* eslint-disable-next-line testing-library/no-node-access */}
          {props.children}
        </WorkflowContextProvider>
      </ReactFlowProvider>
    </Provider>)
  }

  it('should handle ActionDrawerState correctly', async () => {
    const TestContextComponent = () => {
      const { workflowId, actionDrawerState } = useWorkflowContext()

      return (
        <>
          {workflowId}
          <Switch
            checked={actionDrawerState.visible}
            data-testid={'actionDrawerVisible'}
          />
          <Button onClick={actionDrawerState.onOpen}>Open</Button>
          <Button onClick={actionDrawerState.onClose}>Close</Button>
        </>
      )
    }

    render(<RenderContext><TestContextComponent/></RenderContext>)

    expect(screen.getByText(new RegExp(mockWorkflowId))).toBeInTheDocument()

    // Check Default state
    expect(screen.getByTestId('actionDrawerVisible')).not.toBeChecked()

    await userEvent.click(screen.getByRole('button', { name: /open/i }))
    expect(screen.getByTestId('actionDrawerVisible')).toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.getByTestId('actionDrawerVisible')).not.toBeChecked()
  })

  it('should handle StepDrawerState correctly', async () => {
    const TestContextComponent = () => {
      const { workflowId, stepDrawerState } = useWorkflowContext()

      const openStepDrawer = () => {
        stepDrawerState.onOpen(true, ActionType.AUP)
      }

      return (
        <>
          {workflowId}
          <Switch
            checked={stepDrawerState.visible}
            data-testid={'stepDrawerVisible'}
          />
          <Button onClick={openStepDrawer}>Open</Button>
          <Button onClick={stepDrawerState.onClose}>Close</Button>
        </>
      )
    }

    render(<RenderContext><TestContextComponent/></RenderContext>)

    expect(screen.getByText(new RegExp(mockWorkflowId))).toBeInTheDocument()

    // Check Default state
    expect(screen.getByTestId('stepDrawerVisible')).not.toBeChecked()

    await userEvent.click(screen.getByRole('button', { name: /open/i }))
    expect(screen.getByTestId('stepDrawerVisible')).toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.getByTestId('stepDrawerVisible')).not.toBeChecked()
  })

  it('should handle ExistingDependencies correctly', async () => {
    const TestContextComponent = () => {
      const { workflowId, nodeState } = useWorkflowContext()

      useEffect(() => {
        const mockedNodesMap = new Map()
        mockInitialNodes.forEach(n => mockedNodesMap.set(n.id, n))
        nodeState.setNodeMap(mockedNodesMap)
      }, [])

      const triggerSelectedNode = () => {
        if (mockInitialNodes[1]) {
          nodeState.setInteractedNode(mockInitialNodes[1] as unknown as NodeProps)
        }
      }

      return (
        <>
          {workflowId}

          {Array.from(nodeState.existingDependencies)
            .map(type => (<div key={type}>{type}</div>))}

          <Button onClick={triggerSelectedNode}>
            Select the last step
          </Button>
        </>
      )
    }

    render(<RenderContext><TestContextComponent/></RenderContext>)

    expect(screen.getByText(new RegExp(mockWorkflowId))).toBeInTheDocument()

    // Mock user select the last step
    await userEvent.click(screen.getByRole('button', { name: /Select/i }))

    // Check the selected action types we had before the last step
    await screen.findByText(ActionType.AUP)
    await screen.findByText(ActionType.DISPLAY_MESSAGE)
  })
})
