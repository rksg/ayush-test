import { rest } from 'msw'
import { Path } from 'react-router-dom'

import { useIsSplitOn }                                                                                            from '@acx-ui/feature-toggle'
import { ActionType, NewAPITableResult, StepType, Workflow, WorkflowActionDefinition, WorkflowStep, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                                     from '@acx-ui/test-utils'

import { WorkflowDetailOverview } from './WorkflowDetailOverview'

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

const steps: WorkflowStep[] = [
  {
    id: 'id1',
    type: StepType.Basic,
    enrollmentActionId: 'id',
    actionDefinitionId: 'actionId1',
    actionType: ActionType.AUP
  },
  {
    id: 'id2',
    type: StepType.Basic,
    enrollmentActionId: '',
    actionDefinitionId: 'actionId2',
    actionType: ActionType.DATA_PROMPT
  },
  {
    id: 'id1',
    type: StepType.Basic,
    enrollmentActionId: '',
    actionDefinitionId: 'actionId3',
    actionType: ActionType.DISPLAY_MESSAGE
  }
]


// eslint-disable-next-line max-len
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
  WorkflowPanel: () => <div data-testid='WorkflowPanel' />
}))

describe('WorkflowDetailOverview', () => {
  const getWorkflowApi = jest.fn()
  const searchVersionApi = jest.fn()
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  const params = { tenantId: 't1', policyId: workflows[0].id }
  beforeEach(async () => {
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
          return res(ctx.json({ content: steps }))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowActionRequiredDefinitions.url,
        (req, res, ctx) => {
          return res(ctx.json({ content: actionDefinitions }))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <WorkflowDetailOverview/>
    </Provider>, {
      route: { params }
    })
    await screen.findByText('URL')
    await screen.findByText('Status')
    await waitFor(() => expect(getWorkflowApi).toHaveBeenCalled())
    await waitFor(() => expect(searchVersionApi).toHaveBeenCalled())
  })
})