import '@testing-library/jest-dom'
import { rest } from 'msw'

import { get }    from '@acx-ui/config'
import {
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  ConfigTemplateUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { mockServer, render, screen }        from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'

import { networkDetailHeaderData } from './__tests__/fixtures'
import { NetworkDetails }          from './NetworkDetails'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

beforeEach(() => {
  mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
})

afterEach(() => {
  mockedUseConfigTemplate.mockRestore()
})

jest.mock('./NetworkIncidentsTab', () => ({
  NetworkIncidentsTab: () => <div data-testid='rc-NetworkIncidentsTab'>incidents</div>
}))
jest.mock('./NetworkOverviewTab', () => ({ NetworkOverviewTab: () => <div>overview</div> }))

jest.mock('./NetworkVenuesTab', () => ({ NetworkVenuesTab: () => <div>venues</div> }))

jest.mock('./NetworkClientsTab', () => ({ NetworkClientsTab: () => <div>clients</div> }))

const network = {
  type: 'aaa',
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  venues: [
    {
      venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      allApGroupsRadio: 'Both',
      isAllApGroups: true,
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      id: '7a97953dc55f4645b3cdbf1527f3d7cb'
    }
  ],
  name: 'testNetwork',
  enableAuthProxy: false,
  enableAccountingProxy: false,
  id: '373377b0cb6e46ea8982b1c80aabe1fa'
}

jest.mock('socket.io-client')

const mockedVenuesResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'v1',
    name: 'My Venue'
  }]
}
const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('NetworkDetails', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        ConfigTemplateUrlsInfo.getNetworkTemplate.url,
        (_, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        ConfigTemplateUrlsInfo.getNetworkTemplateRbac.url,
        (_, res, ctx) => res(ctx.json(network))
      ),
      rest.get(
        CommonRbacUrlsInfo.getNetworksDetailHeader.url,
        (_, res, ctx) => res(ctx.json(networkDetailHeaderData))
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json(mockedVenuesResult))
      )
    )
  })

  it('renders a tab', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'overview'
    }
    render(<Provider><NetworkDetails /></Provider>, {
      route: { params, path: '/:tenantId/:networkId/:activeTab' }
    })

    expect(await screen.findByText('overview')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(6)
  })

  it('renders another tab', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'incidents'
    }
    render(<Provider><NetworkDetails /></Provider>, {
      route: { params, path: '/:tenantId/:networkId/:activeTab' }
    })

    expect(await screen.findByText('incidents')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(6)
  })

  it('should hide incidents when READ_INCIDENTS permission is false', async () => {
    mockGet.mockReturnValue('true')
    setRaiPermissions({ READ_INCIDENTS: false } as RaiPermissions)
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'incidents'
    }
    render(<Provider><NetworkDetails /></Provider>, {
      route: { params, path: '/:tenantId/:networkId/:activeTab' }
    })
    expect(screen.queryByTestId('rc-NetworkIncidentsTab')).toBeNull()
  })

  it('renders clients tab', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'clients'
    }
    render(<Provider><NetworkDetails /></Provider>, {
      route: { params, path: '/:tenantId/:networkId/:activeTab' }
    })

    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('Clients (1)')
  })

  it('renders a tab with MSP account', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'venues'
    }
    render(<Provider><NetworkDetails /></Provider>, {
      route: { params, path: '/:tenantId/:networkId/:activeTab' }
    })

    expect(await screen.findByText('Configuration Templates')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(1)
  })
})
