import { ReactFlowProvider } from 'reactflow'

import { ActionNodeDisplay, WorkflowPanelMode } from '@acx-ui/rc/utils'
import { Provider }                             from '@acx-ui/store'
import { render, screen }                       from '@acx-ui/test-utils'

import { mockInitialNodes, mockInitialEdges, setupLocalReactFlow, $t } from './__tests__/fixtures'
import WorkflowCanvas                                                  from './WorkflowCanvas'


describe('Workflow Canvas', () => {

  beforeEach(() => {
    setupLocalReactFlow()
  })

  const verifyStepNodesAreReady = async () => {
    expect(await screen.findByText($t(ActionNodeDisplay.AUP))).toBeInTheDocument()
    expect(await screen.findByText($t(ActionNodeDisplay.DISPLAY_MESSAGE))).toBeInTheDocument()
  }

  it('should render canvas in Edit mode correctly', async () => {
    render(<Provider>
      <ReactFlowProvider>
        <WorkflowCanvas
          mode={WorkflowPanelMode.Edit}
          initialNodes={mockInitialNodes}
          initialEdges={mockInitialEdges}
        />
      </ReactFlowProvider>
    </Provider>)

    await verifyStepNodesAreReady()

    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()  // Check the <Controls />
    expect(screen.queryByText(/Active Workflow Design/i)).not.toBeInTheDocument() // Check the <Panel />
  })

  it('should render canvas in Design mode correctly', async () => {
    render(<Provider>
      <ReactFlowProvider>
        <WorkflowCanvas
          mode={WorkflowPanelMode.Design}
          initialNodes={mockInitialNodes}
          initialEdges={mockInitialEdges}
        />
      </ReactFlowProvider>
    </Provider>)

    await verifyStepNodesAreReady()

    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()  // Check the <Controls />
    expect(screen.queryByText(/Active Workflow Design/i)).not.toBeInTheDocument() // Check the <Panel />
  })

  it('should render canvas in Default mode correctly', async () => {
    render(<Provider>
      <ReactFlowProvider>
        <WorkflowCanvas
          mode={WorkflowPanelMode.Default}
          initialNodes={mockInitialNodes}
          initialEdges={mockInitialEdges}
        />
      </ReactFlowProvider>
    </Provider>)

    await verifyStepNodesAreReady()

    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()  // Check the <Controls />
    expect(screen.getByText(/Active Workflow Design/i)).toBeInTheDocument() // Check the <Panel />
  })
})


