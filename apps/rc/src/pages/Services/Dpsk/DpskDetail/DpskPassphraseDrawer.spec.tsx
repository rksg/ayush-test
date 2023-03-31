import userEvent from '@testing-library/user-event'
import moment    from 'moment-timezone'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CreateDpskPassphrasesFormFields,
  DpskDetailsTabKey,
  DpskUrls,
  ExpirationDateEntity,
  ExpirationMode,
  getServiceRoutePath,
  NewDpskPassphraseBaseUrlWithId,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  mockedTenantId,
  mockedServiceId,
  mockedDpskPassphraseFormFields,
  mockedSingleDpskPassphrase,
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
        <DpskPassphraseDrawer visible={true} setVisible={setVisible} editMode={{ isEdit: false }} />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    await populateValues(mockedDpskPassphraseFormFields)

    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith(mockedDpskPassphraseFormFields)
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
        <DpskPassphraseDrawer visible={true} setVisible={jest.fn()} editMode={{ isEdit: false }} />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    await populateValues(mockedDpskPassphraseFormFields)

    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))

    // TODO
    // const errorMsgElem = await screen.findByText('Sever Error')
    // expect(errorMsgElem).toBeInTheDocument()
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
        <DpskPassphraseDrawer visible={true} setVisible={jest.fn()} editMode={{ isEdit: false }} />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const byDateEntity = new ExpirationDateEntity()
    byDateEntity.setToByDate('2022-11-25')

    const valuesWithByDate = {
      ...mockedSingleDpskPassphrase,
      expiration: byDateEntity
    }
    await populateValues(valuesWithByDate)

    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalled()
    })
  })

  it('should update data', async () => {
    const updateFn = jest.fn()

    mockServer.use(
      rest.get(
        NewDpskPassphraseBaseUrlWithId,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskPassphrase }))
      ),
      rest.put(
        NewDpskPassphraseBaseUrlWithId,
        (req, res, ctx) => {
          updateFn(req.body)
          return res(ctx.json(req.body))
        }
      )
    )

    const editingData = {
      ...mockedDpskPassphrase,
      email: 'testing@commscope.com',
      phoneNumber: '+8860987111222'
    }

    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <DpskPassphraseDrawer
          visible={true}
          setVisible={jest.fn()}
          editMode={{ isEdit: true, passphraseId: mockedDpskPassphrase.id }}
        />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    await userEvent.type(await screen.findByLabelText('Contact Email Address'), editingData.email)
    // eslint-disable-next-line max-len
    await userEvent.type(await screen.findByLabelText('Contact Phone Number'), editingData.phoneNumber)

    await userEvent.click(await screen.findByRole('button', { name: /Save/ }))

    const { createdDate, ...other } = editingData
    const expectedPayload = {
      ...other,
      numberOfPassphrases: 1
    }
    await waitFor(() => {
      expect(updateFn).toHaveBeenCalledWith(expectedPayload)
    })
  })
})

async function populateValues (values: Partial<CreateDpskPassphrasesFormFields>) {
  const numberOfPassphrases = values.numberOfPassphrases!
  const numberOfDevices = values.numberOfDevices!

  // eslint-disable-next-line max-len
  const numberOfPassphrasesElem = await screen.findByLabelText('Number of Passphrases (Up to 5000 passphrases)')
  await userEvent.clear(numberOfPassphrasesElem)
  await userEvent.type(numberOfPassphrasesElem, numberOfPassphrases.toString())

  await userEvent.click(await screen.findByLabelText('Set number (1-50)'))
  const numberOfDevicesElem = (await screen.findAllByRole('spinbutton'))[1]
  await userEvent.clear(numberOfDevicesElem)
  await userEvent.type(numberOfDevicesElem, numberOfDevices.toString())

  if (numberOfPassphrases === 1) {
    await userEvent.type(await screen.findByLabelText('Passphrase'), values.passphrase!)
    await userEvent.type(await screen.findByLabelText('User Name'), values.username!)
  } else {
    await userEvent.type(await screen.findByLabelText('User Name Prefix'), values.username!)
  }

  if (numberOfDevices === 1 && numberOfPassphrases === 1) {
    await userEvent.type(await screen.findByLabelText('MAC Address'), values.mac!)
  }

  await userEvent.type(await screen.findByLabelText('VLAN ID'), values.vlanId!.toString())

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
