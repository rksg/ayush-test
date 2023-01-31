import userEvent from '@testing-library/user-event'
import moment    from 'moment'
import { rest }  from 'msw'

import {
  CreateDpskPassphrasesFormFields,
  DpskDetailsTabKey,
  DpskUrls,
  ExpirationDateEntity,
  ExpirationMode,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  mockedTenantId,
  mockedServiceId,
  mockedDpskPassphrase
} from './__tests__/fixtures'
import DpskPassphraseDrawer from './DpskPassphraseDrawer'


describe('DpskPassphraseDrawer', () => {
  const paramsForPassphraseTab = {
    tenantId: mockedTenantId,
    serviceId: mockedServiceId,
    activeTab: DpskDetailsTabKey.PASSPHRASE_MGMT
  }

  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  it('should add passphrases manaully', async () => {
    const setVisible = jest.fn()
    const saveFn = jest.fn()

    mockServer.use(
      rest.post(
        DpskUrls.addPassphrase.url,
        (req, res, ctx) => {
          saveFn(req.body)
          return res(ctx.json({
            requestId: '__REQUEST_ID__',
            response: {}
          }))
        }
      )
    )

    render(
      <Provider>
        <DpskPassphraseDrawer visible={true} setVisible={setVisible} />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    // await userEvent.click(await screen.findByLabelText('Add manually'))

    await populateValues(mockedDpskPassphrase)

    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith(mockedDpskPassphrase)
    })

    await waitFor(() => {
      expect(setVisible).toHaveBeenCalledWith(false)
    })
  })

  it('should show the message if add passphrase error', async () => {
    mockServer.use(
      rest.post(
        DpskUrls.addPassphrase.url,
        (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({
            message: 'An error occurred'
          }))
        }
      )
    )

    render(
      <Provider>
        <DpskPassphraseDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    // await userEvent.click(await screen.findByLabelText('Add manually'))

    await populateValues(mockedDpskPassphrase)

    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))

    const errorMsgElem = await screen.findByText('An error occurred')
    expect(errorMsgElem).toBeInTheDocument()
  })

  it('should save data with the specified expiration date', async () => {
    const saveFn = jest.fn()

    mockServer.use(
      rest.post(
        DpskUrls.addPassphrase.url,
        (req, res, ctx) => {
          saveFn(req.body)
          return res(ctx.json({
            requestId: '__REQUEST_ID__',
            response: {}
          }))
        }
      )
    )

    render(
      <Provider>
        <DpskPassphraseDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    // await userEvent.click(await screen.findByLabelText('Add manually'))

    const byDateEntity = new ExpirationDateEntity()
    byDateEntity.setToByDate('2022-11-25')

    const valuesWithByDate = {
      ...mockedDpskPassphrase,
      expiration: byDateEntity
    }
    await populateValues(valuesWithByDate)

    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalled()
    })
  })
})

async function populateValues (values: Partial<CreateDpskPassphrasesFormFields>) {
  await userEvent.type(await screen.findByLabelText('Number of Passphrases'), '5')

  await userEvent.click(await screen.findByLabelText('Set number'))
  const spinbuttons = await screen.findAllByRole('spinbutton')
  const numberOfDevicesElem = spinbuttons[1]
  await userEvent.type(numberOfDevicesElem, values.numberOfDevices!.toString())

  await userEvent.type(await screen.findByLabelText('Passphrase'), values.passphrase!)
  await userEvent.type(await screen.findByLabelText('User Name'), values.username!)

  await userEvent.type(await screen.findByLabelText('MAC Address'), values.mac!)
  await userEvent.type(await screen.findByLabelText('VLAN ID'), values.vlanId!)

  if (values.expiration && values.expiration.mode === ExpirationMode.BY_DATE) {
    const targetDate = moment(values.expiration.date, 'YYYY-MM-DD')
    const startDateOfTarget = moment(values.expiration.date, 'YYYY-MM-DD').startOf('month')

    Date.now = jest.fn().mockReturnValue(new Date(startDateOfTarget.toDate()))

    await userEvent.click(await screen.findByLabelText('By date'))

    await userEvent.click(await screen.findByPlaceholderText('Select date'))

    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByRole('cell', { name: new RegExp(targetDate.date().toString()) }))
  } else {
    await userEvent.click(await screen.findByLabelText('Same as pool'))
  }
}
