import { createContext, useState } from 'react'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useApGroupsListQuery,
  useGetApGroupApCapabilitiesQuery,
  useGetApGroupsTemplateListQuery,
  useGetVenueQuery
} from '@acx-ui/rc/services'
import {
  ApGroupRadioCustomization,
  ApGroupViewModel, Capabilities,
  TableResult,
  useConfigTemplate,
  useConfigTemplateQueryFnSwitcher, VenueExtended
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export type ApGroupEditContextType = {
  tabTitle: string
  unsavedTabKey?: string
  isDirty: boolean
  hasError?: boolean
  updateChanges?: (data?: unknown) => void | Promise<void>
  discardChanges?: (data?: unknown) => void | Promise<void>
}

export interface ApGroupRadioContext {
  radioData?: ApGroupRadioCustomization,
  updateWifiRadio?: ((data: ApGroupRadioCustomization) => void)
  discardWifiRadioChanges?: (data?: unknown) => void | Promise<void>

  isLoadBalancingDataChanged?: boolean,
  updateLoadBalancing?: ((callback?: () => void) => void)

  isClientAdmissionControlDataChanged?: boolean,
  updateClientAdmissionControl?: ((callback?: () => void) => void)
}

export const ApGroupEditContext = createContext({} as {
  isApGroupTableFlag: boolean
  isRbacEnabled: boolean,
  isEditMode: boolean
  editContextData: ApGroupEditContextType
  setEditContextData:(data: ApGroupEditContextType) => void
  editRadioContextData: ApGroupRadioContext,
  setEditRadioContextData: (data: ApGroupRadioContext) => void
  previousPath: string
  setPreviousPath: (data: string) => void,
  venueId?: string,
  venueData?: VenueExtended,
  apGroupApCaps: Capabilities | undefined,
})

export const ApGroupEditContextProvider = (props: React.PropsWithChildren) => {
  const isApGroupTableFlag = useIsSplitOn(Features.AP_GROUP_TOGGLE)
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)

  const { apGroupId, action } = useParams()
  const { isTemplate } = useConfigTemplate()
  const resolvedRbacEnabled = isTemplate ? isTemplateRbacEnabled : isWifiRbacEnabled
  const isEditMode = action === 'edit'
  const [previousPath, setPreviousPath] = useState('')
  const [editContextData, setEditContextData] = useState({} as ApGroupEditContextType)
  const [editRadioContextData, setEditRadioContextData] = useState({} as ApGroupRadioContext)

  const apGroupInfo = useConfigTemplateQueryFnSwitcher<TableResult<ApGroupViewModel>>({
    useQueryFn: useApGroupsListQuery,
    useTemplateQueryFn: useGetApGroupsTemplateListQuery,
    payload: {
      searchString: '',
      fields: [ 'id', 'venueId'],
      filters: { id: [apGroupId] },
      pageSize: 1
    },
    skip: !apGroupId,
    enableRbac: resolvedRbacEnabled
  })

  const venueId = apGroupInfo?.data?.data?.[0]?.venueId

  const { data: apGroupApCaps } = useGetApGroupApCapabilitiesQuery({
    params: { venueId, apGroupId }
  }, { skip: !venueId })

  const { data: venueData } = useGetVenueQuery({
    params: { venueId }
  }, { skip: !venueId } )

  return (
    <ApGroupEditContext.Provider value={{
      isEditMode,
      isApGroupTableFlag,
      isRbacEnabled: resolvedRbacEnabled,
      previousPath, setPreviousPath,
      editContextData, setEditContextData,
      editRadioContextData, setEditRadioContextData,
      venueId: apGroupInfo?.data?.data?.[0]?.venueId,
      venueData,
      apGroupApCaps
    }} >
      {props.children}
    </ApGroupEditContext.Provider>
  )
}
