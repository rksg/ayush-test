import { Path } from 'react-router-dom'

import { useIsSplitOn }                                    from '@acx-ui/feature-toggle'
import { WorkflowFormMode }                                from '@acx-ui/rc/components'
import { PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { render, screen }                                  from '@acx-ui/test-utils'

import WorkflowPageForm from '.'
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
  })

  it('should render correctly for create', async () => {
    const path = '/:tenantId/' + getPolicyRoutePath({
      type: PolicyType.WORKFLOW, oper: PolicyOperation.CREATE })
    render(<Provider>
      <WorkflowPageForm mode={WorkflowFormMode.CREATE}/>
    </Provider>, {
      route: { params, path }
    })
    await screen.findByText('Add Workflow')
  })

  it('should render correctly for edit', async () => {
    const path = '/:tenantId/' + getPolicyRoutePath({
      type: PolicyType.WORKFLOW, oper: PolicyOperation.EDIT })
    render(<Provider>
      <WorkflowPageForm mode={WorkflowFormMode.EDIT}/>
    </Provider>, {
      route: { params, path }
    })
    await screen.findByText('Edit Workflow')
  })
})