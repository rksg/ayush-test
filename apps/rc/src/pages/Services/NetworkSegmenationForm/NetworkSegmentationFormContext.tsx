import { createContext } from 'react'

import { NetworkSegmentationSaveData } from '@acx-ui/rc/utils'

export interface NetworkSegmentationFormContextType {
  editMode: boolean,
  saveState: NetworkSegmentationSaveData,
  updateSaveState: (data: NetworkSegmentationSaveData) => void
}

const NetworkSegmentationFormContext = createContext({} as NetworkSegmentationFormContextType)

export default NetworkSegmentationFormContext
