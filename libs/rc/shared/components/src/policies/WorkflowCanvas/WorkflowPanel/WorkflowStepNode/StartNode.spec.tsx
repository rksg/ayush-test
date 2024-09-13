import userEvent                        from '@testing-library/user-event'
import { NodeProps, ReactFlowProvider } from 'reactflow'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { WorkflowContext, WorkflowContextProps } from '../WorkflowContextProvider'

import { StartNode } from './StartNode'


describe('StartNode', () => {
  it('should render StartNode correctly', async () => {
    const spyActionDrawerOnOpen = jest.fn()

    render(<Provider>
      <ReactFlowProvider>
        <WorkflowContext.Provider value={{
          actionDrawerState: {
            onOpen: spyActionDrawerOnOpen
          },
          nodeState: {
            setInteractedNode: jest.fn()
          }
        } as unknown as WorkflowContextProps}>
          <StartNode {...{} as NodeProps}/>
        </WorkflowContext.Provider>
      </ReactFlowProvider>
    </Provider>)

    expect(screen.getByTestId('StarterIcon')).toBeVisible()

    await userEvent.click(screen.getByTestId('StarterIcon'))
    expect(spyActionDrawerOnOpen).toHaveBeenCalled()
  })
})
