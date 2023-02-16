import { createContext } from 'react'

import { SwitchConfigurationProfile } from '@acx-ui/rc/utils'

export interface ConfigurationProfileType {
  editMode: boolean
  currentData: SwitchConfigurationProfile
}
const ConfigurationProfileFormContext = createContext({} as ConfigurationProfileType)

export default ConfigurationProfileFormContext

