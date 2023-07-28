import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import { useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  DpskNetworkType,
  DpskUrls,
  transformDpskNetwork,
  websocketServerUrl,
  getServiceRoutePath,
  ServiceType,
  ServiceOperation,
  NewDpskBaseUrl,
  RulesManagementUrlsInfo
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

const policySetList = {
  paging: {
    totalCount: 2,
    page: 1,
    pageSize: 2,
    pageCount: 1
  },
  content: [
    {
      id: '50f5cec9-850d-483d-8272-6ee5657f53da',
      name: 'testPolicySet',
      description: 'for test'
    },
    {
      id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
      name: 'testPolicySet1',
      description: 'for test'
    }
  ]
}

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
        NewDpskBaseUrl,
        (req, res, ctx) => res(ctx.json(mockedDpskList))
      ),
      rest.get(
        websocketServerUrl,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
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

    const dataToCreate = { ...mockedCreateFormData }

    const { result: mockedPassphraseFormatLabel } = renderHook(() => {
      // eslint-disable-next-line max-len
      return transformDpskNetwork(useIntl(), DpskNetworkType.FORMAT, dataToCreate.passphraseFormat)
    })

    // Set Service Name
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Service Name/i }),
      dataToCreate.name
    )

    // Set Passphrase Format
    await userEvent.click(screen.getByRole('combobox', { name: /Passphrase Format/i }))
    await userEvent.click(screen.getByText(mockedPassphraseFormatLabel.current))

    // Set Passphrase Length
    await userEvent.type(
      screen.getByRole('spinbutton', { name: /Passphrase Length/i }),
      dataToCreate.passphraseLength.toString()
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

    await userEvent.type(expirationOffsetElem, dataToCreate.expirationOffset!.toString())
    await userEvent.click(expirationTypeElem)
    await userEvent.click(screen.getByText('Days'))

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <DpskForm />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DPSK'
    })).toBeVisible()
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

  it('should render Edit form with cloudpath FF enabled', async () => {
    mockServer.use(
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({
          ...mockedEditFormData,
          policySetId: 'a3a8449e-a649-4bf4-8798-d772ee1dbd5f',
          policyDefaultAccess: false
        }))
      )
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)

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

    expect(await screen.findByRole('radio', { name: /REJECT/ })).toBeChecked()
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

    // TODO
    // const errorMsgElem = await screen.findByText('Server Error')
    // expect(errorMsgElem).toBeInTheDocument()
  })

  it('should navigate to the DPSK table when clicking Cancel button', async () => {
    const { result: selectServicePath } = renderHook(() => {
      // eslint-disable-next-line max-len
      return useTenantLink(getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST }))
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

  it('should render the form for Modal mode', async () => {
    const mockedModalCallBack = jest.fn()

    render(
      <Provider>
        <DpskForm editMode={false} modalMode={true} modalCallBack={mockedModalCallBack} />
      </Provider>, {
        route: {
          params: { tenantId: mockedTenantId, serviceId: mockedServiceId },
          path: editPath
        }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedModalCallBack).toHaveBeenCalled()
  })
})
