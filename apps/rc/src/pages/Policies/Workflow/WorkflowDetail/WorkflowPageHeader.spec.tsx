import { rest } from 'msw'
import { Path } from 'react-router-dom'

import { useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { Workflow, WorkflowUrls }                                         from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import WorkflowPageHeader from './WorkflowPageHeader'

const workflows:Workflow[] = [{
  id: 'id1',
  name: 'workflow-1'
}]

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

jest.mock('./WorkflowTabs', ()=> {
  return <div></div>
})


describe('WorkflowPageHeader', () => {
  const getWorkflowApi = jest.fn()
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  const params = { tenantId: 't1', policyId: workflows[0].id, activeTab: 'overview' }
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        WorkflowUrls.getWorkflowDetail.url,
        (req, res, ctx) => {
          getWorkflowApi()
          return res(ctx.json(workflows[0]))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <WorkflowPageHeader/>
    </Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Preview')
    await screen.findByText('Configure')
    await screen.findByText(workflows[0].name)
    await waitFor(() => expect(getWorkflowApi).toHaveBeenCalled())
  })
})