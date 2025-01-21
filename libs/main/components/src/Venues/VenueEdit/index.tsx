import { createContext, useEffect, useState } from 'react'

import { isEmpty }   from 'lodash'
import { IntlShape } from 'react-intl'

import { showActionModal, CustomButtonProps, StepsFormLegacy } from '@acx-ui/components'
import { VenueLed,
  VenueSwitchConfiguration,
  ExternalAntenna,
  VenueRadioCustomization,
  VeuneApAntennaTypeSettings,
  CommonUrlsInfo } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum, SwitchScopes, WifiScopes }   from '@acx-ui/types'
import {
  getUserProfile,
  hasAllowedOperations,
  hasPermission,
  hasRoles }               from '@acx-ui/user'
import { getIntl, getOpsApi } from '@acx-ui/utils'

import { PropertyManagementTab }        from './PropertyManagementTab'
import { SwitchConfigTab }              from './SwitchConfigTab'
import { VenueDetailsTab }              from './VenueDetailsTab'
import VenueEditPageHeader              from './VenueEditPageHeader'
import { usePropertyManagementEnabled } from './VenueEditTabs'
import { WifiConfigTab }                from './WifiConfigTab'
import { AdvanceSettingContext }        from './WifiConfigTab/AdvancedTab'
import { NetworkingSettingContext }     from './WifiConfigTab/NetworkingTab'
import { SecuritySettingContext }       from './WifiConfigTab/SecurityTab'
import { ServerSettingContext }         from './WifiConfigTab/ServerTab'


const tabs = {
  details: VenueDetailsTab,
  wifi: WifiConfigTab,
  switch: SwitchConfigTab,
  property: PropertyManagementTab
}

export type VenueWifiConfigItemProps = {
  isAllowEdit?: boolean,
  isAllowAdd?: boolean
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
  apModelAntennaTypes?: { [index: string]: VeuneApAntennaTypeSettings }
  updateAntennaType?: ((data: VeuneApAntennaTypeSettings[]) => void)

  radioData?: VenueRadioCustomization,
  updateWifiRadio?: ((data: VenueRadioCustomization) => void)
  discardWifiRadioChanges?: (data?: unknown) => void | Promise<void>

  isLoadBalancingDataChanged?: boolean,
  updateLoadBalancing?: ((callback?: () => void) => void)

  isClientAdmissionControlDataChanged?: boolean,
  updateClientAdmissionControl?: ((callback?: () => void) => void)
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

  editAdvancedContextData: AdvanceSettingContext,
  setEditAdvancedContextData: (data: AdvanceSettingContext) => void

  previousPath: string
  setPreviousPath: (data: string) => void
})

export function VenueEdit () {
  const navigate = useNavigate()
  const basePath = useTenantLink('')

  const { rbacOpsApiEnabled } = getUserProfile()
  const { activeTab } = useParams()
  const enablePropertyManagement = usePropertyManagementEnabled()

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

  const [
    editAdvancedContextData, setEditAdvancedContextData
  ] = useState({} as AdvanceSettingContext)

  const hasDetailsPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([getOpsApi(CommonUrlsInfo.updateVenue)]) :
    hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  useEffect(() => {
    const notFound = { ...basePath, pathname: `${basePath.pathname}/not-found` }
    const notPermissions = { ...basePath, pathname: `${basePath.pathname}/no-permissions` }
    if (!activeTab) {
      const navigateTo =
      hasDetailsPermission ? 'details' :
        hasPermission({ scopes: [WifiScopes.UPDATE] }) ? 'wifi' :
          hasPermission({ scopes: [SwitchScopes.UPDATE] }) ? 'switch' :
            enablePropertyManagement ? 'property' : notFound
      navigate(navigateTo, { replace: true })
      return
    }

    if (!tabs[activeTab as keyof typeof tabs]) { // goToNotFound
      navigate(notFound, { replace: true })
      return
    }

    const hasNoPermissions
    = (!hasPermission({ scopes: [WifiScopes.UPDATE] }) && activeTab === 'wifi')
    || (!hasPermission({ scopes: [SwitchScopes.UPDATE] }) && activeTab === 'switch')
    || (!hasDetailsPermission && activeTab === 'details')
    || (!hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]) && activeTab === 'property')

    if (hasNoPermissions) {
      navigate(notPermissions, { replace: true })
    }
  }, [activeTab, basePath, enablePropertyManagement, navigate])

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
      editAdvancedContextData: editAdvancedContextData,
      setEditAdvancedContextData: setEditAdvancedContextData,
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

