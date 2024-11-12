import { createContext, useState } from 'react'

import { Features, useIsSplitOn }                                                             from '@acx-ui/feature-toggle'
import { useApGroupsListQuery, useGetApGroupsTemplateListQuery }                              from '@acx-ui/rc/services'
import { ApGroupViewModel, TableResult, useConfigTemplate, useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'
import { useParams }                                                                          from '@acx-ui/react-router-dom'

export type ApGroupEditContextType = {
  tabTitle: string
  unsavedTabKey?: string
  isDirty: boolean
  hasError?: boolean
  updateChanges?: (data?: unknown) => void | Promise<void>
  discardChanges?: (data?: unknown) => void | Promise<void>
}

export const ApGroupEditContext = createContext({} as {
  isApGroupTableFlag: boolean
  isRbacEnabled: boolean,
  isEditMode: boolean
  editContextData: ApGroupEditContextType
  setEditContextData:(data: ApGroupEditContextType) => void
  previousPath: string
  setPreviousPath: (data: string) => void,
  venueId?: string
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

  return (
    <ApGroupEditContext.Provider value={{
      isEditMode,
      isApGroupTableFlag,
      isRbacEnabled: resolvedRbacEnabled,
      previousPath, setPreviousPath,
      editContextData, setEditContextData,
      venueId: apGroupInfo?.data?.data?.[0]?.venueId
    }} >
      {props.children}
    </ApGroupEditContext.Provider>
  )
}
