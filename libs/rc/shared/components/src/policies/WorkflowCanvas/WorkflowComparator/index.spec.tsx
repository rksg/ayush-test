import userEvent      from '@testing-library/user-event'
import { rest }       from 'msw'
import { Path }       from 'react-router-dom'
import ResizeObserver from 'resize-observer-polyfill'

import { useIsSplitOn }                                            from '@acx-ui/feature-toggle'
import { Workflow, WorkflowStep, WorkflowUrls } from '@acx-ui/rc/utils'
import { NewAPITableResult } from '@acx-ui/utils'
import { Provider }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                     from '@acx-ui/test-utils'

import { WorkflowComparator } from '.'


global.ResizeObserver = ResizeObserver

const workflow: Workflow = {
  id: 'id1',
  name: 'workflow-1'
}

const publishedWorkflow: Workflow = {
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


describe('WorkflowComparator', () => {
  const getWorkflowApi = jest.fn()
  const getWorkflowStepApi = jest.fn()
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  const params = { tenantId: 't1', policyId: workflow.id }
  beforeEach(async () => {
    getWorkflowApi.mockClear()
    getWorkflowStepApi.mockClear()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        WorkflowUrls.getWorkflowDetail.url,
        (req, res, ctx) => {
          getWorkflowApi()
          return res(ctx.json(workflow))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowStepsById.url.split('?')[0],
        (req, res, ctx) => {
          getWorkflowStepApi()
          return res(ctx.json(steps))
        }
      )
    )
  })

  it('should render draft correctly', async () => {
    render(<Provider>
      <WorkflowComparator
        onClose={()=>{}}
        draftWorkflowId={workflow.id}
        publishedWorkflowId={publishedWorkflow.id}/>
    </Provider>, {
      route: { params }
    })
    await screen.findByRole('img', { name: 'loader' })
    await screen.findByText(workflow.name)
    await waitFor(() => expect(getWorkflowApi).toHaveBeenCalled())
    await waitFor(() => expect(getWorkflowStepApi).toHaveBeenCalled())
    const closeButton = await screen.findByText('Close')
    userEvent.click(closeButton)
  })
})