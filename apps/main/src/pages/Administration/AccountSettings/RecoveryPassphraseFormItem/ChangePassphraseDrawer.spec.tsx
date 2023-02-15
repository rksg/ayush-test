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
    expect(await screen.findAllByTestId(/pwdg_[0-3]/)).toHaveLength(4)

    const inputElem = await screen.findByTestId('pwdg_0')
    await userEvent.type(inputElem, '123')
    const errorMessage = await screen.findByRole('alert')
    expect(errorMessage.textContent).toBe('Passphrase part must be exactly 4 digits long')
    expect(errorMessage).toBeVisible()
    expect(changeBtn).toBeDisabled()

    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '1 23 ')
    const spaceErrorMessage = await screen.findByRole('alert')
    expect(spaceErrorMessage).toBeVisible()
    await waitFor(() => {
      expect(spaceErrorMessage.textContent).toBe('Passphrase cannot have space')
    })

    expect(changeBtn).toBeDisabled()

    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '1236')

    await waitForElementToBeRemoved(() => screen.queryByRole('alert'))
    expect(changeBtn).not.toBeDisabled()
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
    const inputElem = await screen.findByTestId('pwdg_0')
    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '1236')
    fireEvent.click(await screen.findByRole('button', { name: 'Change' }))
    await waitFor(() => expect(mockedSetVisible).toHaveBeenCalledWith(false))
  })

  it('should close dialog after click drawer close button', async () => {
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
    fireEvent.click(await screen.findByRole('button', { name: 'Close' }))
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
    const inputElem = await screen.findByTestId('pwdg_0')
    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '1236')
    fireEvent.click(await screen.findByRole('button', { name: 'Change' }))
    expect(await screen.findByText('An error occurred')).toBeVisible()
  })

  it('should correctly render when data is empty string', async () => {
    render(
      <Provider>
        <ChangePassphraseDrawer
          data=''
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('dialog')
    expect(screen.queryByTestId(/pwdg_\d/)).not.toBeInTheDocument()
  })
})