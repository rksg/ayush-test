import { rest } from 'msw'
import { Path } from 'react-router-dom'

import { useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { NewAPITableResult, Workflow, WorkflowUrls }                      from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

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
  }
}]


const list: NewAPITableResult<Workflow> = {
  content: workflows,
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 1
  }
}

const publishedList: NewAPITableResult<Workflow> = {
  content: publishedWorkflows,
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 1
  }
}


const paginationPattern = '?size=:pageSize&page=:page&sort=:sort&excludeContent=:excludeContent'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')
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


describe('WorkflowOverviewTab', () => {
  const searchInProgressWorkflowApi = jest.fn()
  const searchVersionApi = jest.fn()
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  const params = { tenantId: 't1', policyId: workflows[0].id, activeTab: 'overview' }
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        replacePagination(WorkflowUrls.searchInProgressWorkflows.url),
        (req, res, ctx) => {
          searchInProgressWorkflowApi()
          return res(ctx.json(list))
        }
      ),
      rest.post(
        replacePagination(WorkflowUrls.searchWorkflows.url),
        (req, res, ctx) => {
          searchVersionApi()
          res(ctx.json(publishedList))
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Status')
    await screen.findByText('Active Version')
    await screen.findByText('Identity Group')
    await screen.findByText('Preview')
    await waitFor(() => expect(searchInProgressWorkflowApi).toHaveBeenCalled())
    await waitFor(() => expect(searchVersionApi).toHaveBeenCalled())
  })
})