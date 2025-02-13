import { Tooltip } from '@acx-ui/components'
import {
  BasicServiceSetPriorityEnum,
  KeyValue,
  NetworkSaveData,
  NetworkVenue,
  OpenWlanAdvancedCustomization,
  RadioEnum,
  SchedulerTypeEnum,
  RadioTypeEnum
} from '@acx-ui/rc/utils'
import { ClientIsolationOptions, WlanRadioCustomization } from '@acx-ui/rc/utils'
import { TenantLink }                                     from '@acx-ui/react-router-dom'
import { render, screen }                                 from '@acx-ui/test-utils'

import {
  network,
  networkVenue_allAps,
  networkVenue_apgroup
} from '../NetworkApGroupDialog/__tests__/NetworkVenueTestData'

import { transformApGroupVlan, transformAps, transformRadios, transformScheduling, transformVLAN } from './apGroupPipes'

const mockWlanAdvancedVlanPoolData: OpenWlanAdvancedCustomization = {
  clientIsolation: true,
  maxClientsOnWlanPerRadio: 100,
  enableBandBalancing: true,
  clientIsolationOptions: {} as ClientIsolationOptions,
  hideSsid: false,
  forceMobileDeviceDhcp: false,
  clientLoadBalancingEnable: true,
  directedThreshold: 5,
  enableNeighborReport: true,
  radioCustomization: {} as WlanRadioCustomization,
  enableSyslog: false,
  clientInactivityTimeout: 120,
  accessControlEnable: false,
  respectiveAccessControl: true,
  vlanPool: {
    id: 'testPoolId',
    name: 'testPoolName',
    vlanMembers: ['1-10']
  },
  applicationPolicyEnable: false,
  l2AclEnable: false,
  l3AclEnable: false,
  wifiCallingEnabled: false,
  wifiCallingIds: [],
  proxyARP: false,
  enableAirtimeDecongestion: false,
  enableJoinRSSIThreshold: false,
  joinRSSIThreshold: -85,
  enableTransientClientManagement: false,
  joinWaitTime: 30,
  joinExpireTime: 300,
  joinWaitThreshold: 10,
  enableOptimizedConnectivityExperience: false,
  broadcastProbeResponseDelay: 15,
  rssiAssociationRejectionThreshold: -75,
  enableAntiSpoofing: false,
  enableArpRequestRateLimit: true,
  arpRequestRateLimit: 15,
  enableDhcpRequestRateLimit: true,
  dhcpRequestRateLimit: 15,
  dnsProxyEnabled: false,
  bssPriority: BasicServiceSetPriorityEnum.HIGH,
  dhcpOption82Enabled: false,
  dhcpOption82SubOption1Enabled: false,
  dhcpOption82SubOption1Format: null,
  dhcpOption82SubOption2Enabled: false,
  dhcpOption82SubOption2Format: null,
  dhcpOption82SubOption150Enabled: false,
  dhcpOption82SubOption151Enabled: false,
  dhcpOption82SubOption151Format: null,
  dhcpOption82MacFormat: null,
  enableMulticastUplinkRateLimiting: false,
  enableMulticastDownlinkRateLimiting: false,
  enableMulticastUplinkRateLimiting6G: false,
  enableMulticastDownlinkRateLimiting6G: false,
  enableAdditionalRegulatoryDomains: true,
  wifi6Enabled: true,
  wifi7Enabled: true,
  multiLinkOperationEnabled: false,
  qosMirroringEnabled: true,
  qosMapSetEnabled: false
}

const mockedUsedNavigate = jest.fn()
const mockedUseLocation = jest.fn()
const mockedUseTenantLink = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => mockedUseLocation(),
  TenantLink: () => <div>TenantLink</div>,
  useTenantLink: () => mockedUseTenantLink()
}))

