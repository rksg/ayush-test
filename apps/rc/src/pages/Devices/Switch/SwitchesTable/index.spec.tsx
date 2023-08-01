import { rest } from 'msw'

import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import useSwitchesTable from '.'

jest.mock('@acx-ui/rc/components', () => {
  const { forwardRef } = jest.requireActual('react')
  return {
    ...jest.requireActual('@acx-ui/rc/components'),
    SwitchTable: forwardRef(() => <div data-testid={'SwitchTable'}></div>)
  }
})

describe('Switch List Table', () => {
  const list = {
    totalCount: 3,
    page: 1,
    data: [
      {
        activeSerial: 'FEK3224R013',
        cliApplied: false,
        configReady: false,
        deviceStatus: 'PREPROVISIONED',
        id: 'FEK3224R013',
        isStack: false,
        model: 'ICX7150-C12P',
        name: 'FEK3224R013',
        serialNumber: 'FEK3224R013',
        suspendingDeployTime: '',
        switchMac: '',
        syncDataEndTime: '',
        venueId: 'b12fd44f52bf4df2bca8835bab118c4c',
        venueName: 'My-Venue'
      },
      {
        activeSerial: 'FMF3249Q0J2',
        cliApplied: true,
        configReady: false,
        deviceStatus: 'PREPROVISIONED',
        id: 'FMF3249Q0J2',
        isStack: false,
        model: 'ICX7150-C08P',
        name: 'FMF3249Q0J2',
        serialNumber: 'FMF3249Q0J2',
        suspendingDeployTime: '',
        switchMac: '',
        syncDataEndTime: '',
        venueId: '2af8afc8a81649458f5889b974186476',
        venueName: '0_test_check_verify200'
      },
      {
        activeSerial: 'FEK3250P5VH',
        cliApplied: false,
        clientCount: 9,
        configReady: true,
        deviceStatus: 'ONLINE',
        id: 'd4:c1:9e:89:15:b0',
        ipAddress: '30.0.0.205',
        isStack: false,
        model: 'ICX7150-C12P',
        name: 'MLISA Switch_111@video_test_12345_check_test_upd',
        serialNumber: 'FEK3250P5VH',
        suspendingDeployTime: '',
        switchMac: 'd4:c1:9e:89:15:b0',
        switchName: 'MLISA Switch_111@video_test_12345_check_test_upd',
        syncDataEndTime: '',
        syncedSwitchConfig: true,
        uptime: '57 days, 7 hours',
        venueId: '101988f2bbcd431884de9a7e6a5875c4',
        venueName: 'Mesh_setup'
      }
    ]
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        SwitchUrlsInfo.getMemberList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchModelList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should render page correctly', async () => {
    const Component = () => {
      const { component } = useSwitchesTable()
      return component
    }

    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findByTestId('SwitchTable')).toBeVisible()
  })

  it('should render title with count correctly', async () => {
    const Title = () => {
      const { title } = useSwitchesTable()
      return <span>{title}</span>
    }
    render(<Title/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('Switch List (3)')).toBeVisible()
  })

  it('should render extra header correctly', async () => {
    const Component = () => {
      const { headerExtra } = useSwitchesTable()
      return <span>{headerExtra.map((item, index) => ({ ...item, key: index }))}</span>
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('Add')).toBeVisible()
  })
})
