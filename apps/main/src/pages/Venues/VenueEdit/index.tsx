import { createContext, useState } from 'react'

import { IntlShape } from 'react-intl'

import { showActionModal, CustomButtonProps } from '@acx-ui/components'
import { VenueLed,
  VenueSwitchConfiguration,
  ExternalAntenna,
  VenueRadioCustomization } from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

import { PropertyManagementTab }    from './PropertyManagementTab'
import { SwitchConfigTab }          from './SwitchConfigTab'
import { VenueDetailsTab }          from './VenueDetailsTab'
import VenueEditPageHeader          from './VenueEditPageHeader'
import { WifiConfigTab }            from './WifiConfigTab'
import { NetworkingSettingContext } from './WifiConfigTab/NetworkingTab'
import { SecuritySettingContext }   from './WifiConfigTab/SecurityTab'
import { ServerSettingContext }     from './WifiConfigTab/ServerTab'

const tabs = {
  details: VenueDetailsTab,
  wifi: WifiConfigTab,
  switch: SwitchConfigTab,
  property: PropertyManagementTab
}

export interface EditContext {
  tabTitle: string,
  tabKey?: string,
  unsavedTabKey?: string,
  isDirty: boolean,
  hasError?: boolean,
  oldData: unknown,
  newData: unknown,
  previousPath?: string,
  updateChanges: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData: (data: any) => void,
  tempData?: {
    settings?: VenueLed[],
    general?: VenueSwitchConfiguration
  }
}

export interface RadioContext {
  apiApModels?: { [index: string]: ExternalAntenna }
  apModels?: { [index: string]: ExternalAntenna }
  updateExternalAntenna?: ((data: ExternalAntenna[]) => void)

  radioData?: VenueRadioCustomization,
  updateWifiRadio?: ((data: VenueRadioCustomization) => void)

  isLoadBalancingDataChanged?: boolean,
  updateLoadBalancing?: (() => void)

  isClientAdmissionControlDataChanged?: boolean,
  updateClientAdmissionControl?: (() => void)
}

export const VenueEditContext = createContext({} as {
  editContextData: EditContext,
  setEditContextData: (data: EditContext) => void

  editNetworkingContextData: NetworkingSettingContext,
  setEditNetworkingContextData: (data: NetworkingSettingContext) => void

  editRadioContextData: RadioContext,
  setEditRadioContextData: (data: RadioContext) => void

  editSecurityContextData: SecuritySettingContext,
  setEditSecurityContextData: (data: SecuritySettingContext) => void

  editServerContextData: ServerSettingContext,
  setEditServerContextData: (data: ServerSettingContext) => void
  previousPath: string
  setPreviousPath: (data: string) => void
})

export function VenueEdit () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  const [previousPath, setPreviousPath] = useState('')
  const [editContextData, setEditContextData] = useState({} as EditContext)
  const [
    editNetworkingContextData, setEditNetworkingContextData
  ] = useState({} as NetworkingSettingContext)
  const [
    editSecurityContextData, setEditSecurityContextData
  ] = useState({} as SecuritySettingContext)
  const [
    editServerContextData, setEditServerContextData
  ] = useState({} as ServerSettingContext)

  const [
    editRadioContextData, setEditRadioContextData
  ] = useState({} as RadioContext)

  return (
    <VenueEditContext.Provider value={{
      editContextData,
      setEditContextData,
      editNetworkingContextData,
      setEditNetworkingContextData,
      editRadioContextData,
      setEditRadioContextData,
      editSecurityContextData,
      setEditSecurityContextData,
      editServerContextData,
      setEditServerContextData,
      previousPath,
      setPreviousPath
    }}>
      <VenueEditPageHeader />
      { Tab && <Tab /> }
    </VenueEditContext.Provider>
  )
}

export function getExternalAntennaPayload (apModels: { [index: string]: ExternalAntenna }) {
  function cleanExtModel (model: ExternalAntenna) {
    let data = JSON.parse(JSON.stringify(model))

    if (data.enable24G !== undefined && data.enable24G === false) {
      delete data.gain24G
    }
    if (data.enable50G !== undefined && data.enable50G === false) {
      delete data.gain50G
    }
    return data
  }
  const extPayload = [] as ExternalAntenna[]
  Object.keys(apModels).forEach(key => {
    const model = cleanExtModel(apModels[key] as ExternalAntenna)
    extPayload.push(model)
  })
  return extPayload
}

function processWifiTab (
  editContextData: EditContext,
  editNetworkingContextData: NetworkingSettingContext,
  editSecurityContextData: SecuritySettingContext,
  editServerContextData: ServerSettingContext,
  editRadioContextData: RadioContext
){
  switch(editContextData?.unsavedTabKey){
    case 'settings':
      editContextData?.updateChanges?.()
      break
    case 'networking':
      editNetworkingContextData?.updateCellular?.(editNetworkingContextData.cellularData)
      editNetworkingContextData?.updateLanPorts?.()
      editNetworkingContextData?.updateMesh?.()
      editNetworkingContextData?.updateDirectedMulticast?.()
      editNetworkingContextData?.updateRadiusOptions?.()
      break
    case 'radio':
      if (editRadioContextData.apModels) {
        const extPayload = getExternalAntennaPayload(editRadioContextData.apModels)
        editRadioContextData?.updateExternalAntenna?.(extPayload)
      }

      editRadioContextData?.updateWifiRadio?.
      (editRadioContextData.radioData as VenueRadioCustomization)

      if (editRadioContextData.isLoadBalancingDataChanged) {
        editRadioContextData?.updateLoadBalancing?.()
      }

      break
    case 'security':
      editSecurityContextData?.updateSecurity?.(editSecurityContextData.SecurityData)
      break
    case 'servers':
      editServerContextData?.updateSyslog?.()
      editServerContextData?.updateMdnsFencing?.()
      editServerContextData?.updateVenueApSnmp?.()
      break
  }
}

export function showUnsavedModal (
  editContextData: EditContext,
  setEditContextData: (data: EditContext) => void,
  editNetworkingContextData: NetworkingSettingContext,
  editRadioContextData: RadioContext,
  editSecurityContextData: SecuritySettingContext,
  editServerContextData: ServerSettingContext,
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
      } else if(editContextData?.unsavedTabKey === 'servers'){
        editServerContextData?.discardSyslog?.()
        editServerContextData?.discardMdnsFencing?.()
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
      const wifiTab = ['radio', 'networking', 'security', 'servers', 'settings']

      if(wifiTab.includes(editContextData?.unsavedTabKey as string)){
        processWifiTab(
          editContextData,
          editNetworkingContextData,
          editSecurityContextData,
          editServerContextData,
          editRadioContextData
        )
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
