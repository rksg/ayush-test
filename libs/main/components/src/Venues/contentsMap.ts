import { EditContext, RadioContext } from './VenueEdit'
import { AdvanceSettingContext }     from './VenueEdit/WifiConfigTab/AdvancedTab'
import { NetworkingSettingContext }  from './VenueEdit/WifiConfigTab/NetworkingTab'
import { SecuritySettingContext }    from './VenueEdit/WifiConfigTab/SecurityTab'
import { ServerSettingContext }      from './VenueEdit/WifiConfigTab/ServerTab'

export const defaultValue = {
  editContextData: {} as EditContext,
  setEditContextData: () => {},
  editNetworkingContextData: {} as NetworkingSettingContext,
  setEditNetworkingContextData: () => {},
  editRadioContextData: {} as RadioContext,
  setEditRadioContextData: () => {},
  editSecurityContextData: {} as SecuritySettingContext,
  setEditSecurityContextData: () => {},
  editServerContextData: {} as ServerSettingContext,
  setEditServerContextData: () => {},
  editAdvancedContextData: {} as AdvanceSettingContext,
  setEditAdvancedContextData: () => {},
  previousPath: '',
  setPreviousPath: () => {}
}
