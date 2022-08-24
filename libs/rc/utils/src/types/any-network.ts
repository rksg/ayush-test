import { NetworkVenue }                  from './network'
import { AAANetwork }                    from './wifi/AAANetwork'
import { AAAWlan }                       from './wifi/AAAWlan'
import { DpskNetwork }                   from './wifi/DpskNetwork'
import { DpskPassphraseGeneration }      from './wifi/DpskPassphraseGeneration'
import { DpskWlan }                      from './wifi/DpskWlan'
import { GuestNetwork }                  from './wifi/GuestNetwork'
import { GuestPortal }                   from './wifi/GuestPortal'
import { GuestWlan }                     from './wifi/GuestWlan'
import { MacAuthMacFormatEnum }          from './wifi/MacAuthMacFormatEnum'
import { ManagementFrameProtectionEnum } from './wifi/ManagementFrameProtectionEnum'
import { OpenNetwork }                   from './wifi/OpenNetwork'
import { OpenWlan }                      from './wifi/OpenWlan'
import { PskNetwork }                    from './wifi/PskNetwork'
import { PskWlan }                       from './wifi/PskWlan'
import { Radius }                        from './wifi/Radius'
import { WlanAdvancedCustomization }     from './wifi/WlanAdvancedCustomization'


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
  venues?: NetworkVenue
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
