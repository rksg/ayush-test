import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import { NewAPITableResult, Workflow, WorkflowUrls }                              from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import WorkflowDetailVersionHistoryTab from './WorkflowDetailVersionHistoryTab'



const workflows:Workflow[] = [{
  id: 'id1',
  name: 'workflow-1'
}]

const publishedWorkflows: Workflow[] = [{
  id: 'id1',
  name: 'workflow-1',
  publishDetails: {
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


describe('WorkflowVersionTab', () => {
  const searchInProgressWorkflowApi = jest.fn()
  const searchVersionApi = jest.fn()
  const deleteWorkflowApi = jest.fn()
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  const params = { tenantId: 't1', policyId: workflows[0].id, activeTab: 'versionHistory' }
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
      ),
      rest.delete(
        WorkflowUrls.deleteWorkflow.url,
        (req, res, ctx) => {
          deleteWorkflowApi()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <WorkflowDetailVersionHistoryTab/>
    </Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /Version 1.*/ })
    await userEvent.click(within(row).getByRole('checkbox'))
    await screen.findByRole('button', { name: /Activate/i })
    const deleteButton = await screen.findByRole('button', { name: /Delete/i })
    await userEvent.click(deleteButton)
    await waitFor(() => expect(deleteWorkflowApi).toHaveBeenCalled())
  })
})