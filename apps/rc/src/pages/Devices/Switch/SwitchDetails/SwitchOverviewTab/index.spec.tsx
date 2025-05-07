import { rest } from 'msw'

import { useIsSplitOn, Features }         from '@acx-ui/feature-toggle'
import { switchApi }                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { SwitchDetailsContext }                                            from '../'
import { switchDetailData, switchDetailsContextData, venueData, vlanList } from '../__tests__/fixtures'

import { SwitchOverviewTab } from '.'

const macAclList ={
  data: [
    {
      id: '525a68dc53494d29bb163ee0de86ad6a',
      switchId: 'c0:c5:20:78:dd:04',
      name: 'switch_acl1',
      customized: true,
      sharedWithPolicyAndProfile: false,
      switchMacAclRules: [
        {
          id: '5526d685265144cb9908aea2136a77b7',
          action: 'permit',
          sourceAddress: 'any',
          destinationAddress: 'any',
          macAclId: '525a68dc53494d29bb163ee0de86ad6a'
        }
      ]
    }
  ],
  page: 1,
  totalCount: 1,
  totalPages: 1
}

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
        (_, res, ctx) => res(ctx.json(vlanList))),
      rest.post(SwitchUrlsInfo.getSwitchMacAcls.url,
        (_, res, ctx) => res(ctx.json(macAclList)))
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchOverviewTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
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
      pathname: `/${params.tenantId}/t/devices/switch/${params.switchId}/${params.serialNumber}/details/overview/ports`,
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
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchOverviewTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
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
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchOverviewTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
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
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchOverviewTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })
    expect(await screen.findByTestId('rc-SwitchOverviewACLs')).toBeVisible()
  })
  // eslint-disable-next-line max-len
  it('should render Layer 2 and Layer 3 tabs when MAC ACL feature is enabled and firmware version is supported', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((feature) => {
      if (feature === Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE) return true
      return false
    })

    jest.mock('@acx-ui/rc/utils', () => ({
      ...jest.requireActual('@acx-ui/rc/utils'),
      isFirmwareVersionAbove10010gCd1Or10020bCd1: jest.fn(() => true)
    }))

    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview',
      activeSubTab: 'acls',
      categoryTab: 'layer2'
    }

    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          ...switchDetailsContextData,
          switchDetailHeader: {
            ...switchDetailsContextData.switchDetailHeader,
            firmware: 'SPS10020b_cd1'
          }
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchOverviewTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        // eslint-disable-next-line max-len
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab/:categoryTab'
      }
    })

    expect(await screen.findByRole('tab',
      { name: 'Layer 2' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Layer 3' })).toBeVisible()

    expect(await screen.findByTestId('MacACLsTabs')).toBeInTheDocument()
  })

  it('should render only Layer 3 ACLs when MAC ACL feature is disabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((feature) => {
      if (feature === Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE) return false
      return false
    })

    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview',
      activeSubTab: 'acls'
    }

    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchOverviewTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    expect(screen.queryByRole('tab', { name: 'Layer 2' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Layer 3' })).not.toBeInTheDocument()

    expect(await screen.findByTestId('rc-SwitchOverviewACLs')).toBeInTheDocument()
  })
}
)
