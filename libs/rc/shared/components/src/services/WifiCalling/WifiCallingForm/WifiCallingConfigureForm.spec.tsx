import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                                                                                            from '@acx-ui/feature-toggle'
import { ApiVersionEnum, CommonUrlsInfo, GetApiVersionHeader, QosPriorityEnum, ServicesConfigTemplateUrlsInfo, WifiCallingFormContextType, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Path, To }                                                                                                                                          from '@acx-ui/react-router-dom'
import { Provider }                                                                                                                                          from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved }                                                                                    from '@acx-ui/test-utils'

import { mockNetworkResult, mockWifiCallingDetail, mockWifiCallingTableResult } from '../__tests__/fixtures'
import WifiCallingFormContext                                                   from '../WifiCallingFormContext'

import { WifiCallingConfigureForm } from './WifiCallingConfigureForm'


const wifiCallingServiceResponse = {
  id: 'wifiCallingProfileId1',
  profileName: 'att',
  description: '',
  qosPriority: 'WIFICALLING_PRI_VOICE', //Allowed values are "WIFICALLING_PRI_VOICE", "WIFICALLING_PRI_VIDEO", "WIFICALLING_PRI_BE", "WIFICALLING_PRI_BG"
  ePDGs: [{
    name: 'att1',
    domain: 'epdg.epc.att.net',
    ip: ''

  }, {
    name: 'att2',
    domain: 'sentitlement2.mobile.att.net',
    ip: ''

  },{
    name: 'att3',
    domain: 'vvm.mobile.att.net',
    ip: '1.1.1.1'

  }],
  networkIds: [
    'networkId1',
    'networkId2',
    'networkId3'
  ],
  tags: [
    'tag1',
    'tag2'
  ]
}

const initState = {
  serviceName: '',
  ePDG: [],
  qosPriority: QosPriorityEnum.WIFICALLING_PRI_VOICE,
  tags: [],
  description: '',
  networkIds: [],
  networksName: [],
  oldNetworkIds: [],
  epdgs: []
}

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/6de6a5239a1441cfb9c7fde93aa613fe',
  search: '',
  hash: ''
}

const mockedUpdateService = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) =>
    <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

describe('WifiCallingConfigureForm', () => {
  beforeEach(() => {
    mockedUpdateService.mockClear()

    mockServer.use(
      rest.post(WifiCallingUrls.updateWifiCalling.url,
        (req, res, ctx) => res(ctx.json(wifiCallingServiceResponse))),
      rest.post(ServicesConfigTemplateUrlsInfo.updateWifiCalling.url,
        (req, res, ctx) => res(ctx.json(wifiCallingServiceResponse))),
      rest.put(WifiCallingUrls.updateWifiCalling.url,
        (req, res, ctx) => {
          mockedUpdateService()
          return res(ctx.json(wifiCallingServiceResponse))
        }
      ),
      rest.put(ServicesConfigTemplateUrlsInfo.updateWifiCalling.url,
        (req, res, ctx) => {
          mockedUpdateService()
          return res(ctx.json(wifiCallingServiceResponse))
        }
      ),
      rest.get(WifiCallingUrls.getWifiCalling.url,
        (req, res, ctx) => res(ctx.json(mockWifiCallingDetail))),
      rest.get(ServicesConfigTemplateUrlsInfo.getWifiCalling.url,
        (req, res, ctx) => res(ctx.json(mockWifiCallingDetail))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockNetworkResult))),
      rest.post(WifiCallingUrls.getEnhancedWifiCallingList.url,
        (req, res, ctx) => res(ctx.json(mockWifiCallingTableResult))),
      rest.post(ServicesConfigTemplateUrlsInfo.getEnhancedWifiCallingList.url,
        (req, res, ctx) => res(ctx.json(mockWifiCallingTableResult)))
    )
  })

  it('should render wifiCallingConfigureForm successfully', async () => {
    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: jest.fn()
      }}>
        <Provider>
          <WifiCallingConfigureForm />
        </Provider>
      </WifiCallingFormContext.Provider>
      , {
        route: {
          params: { tenantId: 'tenantId1', serviceId: 'serviceId1' }
        }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    await screen.findByText('abc.com')

    await userEvent.type(screen.getByRole('textbox', { name: /description/i }),
      'descriptionTest')

    await userEvent.type(screen.getByRole('textbox', { name: /service name/i }),
      'service-name-test')

    await userEvent.click(screen.getByText('Scope'))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(mockedUpdateService).toBeCalledTimes(1)
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: jest.fn()
      }}>
        <Provider>
          <WifiCallingConfigureForm />
        </Provider>
      </WifiCallingFormContext.Provider>
      , {
        route: {
          params: { tenantId: 'tenantId1', serviceId: 'serviceId1' }
        }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: /loading/i }))

    expect(await screen.findByText('Network Control')).toBeVisible()

    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Wi-Fi Calling'
    })).toBeVisible()
  })

  it('should render form successfully then click the cancel button', async () => {
    render(
      <WifiCallingFormContext.Provider value={{
        state: initState,
        dispatch: jest.fn()
      }}>
        <Provider>
          <WifiCallingConfigureForm />
        </Provider>
      </WifiCallingFormContext.Provider>
      , {
        route: {
          params: { tenantId: 'tenantId1', serviceId: 'serviceId1' }
        }
      }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedUseNavigate).toBeCalledTimes(2)
  })

  it('should update association with rbac api', async () => {
    const rbacUpdateApiHeaders = GetApiVersionHeader(ApiVersionEnum.v1_1)
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

    mockServer.use(
      rest.post(
        WifiCallingUrls.queryWifiCalling.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.put(WifiCallingUrls.updateWifiCalling.url,
        (req, res, ctx) => {
          if (req.headers.get('content-type') === rbacUpdateApiHeaders?.['Content-Type']) {
            mockedUpdateService(req.body)
            return res(ctx.json(wifiCallingServiceResponse))
          }
          return res(ctx.status(400))
        }
      )
    )

    render(
      <WifiCallingFormContext.Provider
        value={{ state: { ...initState, oldNetworkIds: ['123'] }, dispatch: jest.fn }}
      >
        <Provider>
          <WifiCallingConfigureForm />
        </Provider>
      </WifiCallingFormContext.Provider>
      , {
        route: {
          params: { tenantId: 'tenantId1', serviceId: 'serviceId1' }
        }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()

    await screen.findByText('abc.com')


    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(mockedUpdateService).toBeCalledTimes(1))
    // RBAC api will not provide `networkIds` in the payload
    const payload = mockedUpdateService.mock.calls[0][0] as WifiCallingFormContextType
    expect(payload.networkIds).toBeUndefined()
  })
})