describe('Test apGroupPipes.utils', () => {
  const vlanPoolingNameMap = [
    { key: '1c061cf2649344adaf1e79a9d624a451', value: 'pool1' }
  ]
  it('transformVLAN', async () => {
    let view = render(transformVLAN(networkVenue_allAps, network, vlanPoolingNameMap))

    expect(screen.getByText('VLAN-1 (Default)')).toBeDefined()

    view.unmount()
    view = render(transformVLAN(networkVenue_apgroup, network, vlanPoolingNameMap))

    expect(screen.getByText('VLAN Pool: pool1 (Custom)')).toBeDefined()

    view.unmount()
    view = render(transformVLAN({ ...networkVenue_apgroup, apGroups: [{
      radio: RadioEnum._2_4_GHz,
      radioTypes: [RadioTypeEnum._2_4_GHz],
      isDefault: true,
      apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
      apGroupName: 'APs not assigned to any group',
      vlanId: 10
    }] }, network, vlanPoolingNameMap))

    expect(screen.getByText('VLAN-10 (Custom)')).toBeDefined()

    view.unmount()
    view = render(transformVLAN({ ...networkVenue_apgroup, apGroups: [{
      radio: RadioEnum._2_4_GHz,
      radioTypes: [RadioTypeEnum._2_4_GHz],
      isDefault: true,
      apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
      apGroupName: 'APs not assigned to any group',
      vlanPoolId: '1c061cf2649344adaf1e79a9d624a451'//,
      //vlanPoolName: 'pool1'
    }, {
      apGroupId: '9150b159b5f748a1bbf55dab35a60bce',
      apGroupName: 'ewrw',
      radio: RadioEnum.Both,
      radioTypes: [ RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      isDefault: false,
      vlanId: 1
    }, {
      apGroupId: '9150b159b5f748a1bbf55dab35a60bcf',
      apGroupName: 'radio3Types',
      radio: RadioEnum.Both,
      radioTypes: [ RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz],
      isDefault: false,
      vlanId: 2
    }] }, network, vlanPoolingNameMap))

    expect(screen.getByText('Per AP Group')).toBeDefined()

    view.unmount()
  })

  it('transformAps', async () => {
    let view = render(transformAps(networkVenue_allAps, network))

    expect(screen.getByText('All APs')).toBeDefined()

    view.unmount()
    view = render(transformAps(networkVenue_apgroup, network))

    expect(screen.getByText('Unassigned APs')).toBeDefined()

    view.unmount()
    view = render(transformAps({ ...networkVenue_apgroup, apGroups: [{
      apGroupId: '9150b159b5f748a1bbf55dab35a60bce',
      apGroupName: 'ewrw',
      radio: RadioEnum.Both,
      radioTypes: [ RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      isDefault: false,
      vlanId: 1
    }] }, network))
    expect(screen.getByText('ewrw')).toBeDefined()
  })

  it('transformRadios', async () => {
    let view = render(transformRadios(networkVenue_apgroup, network))

    expect(screen.getByText('2.4 GHz')).toBeDefined()

    view.unmount()
    view = render(transformRadios(networkVenue_allAps, network))

    expect(screen.getByText('2.4 GHz, 5 GHz')).toBeDefined()

    view.unmount()
    view = render(transformRadios({ ...networkVenue_allAps,
      allApGroupsRadioTypes: [ RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz]
    }, network))

    expect(screen.getByText('All')).toBeDefined()

    view.unmount()
    view = render(transformRadios({ ...networkVenue_allAps,
      allApGroupsRadioTypes: undefined
    }, network))

    expect(screen.getByText('2.4 GHz / 5 GHz')).toBeDefined()

    view.unmount()
    view = render(transformRadios({ ...networkVenue_allAps,
      allApGroupsRadioTypes: undefined,
      allApGroupsRadio: RadioEnum._5_GHz
    }, network))

    expect(screen.getByText('5 GHz')).toBeDefined()

    view.unmount()
    view = render(transformRadios({ ...networkVenue_apgroup, apGroups: [{
      radio: RadioEnum._2_4_GHz,
      radioTypes: [RadioTypeEnum._2_4_GHz],
      isDefault: true,
      apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
      apGroupName: 'APs not assigned to any group',
      vlanPoolId: '1c061cf2649344adaf1e79a9d624a451'//,
      //vlanPoolName: 'pool1'
    }, {
      apGroupId: '9150b159b5f748a1bbf55dab35a60bce',
      apGroupName: 'ewrw',
      radio: RadioEnum.Both,
      radioTypes: [ RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      isDefault: false,
      vlanId: 1
    }] }, network))

    expect(screen.getByText('Per AP Group')).toBeDefined()
  })

  it('transformScheduling', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00'))) // Australian Eastern Standard Time

    let view = render(transformScheduling(networkVenue_apgroup))

    expect(screen.getByText('24/7')).toBeDefined()

    /* eslint-disable max-len */
    const scheduler = {
      type: SchedulerTypeEnum.CUSTOM,
      sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
      mon: '111111111111111111111111111111111111111111111111000000000000000000000000000000000000000000000000',
      tue: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      wed: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      thu: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
      fri: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
      sat: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
    }

    view.unmount()
    view = render(transformScheduling(
      { ...networkVenue_apgroup, scheduler }, { day: 'Wed', timeIndex: 91 }))

    expect(screen.getByText('OFF now')).toBeDefined()

    view.unmount()
    view = render(transformScheduling(
      { ...networkVenue_apgroup, scheduler }, { day: 'Mon', timeIndex: 47 }))

    expect(screen.getByText('ON now')).toBeDefined()

    view.unmount()
    view = render(transformScheduling({ ...networkVenue_apgroup, scheduler: {
      type: SchedulerTypeEnum.ALWAYS_OFF
    } }))

    view.unmount()
    view = render(transformScheduling(networkVenue_allAps))

    expect(screen.getByText('24/7')).toBeDefined()

    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('transformApGroupVlan', async () => {
    const emptyResult = transformApGroupVlan()
    expect(emptyResult).toEqual(<></>)

    let currentVenue: NetworkVenue = {
      isAllApGroups: false,
      allApGroupsRadio: RadioEnum._2_4_GHz,
      apGroups: [{
        apGroupId: 'testGroupId',
        radio: RadioEnum._2_4_GHz,
        vlanPoolId: 'testPoolId'
      }]
    }
    let network: NetworkSaveData = {
      wlan: {
        advancedCustomization: mockWlanAdvancedVlanPoolData
      }
    }
    let vlanPoolingNameMap: KeyValue<string, string>[] = [{
      key: 'testPoolId',
      value: 'testPoolName'
    }]

    let result = transformApGroupVlan(currentVenue, network, 'testGroupId', vlanPoolingNameMap)
    expect(result).toEqual(
      <Tooltip
        arrowPointAtCenter={false}
        autoAdjustOverflow={true}
        mouseEnterDelay={0.5}
        mouseLeaveDelay={0.1}
        placement='top'
        title='VLAN Pool: testPoolName (Default)'>
        <TenantLink to='policies/vlanPool/testPoolId/detail'>
          VLAN Pool: testPoolName (Default)
        </TenantLink>
      </Tooltip>
    )
  })
})
