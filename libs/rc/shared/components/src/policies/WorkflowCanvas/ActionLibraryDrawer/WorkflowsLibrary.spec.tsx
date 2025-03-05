import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  ActionType,
  NewAPITableResult,
  Workflow,
  WorkflowStep,
  WorkflowUrls
} from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { WorkflowActionPreviewModalProps } from '../../../WorkflowActionPreviewModal'

import WorkflowsLibrary from './WorkflowsLibrary'

const mockedDefinitionList = {
  content: [
    {
      id: `id-${ActionType.AUP}`,
      actionType: ActionType.AUP
    },
    {
      id: `id-${ActionType.DISPLAY_MESSAGE}`,
      actionType: ActionType.DISPLAY_MESSAGE
    },
    {
      id: `id-${ActionType.DATA_PROMPT}`,
      actionType: ActionType.DATA_PROMPT
    }
  ]
}

const workflows:Workflow[] = [{
  id: 'id1',
  name: 'workflow-1'
},{
  id: 'testWorkflowId',
  name: 'testWorkflow'
}]

const list: NewAPITableResult<Workflow> = {
  content: workflows,
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 1
  }
}

const steps: NewAPITableResult<WorkflowStep> = {
  content: [
    {
      id: 'step-1',
      enrollmentActionId: 'step-1-action-id',
      nextStepId: 'step-2'
    },
    {
      id: 'step-2',
      enrollmentActionId: 'step-2-action-id',
      nextStepId: 'step-3'
    }
  ],
  paging: {
    page: 0,
    pageSize: 1,
    totalCount: 4
  }
}

jest.mock('../../../WorkflowActionPreviewModal', () => ({
  WorkflowActionPreviewModal: (props: WorkflowActionPreviewModalProps) => {
    const { Modal } = jest.requireActual('antd')
    const { onClose } = props

    return (
      <Modal title={'test'} onCancel={onClose} visible>
        <div data-testid='WorkflowActionPreviewModalTestId' />
      </Modal>
    )
  }
}))

describe('WorkflowsLibrary', () =>{
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }
  const spyNestedClone = jest.fn()
  beforeEach(() => {
    mockServer.use(
      rest.get(
        WorkflowUrls.getWorkflowStepsById.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(steps))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowActionDefinitions.url.split('?')[0],
        (_, res, ctx) => {
          return res(ctx.json(mockedDefinitionList))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowStepsById.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json({
            content: []
          }))
        }
      ),
      rest.post(
        WorkflowUrls.searchInProgressWorkflows.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(list))
        }
      ),
      rest.post(
        WorkflowUrls.nestedCloneWorkflow.url,
        (req, res, ctx) => {
          spyNestedClone()
          return res(ctx.json(list))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><WorkflowsLibrary
      onClose={jest.fn()}
      stepId='testStepId'
      workflowId='testWorkflowId'/></Provider>,
    { route: { params } })

    const row = await screen.findByRole('row', { name: new RegExp(workflows[0].name) })
    fireEvent.mouseEnter(row)

    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should go preview workflow successfully', async () => {
    render(<Provider><WorkflowsLibrary
      onClose={jest.fn()}
      stepId='testStepId'
      workflowId='testWorkflowId'/></Provider>,
    { route: { params } })

    const row = await screen.findByRole('row', { name: new RegExp(workflows[0].name) })
    fireEvent.mouseEnter(row)

    expect(screen.getByText('Preview')).toBeInTheDocument()

    const previewButton = await screen.findByRole('button', { name: /Preview/i })
    await userEvent.click(previewButton)
  })

  it('should add workflow successfully', async () => {
    render(<Provider><WorkflowsLibrary
      onClose={jest.fn()}
      stepId='testStepId'
      workflowId='testWorkflowId'/></Provider>,
    { route: { params } })

    const row = await screen.findByRole('row', { name: new RegExp(workflows[0].name) })
    fireEvent.mouseEnter(row)

    expect(screen.getByText('Add')).toBeInTheDocument()

    const addButton = await screen.findByRole('button', { name: /Add/i })
    await userEvent.click(addButton)

    const menuItems = await screen.findAllByRole('menuitem')
    await userEvent.click(menuItems[0])
    await waitFor(() => expect(spyNestedClone).toHaveBeenCalled())
  })
})
