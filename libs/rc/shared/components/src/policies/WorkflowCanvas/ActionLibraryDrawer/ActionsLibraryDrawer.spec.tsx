import { rest } from 'msw'

import {
  ActionType,
  NewAPITableResult,
  Workflow,
  WorkflowActionDefinition,
  WorkflowStep,
  WorkflowUrls
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { RequiredDependency } from '../WorkflowPanel'

import ActionsLibraryDrawer from './ActionsLibraryDrawer'

const workflows:Workflow[] = [{
  id: 'id1',
  name: 'workflow-1'
},{
  id: 'testWorkflowId',
  name: 'testWorkflow'
}]

const publishedWorkflows: Workflow[] = [{
  id: 'id1',
  name: 'workflow-1',
  publishedDetails: {
    status: 'PUBLISHED',
    version: 1,
    publishedDate: '2024-02-01'
  },
  links: [
    {
      rel: 'enrollmentPortal',
      href: '/url'
    }
  ]
}]

const publishedList: NewAPITableResult<Workflow> = {
  content: publishedWorkflows,
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 1
  }
}

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

const actionDefinitions: WorkflowActionDefinition[] = [
  {
    actionType: ActionType.AUP,
    id: 'actionId1',
    name: 'action1',
    category: '',
    isSplit: false,
    localizationDescriptionId: '',
    hasEndActions: false
  },
  {
    actionType: ActionType.DATA_PROMPT,
    id: 'actionId2',
    name: 'action2',
    category: '',
    isSplit: false,
    localizationDescriptionId: '',
    hasEndActions: false
  },
  {
    actionType: ActionType.DISPLAY_MESSAGE,
    id: 'actionId3',
    name: 'action3',
    category: '',
    isSplit: false,
    localizationDescriptionId: '',
    hasEndActions: false
  }
]
describe('ActionsLibraryDrawer', () =>{
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        WorkflowUrls.getWorkflowStepsById.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(steps))
        }
      ),
      rest.post(
        WorkflowUrls.searchInProgressWorkflows.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(list))
        }
      ),
      rest.post(
        WorkflowUrls.searchWorkflows.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(publishedList))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowActionDefinitions.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json({ content: actionDefinitions }))
        }
      )
    )
  })

  it('should render correctly', async () => {
    const mockedOneOfRelationshipMap: Partial<Record<ActionType, RequiredDependency>> = {
      [ActionType.DATA_PROMPT]: {
        type: 'ALL',
        required: new Set([ActionType.AUP, ActionType.DISPLAY_MESSAGE])
      }
    }

    render(<Provider><ActionsLibraryDrawer
      workflowId='testWorkflowId'
      onClose={jest.fn()}
      onClickAction={jest.fn()}
      relationshipMap={mockedOneOfRelationshipMap}
      visible/></Provider>,
    { route: { params } })

    expect(screen.getByText('Actions Library')).toBeInTheDocument()
    expect(screen.getByText('Workflows Library')).toBeInTheDocument()
  })
})
