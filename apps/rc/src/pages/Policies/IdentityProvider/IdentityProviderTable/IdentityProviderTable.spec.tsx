import { rest } from 'msw'
import { Path } from 'react-router-dom'

import { networkApi, policyApi, venueApi } from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  CommonUrlsInfo,
  IdentityProviderUrls,
  Network,
  Venue,
  TableResult,
  IdentityProviderViewModel
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import IdentityProviderTable from './IdentityProviderTable'

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

const dummyTableResult: TableResult<IdentityProviderViewModel> = {
  totalCount: 2,
  page: 1,
  data: [{
    id: '6dc2b568c41a4a4581ab9c81d1c9b554',
    name: 'HS20 Identity Provider 1',
    naiRealms: [{ name: 'abc.com' }],
    authRadiusId: 'b6257d19e269495e9f60f3e2fda62af3',
    tenantId: 'a4c2fc6a9dff40e7a745901921e83477'
  }, {
    id: 'f0d4232b695544bdbea160a0f50122e5',
    name: 'HS20 Identity Provider 2',
    naiRealms: [{ name: 'xyz.com' }],
    authRadiusId: 'b6257d19e269495e9f60f3e2fda62af3',
    accountingRadiusId: '4e96a5c738bf4fdb85e95a57a2ef2093',
    venueIds: ['83a98239787940188137242bdf6795e9'],
    tenantId: 'a4c2fc6a9dff40e7a745901921e83477'
  }]
}

const dummyNetworksResult: TableResult<Network> = {
  totalCount: 1,
  page: 1,
  data: [{
    id: '0c41e2e116514dc698c53dc8c752a1b8',
    name: 'AAA Network-1',
    description: '',
    ssid: 'AAA Network-1',
    nwSubType: 'aaa',
    activated: { isActivated: true },
    vlan: 1,
    aps: 0,
    clients: 0,
    venues: {
      count: 1,
      ids: [
        '83a98239787940188137242bdf6795e9'
      ],
      names: [
        'My Venue'
      ]
    }
  }]
}

const dummyVenuesResult: TableResult<Venue> = {
  totalCount: 1,
  page: 1,
  data: [{
    id: '83a98239787940188137242bdf6795e9',
    name: 'My Venue',
    description: '',
    status: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
    mesh: { enabled: false },
    wlan: {
      wlanSecurity: ''
    },
    allApDisabled: false,
    activated: { isActivated: true },
    disabledActivation: false,
    aggregatedApStatus: { },
    networks: {
      count: 1,
      names: [
        'AAA Network-1'
      ],
      vlans: [
        1
      ]
    }
  }]
}

describe('IdentityProviderTable', () => {
  const params = {
    tenantId: 'a4c2fc6a9dff40e7a745901921e83477'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(
        IdentityProviderUrls.getEnhancedIdentityProviderList.url,
        (req, res, ctx) => res(ctx.json(dummyTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(dummyNetworksResult))
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json(dummyVenuesResult))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <IdentityProviderTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetName = dummyTableResult.data[0].name
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('button', { name: /Add Identity Provider/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <IdentityProviderTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

})
