import { createContext } from 'react'

import { PortProfileUI } from '@acx-ui/rc/utils'

export interface PortProfileType {
  editMode: boolean
  portProfileSettingValues: PortProfileUI
  setPortProfileSettingValues: (data: PortProfileUI) => void
}
const PortProfileContext = createContext({} as PortProfileType)

export default PortProfileContext