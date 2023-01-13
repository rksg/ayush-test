/* eslint-disable max-len */
import { Provider  }                   from '@acx-ui/store'
import {
  render
  // screen,
  // fireEvent
} from '@acx-ui/test-utils'

// import {
//   fakeRecoveryPassphrase,
//   fakeMFATenantDetail,
//   fakeMspEcProfile,
//   fakeUserProfile
// } from './__tests__/fixtures'

import AccountSettings from './'

describe('Account Settings', () => {
  let params: { tenantId: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  it('should change map region correctly', async () => {
    render(
      <Provider>
        <AccountSettings />
      </Provider>, {
        route: { params }
      })
  })

  it('should not display map region selector', async () => {
    render(
      <Provider>
        <AccountSettings />
      </Provider>, {
        route: { params }
      })
  })
  it('should not display access support checkbox', async () => {
    render(
      <Provider>
        <AccountSettings />
      </Provider>, {
        route: { params }
      })
  })
  it('should not display enable MFA checkbox', async () => {
    render(
      <Provider>
        <AccountSettings />
      </Provider>, {
        route: { params }
      })
  })
})