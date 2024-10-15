import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { Workflow, WorkflowUrls }              from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

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

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  WorkflowActionPreviewModal: () => <div data-testid='WorkflowActionPreviewModal' />,
  WorkflowComparator: () => <div data-testid='WorkflowComparator'></div>
}))


describe('WorkflowPageHeader', () => {
  const getWorkflowApi = jest.fn()
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
          return res(ctx.json([]))
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

    const preview = await screen.findByText('Preview')
    await screen.findByText('Configure')
    await screen.findByText('Compare')
    await userEvent.click(preview)
    await screen.findByText(workflows[0].name)
    await waitFor(() => expect(getWorkflowApi).toHaveBeenCalled())
  })
})