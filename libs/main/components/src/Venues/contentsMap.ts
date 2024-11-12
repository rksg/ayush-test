import { EditContext, RadioContext } from './VenueEdit'
import { AdvanceSettingContext }     from './VenueEdit/WifiConfigTab/AdvancedTab'
import { NetworkingSettingContext }  from './VenueEdit/WifiConfigTab/NetworkingTab'
import { SecuritySettingContext }    from './VenueEdit/WifiConfigTab/SecurityTab'
import { ServerSettingContext }      from './VenueEdit/WifiConfigTab/ServerTab'

export const defaultValue = {
  editContextData: {} as EditContext,
  editNetworkingContextData: {} as NetworkingSettingContext,
  editRadioContextData: {} as RadioContext,
  editSecurityContextData: {} as SecuritySettingContext,
  editServerContextData: {} as ServerSettingContext,
  editAdvancedContextData: {} as AdvanceSettingContext,
  previousPath: ''
}
