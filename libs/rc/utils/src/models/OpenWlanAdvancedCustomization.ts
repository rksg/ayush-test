import { ClientIsolationOptions } from './ClientIsolationOptions'
import { DnsProxy }               from './DnsProxy'
import { VlanPool }               from './VlanPool'
import { WlanRadioCustomization } from './WlanRadioCustomization'

export class OpenWlanAdvancedCustomization {
  // Prevents client access to other clients connected to this network. Usually enabled in public networks.

  clientIsolation?: boolean

  devicePolicyId?: string | null

  l2AclPolicyId?: string

  l3AclPolicyId?: string

  applicationPolicyId?: string

  accessControlProfileId?: string

  userUplinkRateLimiting?: number

  // Mbps
  userDownlinkRateLimiting?: number

  // Mbps
  totalUplinkRateLimiting?: number

  // Mbps
  totalDownlinkRateLimiting?: number

  maxClientsOnWlanPerRadio: number

  enableBandBalancing?: boolean

  // Client isolation custom settings
  clientIsolationOptions: ClientIsolationOptions

  // Network will not broadcast its SSID publicly, but users who know the SSID will be able to connect.
  hideSsid?: boolean

  // Forces clients to obtain a valid IP address from DHCP. This prevents clients configured with a static IP address from connecting to this network.
  forceMobileDeviceDhcp?: boolean

  clientLoadBalancingEnable?: boolean

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

  constructor () {
    this.clientIsolation = true

    this.maxClientsOnWlanPerRadio = 100

    this.enableBandBalancing = true

    this.clientIsolationOptions = new ClientIsolationOptions()

    this.hideSsid = false

    this.forceMobileDeviceDhcp = false

    this.clientLoadBalancingEnable = true

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
  }
}
