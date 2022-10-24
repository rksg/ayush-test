import { createContext } from 'react'

import { Portal } from '@acx-ui/rc/utils'
export interface PortalFormContextType {
  editMode: boolean,
  portalData: Portal,
  setPortalData: (data: Portal) => void
}
const PortalFormContext = createContext({} as PortalFormContextType)

export default PortalFormContext

