import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeConfigTemplateUrlsInfo }          from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { AddTunnelProfileTemplate } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))

const createViewPath = '/:tenantId/t/policies/tunnelProfile/create'

describe('AddTunnelProfileTemplate', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.mocked(mockedUsedNavigate).mockReset()
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeConfigTemplateUrlsInfo.addTunnelProfileTemplate.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })
  it('should create tunnel profile template successful', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddTunnelProfileTemplate />
      </Provider>
      , { route: { path: createViewPath, params } }
    )
    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, 'TestTunnel')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/configTemplates`,
      hash: '',
      search: ''
    }, { replace: true }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <AddTunnelProfileTemplate />
      </Provider>
      , { route: { path: createViewPath, params } }
    )
    expect(screen.getByRole('link', {
      name: 'Configuration Templates'
    })).toBeVisible()
  })

  it('Click cancel button and go back to config template list page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddTunnelProfileTemplate />
      </Provider>
      , { route: { path: createViewPath, params } }
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/configTemplates`,
      hash: '',
      search: ''
    })
  })
})
