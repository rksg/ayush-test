/* eslint-disable max-len */
import React from 'react'
import userEvent from '@testing-library/user-event'

import { Provider  }          from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { fakeRecoveryPassphrase } from '../__tests__/fixtures'

import  { ChangePassphraseDrawer } from './ChangePassphraseDrawer'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
const fakeData = '3577 5764 1724 9799'
describe('Recovery Network Passphrase Drawer', () => {
  const mockedSetVisible = jest.fn()

  it('should password literal changable', async () => {
    render(
      <Provider>
        <ChangePassphraseDrawer
          data={fakeData}
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params }
      })

    const drawer = await screen.findByRole('dialog')
    const changeBtn = await screen.findByRole('button', { name: 'Change' })
    expect(changeBtn).toBeDisabled()

    expect(drawer.querySelectorAll('input[type=password]')).toHaveLength(4)
    await userEvent.type(screen.f('recovery_pass_0'), { value: '123' })
    // fireEvent.blur(venueInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
    expect(await screen.findByText('Passphrase part must be exactly 4 digits long')).toBeVisible()

    // expect(await screen.findByRole('img', { name: 'eye-invisible' })).toBeDefined()
  })

  it('should change password button to be unclickable when input data invalid', async () => {
    render(
      <Provider>
        <ChangePassphraseDrawer
          data={fakeData}
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params }
      })
  })

  it('should tooltip render correctly', async () => {
    render(
      <Provider>
        <ChangePassphraseDrawer
          data={fakeData}
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params }
      })
  })
})