// eslint-disable-next-line max-len
export function getAntennaTypePayload (antTypeModels: { [index: string]: VeuneApAntennaTypeSettings }) {
  return isEmpty(antTypeModels)? [] : Object.values(antTypeModels)
}

function processWifiTab (
  editContextData: EditContext,
  editNetworkingContextData: NetworkingSettingContext,
  editSecurityContextData: SecuritySettingContext,
  editServerContextData: ServerSettingContext,
  editRadioContextData: RadioContext,
  editAdvancedContextData: AdvanceSettingContext
){
  switch(editContextData?.unsavedTabKey){
    case 'settings':
      editAdvancedContextData?.updateAccessPointLED?.()
      editAdvancedContextData?.updateAccessPointUSB?.()
      editAdvancedContextData?.updateBssColoring?.()
      editAdvancedContextData?.updateApManagementVlan?.()
      break
    case 'networking':
      editNetworkingContextData?.updateCellular?.(editNetworkingContextData.cellularData)
      editNetworkingContextData?.updateLanPorts?.()
      editNetworkingContextData?.updateMesh?.()
      editNetworkingContextData?.updateDirectedMulticast?.()
      editNetworkingContextData?.updateRadiusOptions?.()
      editNetworkingContextData?.updateRebootTimeout?.()
      editNetworkingContextData?.updateSmartMonitor?.()
      break
    case 'radio':

      const {
        apModels,
        apModelAntennaTypes,
        isLoadBalancingDataChanged,
        isClientAdmissionControlDataChanged
      } = editRadioContextData || {}

      // Antenna
      if (apModels) {
        const extPayload = getExternalAntennaPayload(apModels)
        editRadioContextData?.updateExternalAntenna?.(extPayload)
      }
      if (apModelAntennaTypes) {
        const antennaTypePayload = getAntennaTypePayload(apModelAntennaTypes)
        editRadioContextData?.updateAntennaType?.(antennaTypePayload)
      }

      // radio
      editRadioContextData?.updateWifiRadio?.
      (editRadioContextData.radioData as VenueRadioCustomization)

      if (isLoadBalancingDataChanged) {
        editRadioContextData?.updateLoadBalancing?.()
      }

      if (isClientAdmissionControlDataChanged) {
        editRadioContextData?.updateClientAdmissionControl?.()
      }

      break
    case 'security':
      editSecurityContextData?.updateSecurity?.(editSecurityContextData.SecurityData)
      break
    case 'servers':
      editServerContextData?.updateSyslog?.()
      editServerContextData?.updateMdnsFencing?.()
      editServerContextData?.updateVenueApSnmp?.()
      editServerContextData?.updateVenueIot?.()
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
  editAdvancedContextData: AdvanceSettingContext,
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
      if (editContextData?.unsavedTabKey === 'radio') {
        editRadioContextData?.discardWifiRadioChanges?.()
        setEditContextData({
          ...editContextData,
          isDirty: false,
          hasError: false
        })
      } else if (editContextData?.unsavedTabKey === 'networking') {
        editNetworkingContextData?.discardLanPorts?.()
        setEditContextData({
          ...editContextData,
          isDirty: false,
          hasError: false
        })
      } else if(editContextData?.unsavedTabKey === 'servers'){
        editServerContextData?.discardSyslog?.()
        editServerContextData?.discardVenueLbs?.()
        editServerContextData?.discardMdnsFencing?.()
        editServerContextData?.discardVenueIot?.()
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
          editRadioContextData,
          editAdvancedContextData
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

// eslint-disable-next-line max-len
export function createAnchorSectionItem (title: string, titleId: string, content: JSX.Element, key?: string) {
  return {
    title,
    ...(key ? { key } : {}),
    content: <>
      <StepsFormLegacy.SectionTitle id={titleId}>
        { title }
      </StepsFormLegacy.SectionTitle>
      {content}
    </>
  }
}
