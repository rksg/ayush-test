/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { fakeRecoveryCodes } from '../__tests__/fixtures'

import { BackupAuthenticationMethod } from '.'
const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

describe('MFA Backup Authentication Method', () => {
  it('should correctly render', async () => {
    render(
      <Provider>
        <BackupAuthenticationMethod recoveryCodes={fakeRecoveryCodes}/>
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Backup authentication method')
    await userEvent.click(await screen.findByText('See'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect((await screen.findByRole('textbox')).textContent).toEqual('123456\n287600\n230200\n791660\n169111')
  })
})