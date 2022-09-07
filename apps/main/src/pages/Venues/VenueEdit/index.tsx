import { createContext, useState } from 'react'

import { showActionModal } from '@acx-ui/components'
import { VenueLed }        from '@acx-ui/rc/utils'
import { useParams }       from '@acx-ui/react-router-dom'

import { SwitchConfigTab } from './SwitchConfigTab'
import { VenueDetailsTab } from './VenueDetailsTab'
import VenueEditPageHeader from './VenueEditPageHeader'
import { WifiConfigTab }   from './WifiConfigTab'

const tabs = {
  details: VenueDetailsTab,
  wifi: WifiConfigTab,
  switch: SwitchConfigTab
}

export interface AdvancedSettingContext {
  title: string,
  isDirty: boolean,
  orinData: VenueLed[],
  editData: VenueLed[],
  updateChanges: () => void,
  setTableData: (data: VenueLed[]) => void,
  tabKey?: string,
  tempData?: {
    settings?: VenueLed[]
  }
}

export const VenueEditContext = createContext({} as {
  editContextData: AdvancedSettingContext,
  setEditContextData: (data: AdvancedSettingContext) => void
})

export function VenueEdit () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  const [editContextData, setEditContextData] = useState({} as AdvancedSettingContext)

  return (
    <VenueEditContext.Provider value={{ editContextData, setEditContextData }}>
      <VenueEditPageHeader />
      { Tab && <Tab /> }
    </VenueEditContext.Provider>
  )
}

export function showUnsavedModal (
  editContextData: AdvancedSettingContext,
  setEditContextData: (data: AdvancedSettingContext) => void,
  callback?: () => void
) {
  showActionModal({
    type: 'confirm',
    title: 'You Have Unsaved Changes',
    content: `Do you want to save your changes in '${editContextData?.title}', 
          or discard all changes?`,
    customContent: {
      action: 'CUSTOM_BUTTONS',
      buttons: [{
        text: 'Cancel',
        type: 'link',
        key: 'close',
        closeAfterAction: true,
        handler () {
          setEditContextData({
            ...editContextData,
            isDirty: true
          })
        }
      }, {
        text: 'Discard Changes',
        type: 'primary',
        key: 'discard',
        closeAfterAction: true,
        handler: async () => {
          const { setTableData, orinData, tabKey } = editContextData
          setEditContextData({
            ...editContextData,
            isDirty: false,
            tempData: {
              ...editContextData.tempData,
              [tabKey as keyof AdvancedSettingContext]: orinData
            }
          })
          setTableData(orinData)
          if (callback) callback()
        }
      }, {
        text: 'Save Changes',
        type: 'primary',
        key: 'save',
        closeAfterAction: true,
        handler: async () => {
          if (editContextData?.updateChanges) editContextData?.updateChanges()
          if (callback) callback()
        }
      }]
    }
  })  
}