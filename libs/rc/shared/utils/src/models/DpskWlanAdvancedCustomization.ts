import { BasicServiceSetPriorityEnum } from './BasicServiceSetPriorityEnum'
import { ClientIsolationOptions }      from './ClientIsolationOptions'
import { DnsProxy }                    from './DnsProxy'
import { MultiLinkOperationOptions }   from './MultiLinkOperationOptions'
import { QosMapSetOptions }            from './QosMapSetOptions'
import { RadiusOptions }               from './RadiusOptions'
import { VlanPool }                    from './VlanPool'
import { WlanRadioCustomization }      from './WlanRadioCustomization'

export class DpskWlanAdvancedCustomization {
  devicePolicyId?: string | null

  l2AclPolicyId?: string | null

  l3AclPolicyId?: string | null

  applicationPolicyId?: string

  accessControlProfileId?: string | null

  urlFilteringPolicyId?: null

  tunnelProfileId?: string | null

  userUplinkRateLimiting?: number

  // Mbps
  userDownlinkRateLimiting?: number

  // Mbps
  totalUplinkRateLimiting?: number

  // Mbps
  totalDownlinkRateLimiting?: number

  maxClientsOnWlanPerRadio: number

  enableBandBalancing?: boolean

  // Prevents client access to other clients connected to this network. Usually enabled in public networks.
  clientIsolation?: boolean

  // Client isolation custom settings
  clientIsolationOptions: ClientIsolationOptions

  // Network will not broadcast its SSID publicly, but users who know the SSID will be able to connect.
  hideSsid?: boolean

  // Forces clients to obtain a valid IP address from DHCP. This prevents clients configured with a static IP address from connecting to this network.
  forceMobileDeviceDhcp?: boolean

  clientLoadBalancingEnable?: boolean

  // If VxLan feautre is enabled, enableAaaVlanOverride should be false.
  enableAaaVlanOverride?: boolean

  // This is a per radio client count at which an AP will stop converting group addressed data traffic to unicast. The directed threshold value (and action) is checked by the AP after it has performed other multicast handling actions (e.g. SmartCast), such as application detection and checking IGMP subscription of clients. Due to the order of actions on some traffic, the directed threshold may not be the final determinant in multicast frame handling.
  directedThreshold: number

  // Enhances roaming by providing a list of neighbor APs to the client device. APs build a neighbor AP list via background scanning, and when the client plans to roam, it will request this list from the AP. This list is then used to perform efficient scanning to find a roaming candidate.

  enableNeighborReport?: boolean

  radioCustomization: WlanRadioCustomization

  enableSyslog?: boolean

  // Client will be disconnected after being idle for this number of seconds.
  clientInactivityTimeout: number

  accessControlEnable?: boolean

  respectiveAccessControl?: boolean

  vlanPool: VlanPool | null

  applicationPolicyEnable?: boolean

  l2AclEnable?: boolean

  l3AclEnable?: boolean

  wifiCallingEnabled?: boolean

  wifiCallingIds?: string[]

  proxyARP?: boolean

  enableAirtimeDecongestion?: boolean

  enableJoinRSSIThreshold?: boolean

  joinRSSIThreshold: number

  enableTransientClientManagement?: boolean

  joinWaitTime: number

  joinExpireTime: number

  joinWaitThreshold: number

  enableOptimizedConnectivityExperience?: boolean

  broadcastProbeResponseDelay: number

  rssiAssociationRejectionThreshold: number

  enableAntiSpoofing?: boolean

  enableArpRequestRateLimit?: boolean

  arpRequestRateLimit: number

  enableDhcpRequestRateLimit?: boolean

  dhcpRequestRateLimit: number

  dnsProxyEnabled?: boolean

  dnsProxy?: DnsProxy

  bssPriority: BasicServiceSetPriorityEnum
  radiusOptions?: RadiusOptions

  dhcpOption82Enabled?: boolean

  dhcpOption82SubOption1Enabled?: boolean

  dhcpOption82SubOption1Format?: string | null

  dhcpOption82SubOption2Enabled?: boolean

  dhcpOption82SubOption2Format?: string | null

  dhcpOption82SubOption150Enabled?: boolean

  dhcpOption82SubOption151Enabled?: boolean

  dhcpOption82SubOption151Format?: string | null

  dhcpOption82MacFormat?: string | null

  enableMulticastUplinkRateLimiting?: boolean

  enableMulticastDownlinkRateLimiting?: boolean

  enableMulticastUplinkRateLimiting6G?: boolean

  enableMulticastDownlinkRateLimiting6G?: boolean

  wifi6Enabled?: boolean

  wifi7Enabled?: boolean

  multiLinkOperationEnabled?: boolean

  multiLinkOperationOptions?: MultiLinkOperationOptions

  qosMapSetEnabled?: boolean

  qosMapSetOptions?: QosMapSetOptions

  constructor () {
    this.maxClientsOnWlanPerRadio = 100

    this.enableBandBalancing = true

    this.clientIsolation = false

    this.clientIsolationOptions = new ClientIsolationOptions()

    this.hideSsid = false

    this.forceMobileDeviceDhcp = false

    this.clientLoadBalancingEnable = true

    this.enableAaaVlanOverride = true

    this.directedThreshold = 5

    this.enableNeighborReport = true

    this.radioCustomization = new WlanRadioCustomization()

    this.enableSyslog = false

    this.clientInactivityTimeout = 120

    this.accessControlEnable = false

    this.respectiveAccessControl = true

    this.vlanPool = null

    this.applicationPolicyEnable = false

    this.l2AclEnable = false

    this.l3AclEnable = false

    this.wifiCallingEnabled = false

    //@Size(    max = 5 )
    this.wifiCallingIds = []

    this.proxyARP = false

    this.enableAirtimeDecongestion = false

    this.enableJoinRSSIThreshold = false

    this.joinRSSIThreshold = -85

    this.enableTransientClientManagement = false

    this.joinWaitTime = 30

    this.joinExpireTime = 300

    this.joinWaitThreshold = 10

    this.enableOptimizedConnectivityExperience = false

    this.broadcastProbeResponseDelay = 15

    this.rssiAssociationRejectionThreshold = -75

    this.enableAntiSpoofing = false

    this.enableArpRequestRateLimit = true

    this.arpRequestRateLimit = 15

    this.enableDhcpRequestRateLimit = true

    this.dhcpRequestRateLimit = 15

    this.dnsProxyEnabled = false

    this.dnsProxy = new DnsProxy()

    this.bssPriority = BasicServiceSetPriorityEnum.HIGH

    this.dhcpOption82Enabled = false

    this.dhcpOption82SubOption1Enabled = false

    this.dhcpOption82SubOption1Format = null

    this.dhcpOption82SubOption2Enabled = false

    this.dhcpOption82SubOption2Format = null

    this.dhcpOption82SubOption150Enabled = false

    this.dhcpOption82SubOption151Enabled = false

    this.dhcpOption82SubOption151Format = null

    this.dhcpOption82MacFormat = null

    this.enableMulticastUplinkRateLimiting = false

    this.enableMulticastDownlinkRateLimiting = false

    this.enableMulticastUplinkRateLimiting6G = false

    this.enableMulticastDownlinkRateLimiting6G = false

    this.wifi6Enabled = true

    this.wifi7Enabled = true

    this.multiLinkOperationEnabled = false

    this.qosMapSetEnabled = false

    this.qosMapSetOptions = new QosMapSetOptions()
  }
}
