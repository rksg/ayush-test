import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import {
  DpskNetworkType,
  DpskUrls,
  transformDpskNetwork,
  websocketServerUrl,
  getServiceListRoutePath
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider }                from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import{
  createPath,
  editPath,
  mockedCreateFormData,
  mockedEditFormData,
  mockedTenantId,
  mockedServiceId,
  mockedDpskList
} from './__tests__/fixtures'
import DpskForm from './DpskForm'


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))


describe('DpskForm', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        DpskUrls.addDpsk.url,
        (req, res, ctx) => res(ctx.json(mockedCreateFormData))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockedEditFormData))
      ),
      rest.get(
        DpskUrls.getDpskList.url,
        (req, res, ctx) => res(ctx.json(mockedDpskList))
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
        route: { params: { tenantId: mockedTenantId }, path: createPath }
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
    await userEvent.click(screen.getByRole('combobox', { name: /Passphrase Format/i }))
    await userEvent.click(screen.getByText(mockedPassphraseFormatLabel.current))

    // Set Passphrase Length
    await userEvent.type(
      screen.getByRole('spinbutton', { name: /Passphrase Length/i }),
      mockedCreateFormData.passphraseLength.toString()
    )

    // Set List Expiration (After time)
    const expirationModeElem = screen.getByRole('radio', { name: /After/i })
    await userEvent.click(expirationModeElem)

    const inputNumberElems = await screen.findAllByRole('spinbutton')
    const expirationOffsetElem = inputNumberElems[1]
    expect(expirationOffsetElem).toBeInTheDocument()

    const comboboxElems = await screen.findAllByRole('combobox')
    const expirationTypeElem = comboboxElems[1]
    expect(expirationTypeElem).toBeInTheDocument()

    await userEvent.type(expirationOffsetElem, mockedCreateFormData.expirationOffset!.toString())
    await userEvent.click(expirationTypeElem)
    await userEvent.click(screen.getByText('Days'))

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('should render Edit form', async () => {
    render(
      <Provider>
        <DpskForm editMode={true} />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId, serviceId: mockedServiceId },
          path: editPath
        }
      }
    )

    // Verify service name
    const nameInput = await screen.findByDisplayValue(mockedEditFormData.name)
    expect(nameInput).toBeInTheDocument()
  })

  it('should show toast when edit service profile failed', async () => {
    mockServer.use(
      rest.patch(
        DpskUrls.updateDpsk.url,
        (req, res, ctx) => res(ctx.status(404), ctx.json({}))
      )
    )

    render(
      <Provider>
        <DpskForm editMode={true} />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId, serviceId: mockedServiceId },
          path: editPath
        }
      }
    )

    await screen.findByDisplayValue(mockedEditFormData.name)
    await userEvent.click(await screen.findByRole('button', { name: 'Finish' }))

    const errorMsgElem = await screen.findByText('An error occurred')
    expect(errorMsgElem).toBeInTheDocument()
  })

  it('should navigate to the Select service page when clicking Cancel button', async () => {
    const { result: selectServicePath } = renderHook(() => {
      return useTenantLink(getServiceListRoutePath(true))
    })

    render(
      <Provider>
        <DpskForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(mockedUseNavigate).toHaveBeenCalledWith(selectServicePath.current)
  })
})
