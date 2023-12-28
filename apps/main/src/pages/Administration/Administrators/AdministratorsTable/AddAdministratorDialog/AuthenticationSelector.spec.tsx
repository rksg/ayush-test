import { Form } from 'antd'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import AuthenticationSelector from './AuthenticationSelector'

describe('Authentication Selector', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render correctly when not sso configured', async () => {
    render(
      <Provider>
        <Form>
          <AuthenticationSelector
            ssoConfigured={false}
            setSelected={() => void {}} />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Authentication Type')).toBeVisible()
    expect(screen.getByText('SSO with 3rd Party')).toBeVisible()
    expect(screen.getByText('RUCKUS Identity Management')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'SSO with 3rd Party' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'RUCKUS Identity Management' })).toBeEnabled()
  })
  it('should render correctly when sso configured', async () => {
    render(
      <Provider>
        <Form>
          <AuthenticationSelector
            ssoConfigured={true}
            setSelected={() => void {}} />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Authentication Type')).toBeVisible()
    expect(screen.getByText('SSO with 3rd Party')).toBeVisible()
    expect(screen.getByText('RUCKUS Identity Management')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'SSO with 3rd Party' })).toBeEnabled()
    expect(screen.getByRole('radio', { name: 'RUCKUS Identity Management' })).toBeEnabled()
  })
})
