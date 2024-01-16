import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import AuthenticationSelector from './authTypeSelector'

describe('Auth Type Selector', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render correctly when not sso configured', async () => {
    render(
      <Provider>
        <AuthenticationSelector
          ssoConfigured={false}
          setSelected={() => void {}} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Auth Type')).toBeVisible()
    expect(screen.getByText('SAML')).toBeVisible()
    expect(screen.getByText('Google Workspace')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'SAML' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Google Workspace' })).toBeEnabled()
  })
  it('should render correctly when sso configured', async () => {
    render(
      <Provider>
        <AuthenticationSelector
          ssoConfigured={true}
          setSelected={() => void {}} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Auth Type')).toBeVisible()
    expect(screen.getByText('SAML')).toBeVisible()
    expect(screen.getByText('Google Workspace')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'SAML' })).toBeEnabled()
    expect(screen.getByRole('radio', { name: 'Google Workspace' })).toBeEnabled()
  })
})
