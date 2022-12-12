import { createContext } from 'react'

import { WebAuthTemplate } from '@acx-ui/rc/utils'
export interface NetworkSegAuthFormContextType {
  editMode: boolean,
  saveState: WebAuthTemplate,
  updateSaveState: (data: WebAuthTemplate) => void
}
const NetworkSegAuthFormContext = createContext({} as NetworkSegAuthFormContextType)

export default NetworkSegAuthFormContext
