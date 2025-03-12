import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn }                                                                               from '@acx-ui/feature-toggle'
import { NewAPITableResult, PolicyOperation, PolicyType, Workflow, WorkflowUrls, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                                                                   from '@acx-ui/store'
import { mockServer, render, screen }                                                                 from '@acx-ui/test-utils'

import WorkflowPageForm from '.'

const paginationPattern = '?size=:pageSize&page=:page&sort=:sort&excludeContent=:excludeContent'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')
const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

const mockWorkflowList: NewAPITableResult<Workflow> = {
  content: [],
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 1
  }
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

jest.mock('@acx-ui/rc/components', ()=> ({
  ...jest.requireActual('@acx-ui/rc/components'),
  WorkflowForm: () => <div></div>
}))

describe('Workflow page form', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: 'id'
  }
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        replacePagination(WorkflowUrls.searchInProgressWorkflows.url),
        (req, res, ctx) => {
          return res(ctx.json(mockWorkflowList))
        }
      )
    )
  })

  it('should render correctly for create', async () => {
    const path = '/:tenantId/' + getPolicyRoutePath({
      type: PolicyType.WORKFLOW, oper: PolicyOperation.CREATE })
    render(<Provider>
      <WorkflowPageForm/>
    </Provider>, {
      route: { params, path }
    })
    await screen.findByText('Add Workflow')
    await screen.findByText('Next')
    const cancelButton = await screen.findByText('Cancel')
    userEvent.click(cancelButton)
  })
})