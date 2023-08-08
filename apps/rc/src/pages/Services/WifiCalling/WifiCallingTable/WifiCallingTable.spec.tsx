import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import {
  CommonUrlsInfo,
  getServiceDetailsLink,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType,
  WifiCallingUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockNetworkResult } from '../__tests__/fixtures'

import WifiCallingTable from './WifiCallingTable'

const mockTableResult = {
  fields: [
    'ePDGs',
    'epdg',
    'qosPriority',
    'networkIds',
    'epdgs',
    'name',
    'tenantId',
    'id'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'b6ebccae545c44c1935ddaf746f5b048',
      name: 'wifi-1',
      qosPriority: 'WIFICALLING_PRI_VOICE',
      networkIds: [],
      tenantId: '1977de24c7824b0b975c4d02806e081f',
      epdgs: [
        {
          domain: 'a.b.comd'
        }
      ]
    },
    {
      id: 'a6ebdcae345c42c1935ddaf946f5c341',
      name: 'wifi-2',
      qosPriority: 'WIFICALLING_PRI_VOICE',
      networkIds: [
        '28ebc4915a94407faf8885bcd1fe7f0b'
      ],
      tenantId: '2347da24c7824b0b975d2d02406e091f',
      epdgs: [
        {
          domain: 'a.b.com'
        }
      ]
    }
  ]
}

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('WifiCallingTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getServicesList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        WifiCallingUrls.getEnhancedWifiCallingList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockNetworkResult))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <WifiCallingTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetServiceName = mockTableResult.data[0].name
    expect(await screen.findByRole('button', { name: /Add Wi-Fi Calling Service/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetServiceName) })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <WifiCallingTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        WifiCallingUrls.deleteWifiCallingList.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <WifiCallingTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByRole('button', { name: /Delete Service/i }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <WifiCallingTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getServiceDetailsLink({
      type: ServiceType.WIFI_CALLING,
      oper: ServiceOperation.EDIT,
      serviceId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })
})
