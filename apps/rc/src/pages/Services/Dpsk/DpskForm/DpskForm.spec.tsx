import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import {
  DpskNetworkType,
  DpskSaveData,
  DpskUrls,
  ExpirationType,
  PassphraseFormatEnum,
  ServiceType,
  transformDpskNetwork,
  websocketServerUrl
} from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { mockServer, render, renderHook, screen, within } from '@acx-ui/test-utils'

import { getServiceRoutePath, ServiceOperation } from '../../serviceRouteUtils'

import DpskForm from './DpskForm'


describe('DpskForm', () => {
  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })

  const mockedCreateFormData: DpskSaveData = {
    name: 'Fake DPSK',
    passphraseLength: 16,
    passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
    expirationType: ExpirationType.DAYS_AFTER_TIME,
    expirationOffset: 5
  }

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        DpskUrls.addDpsk.url,
        (req, res, ctx) => res(ctx.json(mockedCreateFormData))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockedCreateFormData))
      ),
      rest.get(
        websocketServerUrl,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should create a DPSK service profile', async () => {
    render(
      <Provider>
        <DpskForm />
      </Provider>, {
        route: { params: { tenantId: '__Tenant_ID__' }, path: createPath }
      }
    )

    const { result: mockedPassphraseFormatLabel } = renderHook(() => {
      // eslint-disable-next-line max-len
      return transformDpskNetwork(useIntl(), DpskNetworkType.FORMAT, mockedCreateFormData.passphraseFormat)
    })

    // Set Service Name
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Service Name/i }),
      mockedCreateFormData.name
    )

    // Set Passphrase Format
    await userEvent.click(screen.getByRole('combobox', { name: /Passphrase format/i }))
    await userEvent.click(screen.getByText(mockedPassphraseFormatLabel.current))

    // Set Passphrase Length
    await userEvent.type(
      screen.getByRole('spinbutton', { name: /Passphrase length/i }),
      mockedCreateFormData.passphraseLength.toString()
    )

    // Set List Expiration (After date)
    const expirationModeElem = screen.getByRole('radio', { name: /After/i })
    await userEvent.click(expirationModeElem)
    await userEvent.type(
      await within(expirationModeElem).findByRole('spinbutton'),
      mockedCreateFormData.expirationOffset!.toString()
    )
    await userEvent.click(within(expirationModeElem).getByRole('combobox'))
    await userEvent.click(screen.getByText('Days'))

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })
})
