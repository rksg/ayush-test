import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi, apApi } from '@acx-ui/rc/services'
import {
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                                from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  venueApCompatibilitiesData,
  apCompatibilitiesFilterData
} from '../../__tests__/fixtures'

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
  ApCompatibilityDrawer: (props: { visible: boolean }) =>
    props.visible && <div data-testid={'ap-compatibility-drawer'} />,
  ApGeneralCompatibilityDrawer: (props: { visible: boolean }) =>
    props.visible && <div data-testid={'enhanced-ap-compatibility-drawer'} />,
  retrievedCompatibilitiesOptions: () => {
    mockedretrievedOptions()
    return {
      compatibilitiesFilterOptions: filterData(),
      apCompatibilities: apCompatibilitiesData(),
      incompatible: 1
    }
  }
}))

jest.mock('./VenueWifi/VenueMeshApsTable/RbacVenueMeshApsTable', ()=>({
  RbacVenueMeshApsTable: () => <div data-testid={'rbacVenueMeshApsTable'} />
}))

jest.mock('./VenueEdge', () => ({
  VenueEdge: () => <div data-testid='VenueEdge' id='acx-edge-device' />
}))

const venueMeshSettings = {
  enabled: true,
  ssid: 'Mesh-test',
  passphrase: '1234',
  radioType: '5G',
  zeroTouchEnabled: false
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
        WifiUrlsInfo.getApCompatibilitiesVenue.url,
        (_, res, ctx) => res(ctx.json(venueApCompatibilitiesData))
      ),
      // RBAC
      rest.get(
        WifiRbacUrlsInfo.getVenueMesh.url,
        (_, res, ctx) => res(ctx.json(venueMeshSettings))
      ),
      rest.post(
        WifiRbacUrlsInfo.getVenueApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(venueApCompatibilitiesData))
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
    expect(await screen.findByTestId('rbacVenueMeshApsTable')).toBeVisible()
  })

  it('should render Ap Compatibilities alert correctly', async () => {
    render(<Provider><VenueDevicesTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/:activeTab/:activeSubTab' }
    })

    expect(await screen.findByTestId('ApTable')).toBeVisible()
    expect(mockedretrievedOptions).toBeCalled()
    // eslint-disable-next-line max-len
    const alert = await screen.findByText(/1 access point is not compatible with certain Wi-Fi features./i)
    await waitFor(async () => expect(alert).toBeVisible())
    const openButton = await screen.findByRole('button', { name: /See details/i })
    expect(openButton).toBeVisible()
    await userEvent.click(openButton)
    expect(await screen.findByTestId('enhanced-ap-compatibility-drawer')).toBeVisible()
    await userEvent.click(screen.getByRole('img', { name: 'close' }))
    expect(mockSetSessionStorage).toBeCalled()
    expect(alert).not.toBeInTheDocument()
  })
})

describe('Venue device tab', () => {
  let params: { tenantId: string, venueId: string, activeTab: string, activeSubTab: string }

  beforeEach(() => {
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
