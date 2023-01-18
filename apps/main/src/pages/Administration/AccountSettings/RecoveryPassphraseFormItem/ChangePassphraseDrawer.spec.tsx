/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { administrationApi }      from '@acx-ui/rc/services'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store  }       from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  mockServer
} from '@acx-ui/test-utils'


import  { ChangePassphraseDrawer } from './ChangePassphraseDrawer'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
const fakeData = '3577 5764 1724 9799'

describe('Recovery Network Passphrase Drawer', () => {
  const mockedSetVisible = jest.fn()

  beforeEach(() => {
    store.dispatch(administrationApi.util.resetApiState())
  })

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

    await screen.findByRole('dialog')
    const changeBtn = await screen.findByRole('button', { name: 'Change' })
    expect(changeBtn).toBeDisabled()
    expect(await screen.findAllByTestId(/recovery_pass_[0-3]/)).toHaveLength(4)

    const inputElem = await screen.findByTestId('recovery_pass_0')
    await userEvent.type(inputElem, '123')
    expect(inputElem).toHaveAttribute('value', '3577123')

    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '456')
    expect(inputElem).toHaveAttribute('value', '456')
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

    await screen.findByRole('dialog')
    const changeBtn = await screen.findByRole('button', { name: 'Change' })
    expect(changeBtn).toBeDisabled()
    expect(await screen.findAllByTestId(/recovery_pass_[0-3]/)).toHaveLength(4)

    const inputElem = await screen.findByTestId('recovery_pass_0')
    await userEvent.type(inputElem, '123')
    const errorMessage = await screen.findByRole('alert')
    expect(errorMessage.textContent).toBe('Passphrase part must be exactly 4 digits long')
    expect(errorMessage).toBeVisible()
    expect(changeBtn).toBeDisabled()

    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '1 23 ')
    const spaceErrorMessage = await screen.findByRole('alert')
    expect(spaceErrorMessage.textContent).toBe('Passphrase cannot have space')
    expect(spaceErrorMessage).toBeVisible()
    expect(changeBtn).toBeDisabled()

    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '1236')

    await waitForElementToBeRemoved(() => screen.queryByRole('alert'))
    expect(changeBtn).not.toBeDisabled()
  })

  it('should toggle to display literal password', async () => {
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

    await screen.findByRole('dialog')
    expect(await screen.findAllByTestId(/recovery_pass_[0-3]/)).toHaveLength(4)

    const toggleVisible = await screen.findByRole('img', { name: 'eye-invisible' })
    fireEvent.click(toggleVisible)
    expect(await screen.findByTestId('recovery_pass_1')).toHaveDisplayValue('5764')
  })

  it('should close dialog after submit succeed', async () => {
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updateRecoveryPassphrase.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )

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

    await screen.findByRole('dialog')
    expect(await screen.findAllByTestId(/recovery_pass_[0-3]/)).toHaveLength(4)

    const inputElem = await screen.findByTestId('recovery_pass_0')
    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '1236')
    fireEvent.click(await screen.findByRole('button', { name: 'Change' }))
    await waitFor(() => expect(mockedSetVisible).toHaveBeenCalledWith(false))
  })

  it('should display toast notification when submit failed', async () => {
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updateRecoveryPassphrase.url,
        (req, res, ctx) => res(ctx.status(500), ctx.json(null))
      )
    )

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

    await screen.findByRole('dialog')
    const inputElem = await screen.findByTestId('recovery_pass_0')
    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '1236')
    fireEvent.click(await screen.findByRole('button', { name: 'Change' }))
    expect(await screen.findByText('An error occurred')).toBeVisible()
  })
})