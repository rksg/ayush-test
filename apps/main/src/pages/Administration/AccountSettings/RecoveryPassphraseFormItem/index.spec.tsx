/* eslint-disable max-len */
import { Provider  } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'
import { hasRoles } from '@acx-ui/user'

import { fakeRecoveryPassphrase } from '../__tests__/fixtures'

import  { RecoveryPassphraseFormItem } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  hasRoles: jest.fn()
}))

describe('Recovery Network Passphrase', () => {
  beforeEach(() => {
    (hasRoles as jest.Mock).mockReturnValue(true)
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <RecoveryPassphraseFormItem
          recoveryPassphraseData={fakeRecoveryPassphrase}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByTitle('Recovery Network Passphrase')
    const toggleVisible = await screen.findByRole('img', { name: 'eye' })
    fireEvent.click(toggleVisible)

    expect(await screen.findByDisplayValue('3577 5764 1724 9799')).toBeDefined()
    expect(await screen.findByRole('img', { name: 'eye-invisible' })).toBeDefined()
  })

  it('should display not allowed message', async () => {
    render(
      <Provider>
        <RecoveryPassphraseFormItem
          recoveryPassphraseData={undefined}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('This feature will become available once you add APs')
  })

  it('should display change passphrase form', async () => {
    render(
      <Provider>
        <RecoveryPassphraseFormItem
          recoveryPassphraseData={fakeRecoveryPassphrase}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByTitle('Recovery Network Passphrase')
    await screen.findByRole('img', { name: 'eye' })
    const changeBtn = await screen.findByText('Change')
    fireEvent.click(changeBtn)
    expect(await screen.findByRole('dialog')).toBeVisible()
  })
})

describe('when use it not permmited role', () => {
  it('change button should not disappear', async () => {
    (hasRoles as jest.Mock).mockReturnValueOnce(false)

    render(
      <Provider>
        <RecoveryPassphraseFormItem
          recoveryPassphraseData={fakeRecoveryPassphrase}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByTitle('Recovery Network Passphrase')
    await screen.findByRole('img', { name: 'eye' })
    expect(screen.queryByText('Change')).toBeNull()
  })
})