import '@testing-library/jest-dom'
import { rest } from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, WifiUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                                 from '@acx-ui/store'
import { fireEvent, mockServer, render, screen }    from '@acx-ui/test-utils'

import { venueSetting } from '../../__tests__/fixtures'

import { VenueDevicesTab } from '.'


const mockedUsedNavigate = jest.fn()
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
  EdgesTable: () => <div data-testid={'EdgesTable'} />
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
  ] }

describe('VenueWifi', () => {
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockImplementation((feature: string) => {
      return feature === Features.EDGES ? false: true
    })

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
        (_, res, ctx) => res(ctx.json(venueSetting)))
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
})

describe('Venue device tab', () => {
  let params: { tenantId: string, venueId: string, activeTab: string, activeSubTab: string }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

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
