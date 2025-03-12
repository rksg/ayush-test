import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import { useIsEdgeReady }                                 from '@acx-ui/rc/components'
import { venueApi, apApi }                                from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { venueSetting, venueApCompatibilitiesData, apCompatibilitiesFilterData } from '../../__tests__/fixtures'

import { VenueDevicesTab } from '.'


const filterData = () => apCompatibilitiesFilterData
const apCompatibilitiesData = () => venueApCompatibilitiesData

const mockedUsedNavigate = jest.fn()
const mockedretrievedOptions = jest.fn()
const mockSetSessionStorage = jest.fn()
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: mockSetSessionStorage,
  clear: jest.fn()
}
Object.defineProperty(global, 'sessionStorage', { value: mockSessionStorage })

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report' />
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ApTable: () => <div data-testid={'ApTable'} />,
  EdgesTable: () => <div data-testid={'EdgesTable'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ap-compatibility-drawer'} />,
  ApGeneralCompatibilityDrawer: () => <div data-testid={'ap-compatibility-drawer'} />,
  retrievedCompatibilitiesOptions: () => {
    mockedretrievedOptions()
    return {
      compatibilitiesFilterOptions: filterData(),
      apCompatibilities: apCompatibilitiesData(),
      incompatible: 1
    }
  },
  useIsEdgeReady: jest.fn().mockReturnValue(false)
}))

const meshData = {
  fields: ['clients','serialNumber','apDownRssis','downlink','IP','apUpRssi','apMac',
    'venueName','meshRole','uplink','venueId','name','apUpMac','apRssis','model','hops','cog'],
  page: 1,
  totalCount: 0,
  data: [
    {
      serialNumber: '981604906462',
      name: 'AP-981604906462',
      model: 'R710',
      venueId: '8caa8f5e01494b5499fa156a6c565138',
      venueName: 'Ada',
      IP: '192.168.34.237',
      apMac: '74:3E:2B:30:1E:70',
      meshRole: 'RAP',
      hops: 0,
      uplink: [],
      downlink: [{
        serialNumber: '321602105278',
        name: 'AP-321602105278',
        model: 'R510',
        venueId: '8caa8f5e01494b5499fa156a6c565138',
        venueName: 'Ada',
        IP: '192.168.34.203',
        apMac: 'EC:8C:A2:32:88:93',
        meshRole: 'MAP',
        hops: 3,
        txFrames: '3847',
        rssi: 78,
        rxBytes: '495421',
        txBytes: '787581',
        rxFrames: '1726',
        type: 2,
        downMac: 'ec:8c:a2:32:88:93',
        uplink: [],
        downlink: []
      }]
    },
    {
      serialNumber: '321602105275',
      name: 'AP-321602105275',
      model: 'R510',
      venueId: '8caa8f5e01494b5499fa156a6c565138',
      venueName: 'Ada',
      IP: '192.168.34.201',
      apMac: 'EC:8C:A2:32:88:90',
      meshRole: 'MAP',
      hops: 1,
      uplink: [],
      downlink: []
    },
    {
      serialNumber: '481503905523',
      name: 'AP-481503905523',
      model: 'R600',
      venueId: '8caa8f5e01494b5499fa156a6c565138',
      venueName: 'Ada',
      IP: '192.168.34.234',
      apMac: 'F8:E7:1E:25:9F:D0',
      meshRole: 'EMAP',
      hops: 2,
      uplink: [],
      downlink: []
    }
  ]
}

describe('VenueWifi', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.post(
        WifiUrlsInfo.getApGroupsList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        CommonUrlsInfo.getMeshAps.url.replace('?mesh=true', ''),
        (req, res, ctx) => res(ctx.json(meshData))
      ),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))
      ),
      rest.post(
        WifiRbacUrlsInfo.getVenueApCompatibilities.url,
        (req, res, ctx) => res(ctx.json(venueApCompatibilitiesData))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesVenue.url,
        (req, res, ctx) => res(ctx.json(venueApCompatibilitiesData))
      )
    )
  })

  const params = {
    tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
    venueId: '8caa8f5e01494b5499fa156a6c565138',
    activeTab: 'devices',
    activeSubTab: 'wifi'
  }

  it('should render correctly', async () => {
    render(<Provider><VenueDevicesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/:activeTab/:activeSubTab' }
    })
    fireEvent.click(await screen.findByTestId('ListSolid'))
    expect(await screen.findByTestId('ApTable')).toBeVisible()

    fireEvent.click(await screen.findByTestId('MeshSolid'))
    expect(await screen.findByRole('row', { name: /AP-981604906462/i })).toBeVisible()
  })

  it('should render Ap Compatibilities Note correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ![Features.WIFI_RBAC_API, Features.EDGE_COMPATIBILITY_CHECK_TOGGLE].includes(ff as Features))

    render(<Provider><VenueDevicesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/:activeTab/:activeSubTab' }
    })

    expect(await screen.findByTestId('ApTable')).toBeVisible()
    expect(mockedretrievedOptions).toBeCalled()
    expect(await screen.findByTestId('ap-compatibility-alert-note')).toBeVisible()
    await waitFor(async () => {
      expect(
        await screen.findByText(/1 access points are not compatible with certain Wi-Fi features./i)
      ).toBeVisible()
    })
    const openButton = await screen.findByTestId('ap-compatibility-alert-note-open')
    expect(openButton).toBeVisible()
    await userEvent.click(openButton)
    expect(await screen.findByTestId('ap-compatibility-drawer')).toBeVisible()
    await userEvent.click(screen.getByRole('img', { name: 'close' }))
    expect(mockSetSessionStorage).toBeCalled()
    expect(screen.queryByTestId('ap-compatibility-alert-note')).not.toBeInTheDocument()
  })
})

describe('Venue device tab', () => {
  let params: { tenantId: string, venueId: string, activeTab: string, activeSubTab: string }

  beforeEach(() => {
    jest.mocked(useIsEdgeReady).mockReturnValue(true)

    params = {
      tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
      venueId: '8caa8f5e01494b5499fa156a6c565138',
      activeTab: 'devices',
      activeSubTab: 'edge'
    }
  })

  it('should direct to other tab correctly', async () => {
    render(
      <Provider>
        <VenueDevicesTab />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/venues/:venueId/venue-details/:activeTab/:activeSubTab'
        }
      })

    const tab = await screen.findByRole('tab', { name: 'Switch' })
    fireEvent.click(tab)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/venue-details/devices/switch`,
      hash: '',
      search: ''
    })
  })
})
