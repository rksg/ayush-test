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
  totalCount: 1,
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
        WifiCallingUrls.getWifiCallingList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
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

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        WifiCallingUrls.deleteWifiCalling.url,
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
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + target.name + '"?')).toBeVisible()

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
    await userEvent.click(within(row).getByRole('radio'))

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
