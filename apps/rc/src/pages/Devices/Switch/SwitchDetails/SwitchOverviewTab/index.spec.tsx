import { rest } from 'msw'

import { switchApi }                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { switchDetailData, venueData, vlanList } from '../__tests__/fixtures'

import { SwitchOverviewTab } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  SwitchInfoWidget: () =>
    <div data-testid={'rc-SwitchInfoWidget'} title='SwitchInfoWidget' />,
  SwitchVeTable: () =>
    <div data-testid={'rc-SwitchVeTable'} title='SwitchVeTable' />
}))

jest.mock('./SwitchOverviewPanel', () => ({
  SwitchOverviewPanel: () =>
    <div data-testid={'rc-SwitchOverviewPanel'} title='SwitchOverviewPanel' />
}))
jest.mock('./SwitchOverviewPorts', () => ({
  SwitchOverviewPorts: () =>
    <div data-testid={'rc-SwitchOverviewPorts'} title='SwitchOverviewPorts' />
}))
jest.mock('./SwitchOverviewVLANs', () => ({
  SwitchOverviewVLANs: () =>
    <div data-testid={'rc-SwitchOverviewVLANs'} title='SwitchOverviewVLANs' />
}))
jest.mock('./SwitchOverviewACLs', () => ({
  SwitchOverviewACLs: () =>
    <div data-testid={'rc-SwitchOverviewACLs'} title='SwitchOverviewACLs' />
}))

describe('SwitchOverviewTab', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailData))
      ),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))
      ),
      rest.post(
        SwitchUrlsInfo.getMemberList.url,
        (_, res, ctx) => res(ctx.json([]))
      ),

      rest.post(SwitchUrlsInfo.getVlanListBySwitchLevel.url,
        (_, res, ctx) => res(ctx.json(vlanList)))
    )
  })

  it.skip('should render correctly', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider><SwitchOverviewTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab'
      }
    })
    expect(await screen.findByTestId('rc-SwitchInfoWidget')).toBeVisible()
    expect(await screen.findByTestId('rc-SwitchOverviewPanel')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(5)
    fireEvent.click(await screen.findByRole('tab', { name: 'Ports' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/t/${params.tenantId}/devices/switch/${params.switchId}/${params.serialNumber}/details/overview/ports`,
      hash: '',
      search: ''
    })
  })

  it('should navigate to ports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview',
      activeSubTab: 'ports'
    }
    render(<Provider><SwitchOverviewTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })
    expect(await screen.findByTestId('rc-SwitchOverviewPorts')).toBeVisible()
  })

  it('should navigate to VLANs tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview',
      activeSubTab: 'vlans'
    }
    render(<Provider><SwitchOverviewTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })
    expect(await screen.findByTestId('rc-SwitchOverviewVLANs')).toBeVisible()
  })

  it('should navigate to ACLs tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview',
      activeSubTab: 'acls'
    }
    render(<Provider><SwitchOverviewTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })
    expect(await screen.findByTestId('rc-SwitchOverviewACLs')).toBeVisible()
  })
}
)
