import { createContext, useEffect, useState } from 'react'

import { showActionModal, CustomButtonProps }       from '@acx-ui/components'
import { useGetApCapabilitiesQuery, useGetApQuery } from '@acx-ui/rc/services'
import { ApDeep, ApModel }                          from '@acx-ui/rc/utils'
import { useParams }                                from '@acx-ui/react-router-dom'
import { getIntl }                                  from '@acx-ui/utils'


import { AdvancedTab, ApAdvancedContext }             from './AdvancedTab'
import ApEditPageHeader                               from './ApEditPageHeader'
import { GeneralTab }                                 from './GeneralTab'
import { ApNetworkControlContext, NetworkControlTab } from './NetworkControlTab'
import { ApNetworkingContext, NetworkingTab }         from './NetworkingTab'
import { ApRadioContext, RadioTab }                   from './RadioTab'

const tabs = {
  general: GeneralTab,
  radio: RadioTab,
  networking: NetworkingTab,
  networkControl: NetworkControlTab,
  advanced: AdvancedTab
}

export const ApDataContext = createContext({} as {
  apData?: ApDeep,
  apCapabilities?: ApModel
})

export interface ApEditContextType {
  tabTitle: string
  unsavedTabKey?: string
  isDirty: boolean
  hasError?: boolean
  updateChanges?: (data?: unknown) => void | Promise<void>
  discardChanges?: (data?: unknown) => void | Promise<void>
}

export interface ApEditContextProps {
  editContextData: ApEditContextType
  setEditContextData:(data: ApEditContextType) => void
  editRadioContextData: ApRadioContext
  setEditRadioContextData: (data: ApRadioContext) => void
  editNetworkingContextData: ApNetworkingContext,
  setEditNetworkingContextData: (data: ApNetworkingContext) => void
  editNetworkControlContextData: ApNetworkControlContext
  setEditNetworkControlContextData: (data: ApNetworkControlContext) => void
  editAdvanecdControlContextData: ApAdvancedContext
  setEditAdvanecdControlContextData: (data: ApAdvancedContext) => void
}

export interface ApEditContextExtendedProps extends ApEditContextProps {
  previousPath: string
  setPreviousPath: (data: string) => void
  isOnlyOneTab: boolean
  setIsOnlyOneTab: (data: boolean) => void
}

export const ApEditContext = createContext({} as ApEditContextExtendedProps)

export function ApEdit () {
  const params = useParams()
  const { activeTab } = params
  const Tab = tabs[activeTab as keyof typeof tabs]

  const [previousPath, setPreviousPath] = useState('')
  const [isOnlyOneTab, setIsOnlyOneTab] = useState(false)
  const [editContextData, setEditContextData] = useState({} as ApEditContextType)
  const [editRadioContextData, setEditRadioContextData] = useState({} as ApRadioContext)
  const [editNetworkingContextData, setEditNetworkingContextData]
      = useState({} as ApNetworkingContext)
  const [editNetworkControlContextData, setEditNetworkControlContextData]
      = useState({} as ApNetworkControlContext)
  const [editAdvanecdControlContextData, setEditAdvanecdControlContextData]
      = useState({} as ApAdvancedContext)

  const [apData, setApData] = useState<ApDeep>()
  const [apCapabilities, setApCapabilities] = useState<ApModel>()
  const [isLoaded, setIsLoaded] = useState(false)

  const getAp = useGetApQuery({ params })
  const getApCapabilities = useGetApCapabilitiesQuery({ params }, { skip: isLoaded })

  useEffect(() => {
    const data = getAp?.data
    const modelName = data?.model
    const capabilities = getApCapabilities.data

    if (modelName && capabilities) {
      const setData = async () => {
        const curApCapabilities = capabilities.apModels.find(cap => cap.model === modelName)

        setApData(data)
        setApCapabilities(curApCapabilities)

        setIsLoaded(true)
      }

      setData()
    }

  }, [getAp?.data?.venueId, getApCapabilities?.data])

  return <ApEditContext.Provider value={{
    editContextData,
    setEditContextData,
    previousPath,
    setPreviousPath,
    isOnlyOneTab,
    setIsOnlyOneTab,
    editRadioContextData,
    setEditRadioContextData,
    editNetworkingContextData,
    setEditNetworkingContextData,
    editNetworkControlContextData,
    setEditNetworkControlContextData,
    editAdvanecdControlContextData,
    setEditAdvanecdControlContextData
  }}>
    <ApEditPageHeader />
    { Tab &&
    <ApDataContext.Provider value={{ apData, apCapabilities }}>
      <Tab />
    </ApDataContext.Provider>
    }
  </ApEditContext.Provider>
}

interface apEditSettingsProps {
  editContextData: ApEditContextType
  editRadioContextData: ApRadioContext
  editNetworkingContextData: ApNetworkingContext
  editNetworkControlContextData: ApNetworkControlContext
  editAdvanecdControlContextData: ApAdvancedContext
}

const processApEditSettings = (props: apEditSettingsProps) => {
  const { editContextData,
    editRadioContextData,
    editNetworkingContextData,
    editNetworkControlContextData,
    editAdvanecdControlContextData
  } = props

  switch(editContextData?.unsavedTabKey){
    case 'radio':
      editRadioContextData.updateWifiRadio?.()
      editRadioContextData.updateExternalAntenna?.()
      break
    case 'networking':
      editNetworkingContextData.updateIpSettings?.()
      editNetworkingContextData.updateLanPorts?.()
      editNetworkingContextData.updateMesh?.()
      editNetworkingContextData.updateDirectedMulticast?.()
      break
    case 'networkControl':
      editNetworkControlContextData.updateMdnsProxy?.()
      editNetworkControlContextData.updateApSnmp?.()
      break
    case 'advanced':
      editAdvanecdControlContextData.updateApLed?.()
      editAdvanecdControlContextData.updateBssColoring?.()
      break
    default: // General
      editContextData?.updateChanges?.()
      break
  }
}

