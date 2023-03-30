import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import { TunnelProfileUrls }          from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import AddTunnelProfile from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const tableViewPath = '/:tenantId/t/policies/tunnelProfile/list'

describe('AddTunnelProfile', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        TunnelProfileUrls.createTunnelProfile.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })
  it('should create tunnel profile successful', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddTunnelProfile />
      </Provider>
      , { route: { path: tableViewPath, params } }
    )
    const policyNameField = screen.getByRole('textbox', { name: 'Policy Name' })
    await user.type(policyNameField, 'TestTunnel')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/tunnelProfile/list`,
      hash: '',
      search: ''
    }, { replace: true }))
  })

  it('Click cancel button and go back to list page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddTunnelProfile />
      </Provider>
      , { route: { path: tableViewPath, params } }
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/tunnelProfile/list`,
      hash: '',
      search: ''
    })
  })
})