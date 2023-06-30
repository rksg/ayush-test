
import { DhcpModeEnum }                 from './DhcpModeEnum'
import { DhcpServiceAp }                from './DhcpServiceAp'
import { DhcpWanPortSelectionModeEnum } from './DhcpWanPortSelectionModeEnum'

export class VenueDhcpServiceSetting {
  enabled?: boolean

  mode: DhcpModeEnum

  wanPortSelectionMode: DhcpWanPortSelectionModeEnum

  dhcpServiceProfileIds?: string[]

  dhcpServiceAps?: DhcpServiceAp[]

  enableClientIsolationAllowlist?: boolean | null

  constructor () {
    this.enabled = false

    this.mode = DhcpModeEnum.EnableOnEachAPs

    this.wanPortSelectionMode = DhcpWanPortSelectionModeEnum.Dynamic

    this.dhcpServiceProfileIds = []

    this.enableClientIsolationAllowlist = null
  }
}