const discardApEditSettings = (props: apEditSettingsProps) => {
  const { editContextData,
    editRadioContextData,
    editNetworkingContextData,
    editNetworkControlContextData,
    editAdvanecdControlContextData
  } = props

  switch(editContextData?.unsavedTabKey){
    case 'radio':
      editRadioContextData.discardWifiRadioChanges?.()
      editRadioContextData.discardExternalAntennaChanges?.()
      break
    case 'networking':
      editNetworkingContextData.discardIpSettingsChanges?.()
      editNetworkingContextData.discardLanPortsChanges?.()
      editNetworkingContextData.discardMeshChanges?.()
      editNetworkingContextData.discardDirectedMulticastChanges?.()
      break
    case 'networkControl':
      editNetworkControlContextData.discardMdnsProxyChanges?.()
      editNetworkControlContextData.discardApSnmpChanges?.()
      break
    case 'advanced':
      editAdvanecdControlContextData.discardApLedChanges?.()
      editAdvanecdControlContextData.discardBssColoringChanges?.()
      break
    default: // General
      editContextData?.discardChanges?.()
      break
  }
}


const resetApEditContextData = (props: ApEditContextProps) => {
  const { editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData,
    editNetworkingContextData,
    setEditNetworkingContextData,
    editNetworkControlContextData,
    setEditNetworkControlContextData,
    editAdvanecdControlContextData,
    setEditAdvanecdControlContextData
  } = props

  const newEditContextData = {
    ...editContextData,
    isDirty: false,
    hasError: false
  }
  delete newEditContextData.updateChanges
  delete newEditContextData.discardChanges

  setEditContextData(newEditContextData)

  switch(editContextData?.unsavedTabKey){
    case 'radio':
      const newRadioContextData = { ...editRadioContextData }
      delete newRadioContextData.updateWifiRadio
      delete newRadioContextData.discardWifiRadioChanges
      delete newRadioContextData.updateExternalAntenna
      delete newRadioContextData.discardWifiRadioChanges

      setEditRadioContextData(newRadioContextData)
      break
    case 'networking':
      const newNetworkingContextData = { ...editNetworkingContextData }
      delete newNetworkingContextData.updateIpSettings
      delete newNetworkingContextData.discardIpSettingsChanges
      delete newNetworkingContextData.updateLanPorts
      delete newNetworkingContextData.discardLanPortsChanges
      delete newNetworkingContextData.updateMesh
      delete newNetworkingContextData.discardMeshChanges
      delete newNetworkingContextData.updateDirectedMulticast
      delete newNetworkingContextData.discardDirectedMulticastChanges

      setEditNetworkingContextData(newNetworkingContextData)
      break
    case 'networkControl':
      const newNetworkControlContextData = { ...editNetworkControlContextData }
      delete newNetworkControlContextData.updateMdnsProxy
      delete newNetworkControlContextData.discardMdnsProxyChanges
      delete newNetworkControlContextData.updateApSnmp
      delete newNetworkControlContextData.discardApSnmpChanges

      setEditNetworkControlContextData(newNetworkControlContextData)
      break
    case 'advanced':
      const newAdvanecdControlContextData = { ...editAdvanecdControlContextData }
      delete newAdvanecdControlContextData.updateApLed
      delete newAdvanecdControlContextData.discardApLedChanges
      delete newAdvanecdControlContextData.updateBssColoring
      delete newAdvanecdControlContextData.discardBssColoringChanges

      setEditAdvanecdControlContextData(newAdvanecdControlContextData)
      break
  }
}

export function showUnsavedModal (
  editContextData: ApEditContextType,
  setEditContextData: (data: ApEditContextType) => void,
  editRadioContextData: ApRadioContext,
  setEditRadioContextData: (data: ApRadioContext) => void,
  editNetworkingContextData: ApNetworkingContext,
  setEditNetworkingContextData: (data: ApNetworkingContext) => void,
  editNetworkControlContextData: ApNetworkControlContext,
  setEditNetworkControlContextData: (data: ApNetworkControlContext) => void,
  editAdvanecdControlContextData: ApAdvancedContext,
  setEditAdvanecdControlContextData: (data: ApAdvancedContext) => void,
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
      discardApEditSettings({
        editContextData,
        editRadioContextData,
        editNetworkingContextData,
        editNetworkControlContextData,
        editAdvanecdControlContextData
      })

      resetApEditContextData({
        editContextData,
        setEditContextData,
        editRadioContextData,
        setEditRadioContextData,
        editNetworkingContextData,
        setEditNetworkingContextData,
        editNetworkControlContextData,
        setEditNetworkControlContextData,
        editAdvanecdControlContextData,
        setEditAdvanecdControlContextData
      })

      callback?.()
    }
  }, {
    text: $t({ defaultMessage: 'Save Changes' }),
    type: 'primary',
    key: 'save',
    closeAfterAction: true,
    handler: async () => {
      processApEditSettings({
        editContextData,
        editRadioContextData,
        editNetworkingContextData,
        editNetworkControlContextData,
        editAdvanecdControlContextData
      })

      resetApEditContextData({
        editContextData,
        setEditContextData,
        editRadioContextData,
        setEditRadioContextData,
        editNetworkingContextData,
        setEditNetworkingContextData,
        editNetworkControlContextData,
        setEditNetworkControlContextData,
        editAdvanecdControlContextData,
        setEditAdvanecdControlContextData
      })

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
