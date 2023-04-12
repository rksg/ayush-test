import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import { TunnelProfileUrls }          from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockedTunnelProfileData } from '../__tests__/fixtures'

import EditTunnelProfile from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const editViewPath = '/t/:tenantId/policies/tunnelProfile/:policyId/edit'

describe('EditTunnelProfile', () => {
  let params: { tenantId: string, policyId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: 'testPolicyId'
    }

    mockServer.use(
      rest.put(
        TunnelProfileUrls.updateTunnelProfile.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        TunnelProfileUrls.getTunnelProfile.url,
        (req, res, ctx) => res(ctx.json(mockedTunnelProfileData))
      )
    )
  })
  it('should update tunnel profile successful', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditTunnelProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )
    const policyNameField = screen.getByRole('textbox', { name: 'Policy Name' })
    await user.type(policyNameField, 'TestTunnel')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/policies/tunnelProfile/list`,
      hash: '',
      search: ''
    }))
  })

  it('Click cancel button and go back to list page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditTunnelProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/policies/tunnelProfile/list`,
      hash: '',
      search: ''
    })
  })
})