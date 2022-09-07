import { AAANetwork }                    from '../models/AAANetwork'
import { AAAWlan }                       from '../models/AAAWlan'
import { DpskNetwork }                   from '../models/DpskNetwork'
import { DpskPassphraseGeneration }      from '../models/DpskPassphraseGeneration'
import { DpskWlan }                      from '../models/DpskWlan'
import { GuestNetwork }                  from '../models/GuestNetwork'
import { GuestPortal }                   from '../models/GuestPortal'
import { GuestWlan }                     from '../models/GuestWlan'
import { MacAuthMacFormatEnum }          from '../models/MacAuthMacFormatEnum'
import { ManagementFrameProtectionEnum } from '../models/ManagementFrameProtectionEnum'
import { NetworkVenue }                  from '../models/NetworkVenue'
import { OpenNetwork }                   from '../models/OpenNetwork'
import { OpenWlan }                      from '../models/OpenWlan'
import { PskNetwork }                    from '../models/PskNetwork'
import { PskWlan }                       from '../models/PskWlan'
import { Radius }                        from '../models/Radius'
import { WlanAdvancedCustomization }     from '../models/WlanAdvancedCustomization'


export class AnyWlan implements AAAWlan, PskWlan, OpenWlan, GuestWlan, DpskWlan {
  advancedCustomization: WlanAdvancedCustomization
  bypassCPUsingMacAddressAuthentication: boolean
  macAddressAuthentication: boolean
  enabled: boolean
  ssid: string
  vlanId: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wlanSecurity: any
  managementFrameProtection?: ManagementFrameProtectionEnum
  bypassCNA?: boolean
  passphrase?: string
  saePassphrase?: string
  wepHexKey?: string
  macAuthMacFormat?: MacAuthMacFormatEnum
  
  constructor () {
    this.ssid = ''
    this.advancedCustomization = new WlanAdvancedCustomization()
    this.vlanId = 1
    this.ssid = ''
    this.enabled = true
    this.bypassCPUsingMacAddressAuthentication = false
    this.macAddressAuthentication = false
  }
  
}
export class AnyNetwork implements 
    PskNetwork, DpskNetwork, OpenNetwork, GuestNetwork, AAANetwork {
  
  name: string
  description?: string
  venues?: NetworkVenue[]
  type: string
  tenandId?: string
  wlan: AnyWlan
  guestPortal: GuestPortal
  dpskPassphraseGeneration: DpskPassphraseGeneration
  authRadius?: Radius | undefined
  accountingRadius?: Radius | undefined
  cloudpathServerId?: string | undefined

  constructor () {
    this.name = ''
    this.type = ''
    this.wlan = new AnyWlan()
    this.guestPortal = new GuestPortal()
    this.dpskPassphraseGeneration = new DpskPassphraseGeneration()
  }
}
