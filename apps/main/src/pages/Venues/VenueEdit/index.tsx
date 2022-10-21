import { createContext, useState } from 'react'

import { IntlShape } from 'react-intl'

import { showActionModal, CustomButtonProps } from '@acx-ui/components'
import { VenueLed, VenueSwitchConfiguration } from '@acx-ui/rc/utils'
import { useParams }                          from '@acx-ui/react-router-dom'
import { getIntl }                            from '@acx-ui/utils'

import { SwitchConfigTab }          from './SwitchConfigTab'
import { VenueDetailsTab }          from './VenueDetailsTab'
import VenueEditPageHeader          from './VenueEditPageHeader'
import { WifiConfigTab }            from './WifiConfigTab'
import { NetworkingSettingContext } from './WifiConfigTab/NetworkingTab'
import { SecuritySettingContext }   from './WifiConfigTab/SecurityTab'

const tabs = {
  details: VenueDetailsTab,
  wifi: WifiConfigTab,
  switch: SwitchConfigTab
}

export interface EditContext {
  tabTitle: string,
  tabKey?: string,
  unsavedTabKey?: string,
  isDirty: boolean,
  hasError?: boolean,
  oldData: unknown,
  newData: unknown,
  updateChanges: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData: (data: any) => void,
  tempData?: {
    settings?: VenueLed[],
    general?: VenueSwitchConfiguration
  }
}

export const VenueEditContext = createContext({} as {
  editContextData: EditContext,
  setEditContextData: (data: EditContext) => void

  editNetworkingContextData: NetworkingSettingContext,
  setEditNetworkingContextData: (data: NetworkingSettingContext) => void

  editSecurityContextData: SecuritySettingContext,
  setEditSecurityContextData: (data: SecuritySettingContext) => void
})

export function VenueEdit () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  const [editContextData, setEditContextData] = useState({} as EditContext)
  const [
    editNetworkingContextData, setEditNetworkingContextData
  ] = useState({} as NetworkingSettingContext)
  const [
    editSecurityContextData, setEditSecurityContextData
  ] = useState({} as SecuritySettingContext)

  return (
    <VenueEditContext.Provider value={{
      editContextData,
      setEditContextData,
      editNetworkingContextData,
      setEditNetworkingContextData,
      editSecurityContextData,
      setEditSecurityContextData
    }}>
      <VenueEditPageHeader />
      { Tab && <Tab /> }
    </VenueEditContext.Provider>
  )
}

function processWifiTab (
  editContextData: EditContext,
  editNetworkingContextData: NetworkingSettingContext,
  editSecurityContextData: SecuritySettingContext
){
  switch(editContextData?.unsavedTabKey){
    case 'settings':
      editContextData?.updateChanges?.()
      break
    case 'networking':
      editNetworkingContextData?.updateCellular?.()
      editNetworkingContextData?.updateLanPorts?.()
      editNetworkingContextData?.updateMesh?.(editNetworkingContextData.meshData.mesh)
      break
    case 'security':
      editSecurityContextData?.updateSecurity?.(editSecurityContextData.SecurityData)
      break
  }
}

export function showUnsavedModal (
  editContextData: EditContext,
  setEditContextData: (data: EditContext) => void,
  editNetworkingContextData: NetworkingSettingContext,
  editSecurityContextData: SecuritySettingContext,
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
      if(editContextData?.unsavedTabKey === 'networking'){
        editNetworkingContextData?.discardLanPorts?.()
        setEditContextData({
          ...editContextData,
          isDirty: false,
          hasError: false
        })
      } else {
        setEditContextData({
          ...editContextData,
          isDirty: false,
          newData: undefined,
          oldData: undefined,
          tempData: {
            ...editContextData.tempData,
            [tabKey as keyof EditContext]: oldData
          }
        })
        setData && oldData && setData(oldData)
      }
      callback?.()
    }
  }, {
    text: $t({ defaultMessage: 'Save Changes' }),
    type: 'primary',
    key: 'save',
    closeAfterAction: true,
    handler: async () => {
      const wifiTab = ['radio', 'networking', 'security', 'services', 'settings']

      if(wifiTab.includes(editContextData?.unsavedTabKey as string)){
        processWifiTab(editContextData, editNetworkingContextData, editSecurityContextData)
      }else{
        editContextData?.updateChanges?.()
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