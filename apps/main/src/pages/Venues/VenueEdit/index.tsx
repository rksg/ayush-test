import { createContext, useState } from 'react'

import { IntlShape } from 'react-intl'

import { showActionModal, CustomButtonProps } from '@acx-ui/components'
import { VenueLed }                           from '@acx-ui/rc/utils'
import { useParams }                          from '@acx-ui/react-router-dom'
import { getIntl }                            from '@acx-ui/utils'

import { SwitchConfigTab }          from './SwitchConfigTab'
import { VenueDetailsTab }          from './VenueDetailsTab'
import VenueEditPageHeader          from './VenueEditPageHeader'
import { WifiConfigTab }            from './WifiConfigTab'
import { NetworkingSettingContext } from './WifiConfigTab/NetworkingTab'

const tabs = {
  details: VenueDetailsTab,
  wifi: WifiConfigTab,
  switch: SwitchConfigTab
}

export interface AdvancedSettingContext {
  tabTitle: string,
  tabKey?: string,
  isDirty: boolean,
  hasError?: boolean,
  oldData?: VenueLed[],
  newData?: VenueLed[],
  updateChanges: (() => void),
  setData?: (data: VenueLed[]) => void,
  tempData?: {
    settings?: VenueLed[]
  }
}

export const VenueEditContext = createContext({} as {
  editContextData: AdvancedSettingContext,
  setEditContextData: (data: AdvancedSettingContext) => void,

  editNetworkingContextData: NetworkingSettingContext,
  setEditNetworkingContextData: (data: NetworkingSettingContext) => void
})

export function VenueEdit () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  const [editContextData, setEditContextData] = useState({} as AdvancedSettingContext)
  const [
    editNetworkingContextData, setEditNetworkingContextData
  ] = useState({} as NetworkingSettingContext)

  return (
    <VenueEditContext.Provider value={{
      editContextData,
      setEditContextData,
      editNetworkingContextData,
      setEditNetworkingContextData
    }}>
      <VenueEditPageHeader />
      { Tab && <Tab /> }
    </VenueEditContext.Provider>
  )
}

export function showUnsavedModal (
  editContextData: AdvancedSettingContext,
  setEditContextData: (data: AdvancedSettingContext) => void,
  editNetworkingContextData: NetworkingSettingContext,
  intl: IntlShape,
  callback?: () => void
) {
  const { $t } = getIntl()
  const title = editContextData?.tabTitle ?? ''
  const hasError = editContextData?.hasError ?? false
  const btns = [{
    text: $t({ defaultMessage: 'Cancel' }),
    key: 'close',
    closeAfterAction: true,
    handler () {
      setEditContextData({
        ...editContextData,
        isDirty: true
      })
    }
  }, {
    text: $t({ defaultMessage: 'Discard Changes' }),
    key: 'discard',
    closeAfterAction: true,
    handler: async () => {
      const { setData, oldData, tabKey } = editContextData
      setEditContextData({
        ...editContextData,
        isDirty: false,
        tempData: {
          ...editContextData.tempData,
          [tabKey as keyof AdvancedSettingContext]: oldData
        }
      })
      setData && oldData && setData(oldData)
      callback?.()
    }
  }, {
    text: $t({ defaultMessage: 'Save Changes' }),
    type: 'primary',
    key: 'save',
    closeAfterAction: true,
    handler: async () => {
      if(editContextData?.tabTitle === 'Advanced Settings'){
        if(editContextData?.updateChanges){
          editContextData?.updateChanges?.()
        }
      }else if(editContextData?.tabTitle === 'Networking'){
        if(editNetworkingContextData?.updateCellular){
          editNetworkingContextData?.updateCellular?.()
        }
        if(editNetworkingContextData?.updateMesh){
          editNetworkingContextData?.updateMesh?.(editNetworkingContextData.meshData.mesh)
        }
      }
      callback?.()
    }
  }]

  showActionModal({
    type: 'confirm',
    width: 450,
    title: hasError
      ? $t({ defaultMessage: 'You Have Invalid Changes' })
      : $t({ defaultMessage: 'You Have Unsaved Changes' }),
    content: hasError
      ? $t({ defaultMessage: 'Do you want to discard your changes in "{title}"?' }, { title })
      : $t({
        defaultMessage: 'Do you want to save your changes in "{title}", or discard all changes?'
      }, { title }),
    customContent: {
      action: 'CUSTOM_BUTTONS',
      buttons: (hasError ? btns.slice(0, 2) : btns) as CustomButtonProps[]
    }
  })
}