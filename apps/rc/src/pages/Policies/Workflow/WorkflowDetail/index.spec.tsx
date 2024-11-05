import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn }                                                                                  from '@acx-ui/feature-toggle'
import { ActionType, NewAPITableResult, Workflow, WorkflowActionDefinition, WorkflowStep, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                           from '@acx-ui/test-utils'


import WorkflowDetails from '.'

const workflows:Workflow[] = [{
  id: 'id1',
  name: 'workflow-1'
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
      priorStepId: 'step-1'
    },
    {
      id: 'step-3',
      enrollmentActionId: 'step-3-action-id',
      priorStepId: 'step-2'
    }
  ],
  paging: {
    page: 0,
    pageSize: 1,
    totalCount: 3
  }
}

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  WorkflowActionPreviewModal: () => <div data-testid='WorkflowActionPreviewModal' />,
  WorkflowComparator: () => <div data-testid='WorkflowComparator'></div>,
  WorkflowPanel: () => <div data-testid='WorkflowPanel' />
}))




describe('WorkflowDetails', () => {
  const getWorkflowApi = jest.fn()
  const searchVersionApi = jest.fn()
  const updateWorkflowApi = jest.fn()
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  const params = { tenantId: 't1', policyId: workflows[0].id }
  beforeEach(async () => {
    getWorkflowApi.mockClear()
    searchVersionApi.mockClear()
    updateWorkflowApi.mockClear()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        WorkflowUrls.getWorkflowDetail.url,
        (req, res, ctx) => {
          getWorkflowApi()
          return res(ctx.json(workflows[0]))
        }
      ),
      rest.post(
        WorkflowUrls.searchWorkflows.url.split('?')[0],
        (req, res, ctx) => {
          searchVersionApi()
          return res(ctx.json(publishedList))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowActionDefinitions.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json({ content: actionDefinitions }))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowStepsById.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(steps))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowActionRequiredDefinitions.url,
        (req, res, ctx) => {
          return res(ctx.json({ content: actionDefinitions }))
        }
      ),
      rest.patch(
        WorkflowUrls.updateWorkflow.url,
        (req, res, ctx) => {
          updateWorkflowApi()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should render header correctly', async () => {
    render(<Provider>
      <WorkflowDetails/>
    </Provider>, {
      route: { params }
    })

    const preview = await screen.findByText('Preview')
    await screen.findByText('Configure')
    await screen.findByText('Compare')
    await userEvent.click(preview)
    await screen.findByText(workflows[0].name)
    await waitFor(() => expect(getWorkflowApi).toHaveBeenCalled())
  })

  it('should close correctly', async () => {
    render(<Provider>
      <WorkflowDetails/>
    </Provider>, {
      route: { params }
    })
    await screen.findByText('URL')
    await screen.findByText('Status')
    await screen.findByText('Publish')
    const closeButton = await screen.findByText('Close')
    userEvent.click(closeButton)

    await waitFor(() => expect(getWorkflowApi).toHaveBeenCalled())
    await waitFor(() => expect(searchVersionApi).toHaveBeenCalled())
    await waitFor(()=>expect(updateWorkflowApi).toHaveBeenCalled())
  })

  it('should publish correctly', async () => {
    render(<Provider>
      <WorkflowDetails/>
    </Provider>, {
      route: { params }
    })
    await screen.findByText('URL')
    await screen.findByText('Status')
    const publishButton = await screen.findByText('Publish')
    await screen.findByText('Close')
    userEvent.click(publishButton)

    await waitFor(() => expect(getWorkflowApi).toHaveBeenCalled())
    await waitFor(() => expect(searchVersionApi).toHaveBeenCalled())
    await waitFor(()=>expect(updateWorkflowApi).toHaveBeenCalledTimes(2))
  })
})