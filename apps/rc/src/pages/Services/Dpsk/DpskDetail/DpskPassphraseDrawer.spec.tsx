import userEvent from '@testing-library/user-event'
import moment    from 'moment-timezone'
import { rest }  from 'msw'

import { useIsTierAllowed } from '@acx-ui/feature-toggle'
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
  mockedDpskPassphrase,
  mockedDpskPassphraseList
} from './__tests__/fixtures'
import DpskPassphraseDrawer from './DpskPassphraseDrawer'


describe('DpskPassphraseDrawer', () => {
  const paramsForPassphraseTab = {
    tenantId: mockedTenantId,
    serviceId: mockedServiceId,
    activeTab: DpskDetailsTabKey.PASSPHRASE_MGMT
  }

  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        DpskUrls.getEnhancedPassphraseList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should add passphrases', async () => {
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

  it('should add passphrase by default values', async () => {
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

    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith(expect.objectContaining({
        numberOfPassphrases: 1,
        numberOfDevices: 1
      }))
    })
  })

  it('should add passphrases with duplicated MAC', async () => {
    const targetPassPhraseList = { ...mockedDpskPassphraseList }
    const targetMac = targetPassPhraseList.data[1].mac
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
      ),
      rest.post(
        DpskUrls.getEnhancedPassphraseList.url,
        (req, res, ctx) => {
          return res(ctx.json(targetPassPhraseList))
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

    await populateValues({
      ...mockedSingleDpskPassphrase,
      mac: targetMac
    })

    await userEvent.click(await screen.findByRole('button', { name: /Add/ }))

    expect(await screen.findByText('Replace Passphrase For MAC Address?')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: /Replace Passphrase/ }))

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith(expect.objectContaining({ override: true }))
    })
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
      phoneNumber: '+886987111222'
    }

    jest.mocked(useIsTierAllowed).mockReturnValue(true)

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

    const { createdDate, vlanId, ...otherEditingData } = editingData
    const expectedPayload = {
      ...otherEditingData,
      vlanId: vlanId?.toString(),
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
