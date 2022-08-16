import { ClientIsolationOptions } from './ClientIsolationOptions'
import { DnsProxy }               from './DnsProxy'
import { VlanPool }               from './VlanPool'
import { WlanRadioCustomization } from './WlanRadioCustomization'

export class OpenWlanAdvancedCustomization {
  clientIsolation?: boolean

  devicePolicyId?: string

  l2AclPolicyId?: string

  l3AclPolicyId?: string

  applicationPolicyId?: string

  accessControlProfileId?: string

  userUplinkRateLimiting?: number

  userDownlinkRateLimiting?: number

  totalUplinkRateLimiting?: number

  totalDownlinkRateLimiting?: number

  maxClientsOnWlanPerRadio: number

  enableBandBalancing?: boolean

  clientIsolationOptions: ClientIsolationOptions

  hideSsid?: boolean

  forceMobileDeviceDhcp?: boolean

  clientLoadBalancingEnable?: boolean

  directedThreshold: number

  enableNeighborReport?: boolean

  radioCustomization: WlanRadioCustomization

  enableSyslog?: boolean

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
