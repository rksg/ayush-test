import { createContext, useEffect, useState } from 'react'

import { CustomButtonProps, Loader, showActionModal }           from '@acx-ui/components'
import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { useApViewModelQuery, useGetApQuery, useGetVenueQuery } from '@acx-ui/rc/services'
import { ApDeep,
  ApViewModel,
  CapabilitiesApModel,
  VenueExtended
} from '@acx-ui/rc/utils'
import { useParams }    from '@acx-ui/react-router-dom'
import { goToNotFound } from '@acx-ui/user'
import { getIntl }      from '@acx-ui/utils'

import { useGetApCapabilities } from '../hooks'

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

export type ApEditItemProps = {
  isAllowEdit?: boolean
}

export const ApDataContext = createContext({} as {
  apData?: ApDeep,
  apCapabilities?: CapabilitiesApModel,
  venueData?: VenueExtended
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
  editAdvancedContextData: ApAdvancedContext
  setEditAdvancedContextData: (data: ApAdvancedContext) => void
}

export interface ApEditContextExtendedProps extends ApEditContextProps {
  previousPath: string
  setPreviousPath: (data: string) => void
  isOnlyOneTab: boolean
  setIsOnlyOneTab: (data: boolean) => void
  apViewContextData: ApViewModel
  setApViewContextData: (data: ApViewModel) => void
}

export const ApEditContext = createContext({} as ApEditContextExtendedProps)

const apViewModelRbacPayloadFields = [
  'name', 'venueId', 'venueName', 'apGroupName', 'description', 'lastSeenTime',
  'serialNumber', 'macAddress', 'networkStatus', 'model', 'firmwareVersion',
  'meshRole', 'hops', 'apUpRssi', 'status', 'statusSeverity',
  'meshEnabled', 'lastUpdatedTime', 'deviceModelType',
  'uplink', 'uptime', 'tags', 'radioStatuses', 'lanPortStatuses', 'afcStatus', 'cellularStatus']

const apViewModelPayloadFields = [
  'name', 'venueName', 'deviceGroupName', 'description', 'lastSeenTime',
  'serialNumber', 'apMac', 'IP', 'extIp', 'model', 'fwVersion',
  'meshRole', 'hops', 'apUpRssi', 'deviceStatus', 'deviceStatusSeverity',
  'isMeshEnable', 'lastUpdTime', 'deviceModelType', 'apStatusData.APSystem.uptime',
  'venueId', 'uplink', 'apStatusData', 'apStatusData.cellularInfo', 'tags',
  'apStatusData.afcInfo.powerMode', 'apStatusData.afcInfo.afcStatus','apRadioDeploy']

export function ApEdit () {
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const { serialNumber, activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound

  const [previousPath, setPreviousPath] = useState('')
  const [isOnlyOneTab, setIsOnlyOneTab] = useState(false)
  const [editContextData, setEditContextData] = useState({} as ApEditContextType)
  const [editRadioContextData, setEditRadioContextData] = useState({} as ApRadioContext)
  const [editNetworkingContextData, setEditNetworkingContextData]
      = useState({} as ApNetworkingContext)
  const [editNetworkControlContextData, setEditNetworkControlContextData]
      = useState({} as ApNetworkControlContext)
  const [editAdvancedContextData, setEditAdvancedContextData]
      = useState({} as ApAdvancedContext)
  const [apViewContextData, setApViewContextData] = useState({} as ApViewModel)

  const [apData, setApData] = useState<ApDeep>()
  const [apCapabilities, setApCapabilities] = useState<CapabilitiesApModel>()
  const [isLoaded, setIsLoaded] = useState(false)

  const apViewModelPayload = {
    fields: isUseWifiRbacApi ? apViewModelRbacPayloadFields : apViewModelPayloadFields,
    filters: { serialNumber: [serialNumber] }
  }
  const { data: apViewmodel } = useApViewModelQuery({
    payload: apViewModelPayload,
    enableRbac: isUseWifiRbacApi
  })

  const { data: getedApData, isLoading: isGetApLoading } = useGetApQuery({
    params: { serialNumber, venueId: apViewmodel?.venueId },
    enableRbac: isUseWifiRbacApi
  }, { skip: isUseWifiRbacApi && !apViewmodel?.venueId })

  // venueId is not exist in RBAC version AP data
  const targetVenueId = isUseWifiRbacApi ? apViewmodel?.venueId : getedApData?.venueId

  const params = {
    venueId: targetVenueId,
    serialNumber
  }

  const { data: capabilities, isLoading: isGetApCapsLoading } = useGetApCapabilities({
    params,
    modelName: getedApData?.model,
    skip: isLoaded,
    enableRbac: isUseWifiRbacApi
  })

  // fetch venueName
  const {
    data: venueData
  } = useGetVenueQuery({
    params: {
      venueId: targetVenueId
    } }, { skip: !targetVenueId } )

  useEffect(() => {
    if (!isGetApLoading && !isGetApCapsLoading) {
      const modelName = getedApData?.model
      if (modelName && capabilities) {
        setApData(getedApData)
        setApCapabilities(capabilities)

        setIsLoaded(true)
      }
    }
  // eslint-disable-next-line max-len
  }, [isGetApLoading, getedApData?.venueId, isGetApCapsLoading, capabilities])

  useEffect(() => {
    if (apViewmodel) {
      setIsOnlyOneTab(!apViewmodel?.model)
      setApViewContextData(apViewmodel)
    }

  }, [apViewmodel])

  // need to wait venueData ready, venueData.id is using inside all tabs.
  const isLoading = !venueData

  return <ApDataContext.Provider value={{ apData, apCapabilities, venueData }}>
    <ApEditContext.Provider value={{
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
      editAdvancedContextData,
      setEditAdvancedContextData,
      apViewContextData,
      setApViewContextData
    }}>
      <Loader states={[{ isLoading }]}>
        <ApEditPageHeader />
        { Tab && <Tab />}
      </Loader>
    </ApEditContext.Provider>
  </ApDataContext.Provider>
}

interface ApEditSettingsProps {
  editContextData: ApEditContextType
  editRadioContextData: ApRadioContext
  editNetworkingContextData: ApNetworkingContext
  editNetworkControlContextData: ApNetworkControlContext
  editAdvancedContextData: ApAdvancedContext
}

const processApEditSettings = (props: ApEditSettingsProps) => {
  const { editContextData,
    editRadioContextData,
    editNetworkingContextData,
    editNetworkControlContextData,
    editAdvancedContextData
  } = props

  switch(editContextData?.unsavedTabKey){
    case 'radio':
      editRadioContextData.updateWifiRadio?.()
      editRadioContextData.updateClientAdmissionControl?.()
      editRadioContextData.updateExternalAntenna?.()
      editRadioContextData.updateApAntennaType?.()
      editRadioContextData.updateClientSteering?.()
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
      editAdvancedContextData.updateApLed?.()
      editAdvancedContextData.updateApUsb?.()
      editAdvancedContextData.updateBssColoring?.()
      editAdvancedContextData.updateApManagementVlan?.()
      break
    default: // General
      editContextData?.updateChanges?.()
      break
  }
}

const discardApEditSettings = (props: ApEditSettingsProps) => {
  const { editContextData,
    editRadioContextData,
    editNetworkingContextData,
    editNetworkControlContextData,
    editAdvancedContextData
  } = props

  switch(editContextData?.unsavedTabKey){
    case 'radio':
      editRadioContextData.discardWifiRadioChanges?.()
      editRadioContextData.discardClientAdmissionControlChanges?.()
      editRadioContextData.discardExternalAntennaChanges?.()
      editRadioContextData.discardApAntennaTypeChanges?.()
      editRadioContextData.discardClientSteeringChanges?.()
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
      editAdvancedContextData.discardApLedChanges?.()
      editAdvancedContextData.discardApUsbChanges?.()
      editAdvancedContextData.discardBssColoringChanges?.()
      editAdvancedContextData.discardApManagementVlan?.()
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
    editAdvancedContextData,
    setEditAdvancedContextData
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
      delete newRadioContextData.updateClientAdmissionControl
      delete newRadioContextData.discardClientAdmissionControlChanges
      delete newRadioContextData.updateExternalAntenna
      delete newRadioContextData.updateApAntennaType
      delete newRadioContextData.discardWifiRadioChanges
      delete newRadioContextData.updateClientSteering
      delete newRadioContextData.discardClientSteeringChanges

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
      const newAdvancedContextData = { ...editAdvancedContextData }
      delete newAdvancedContextData.updateApLed
      delete newAdvancedContextData.discardApLedChanges
      delete newAdvancedContextData.updateApUsb
      delete newAdvancedContextData.discardApUsbChanges
      delete newAdvancedContextData.updateBssColoring
      delete newAdvancedContextData.discardBssColoringChanges
      delete newAdvancedContextData.updateApManagementVlan
      delete newAdvancedContextData.discardApManagementVlan

      setEditAdvancedContextData(newAdvancedContextData)
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
  editAdvancedContextData: ApAdvancedContext,
  setEditAdvancedContextData: (data: ApAdvancedContext) => void,
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
        editAdvancedContextData
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
        editAdvancedContextData,
        setEditAdvancedContextData
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
        editAdvancedContextData
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
        editAdvancedContextData,
        setEditAdvancedContextData
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
