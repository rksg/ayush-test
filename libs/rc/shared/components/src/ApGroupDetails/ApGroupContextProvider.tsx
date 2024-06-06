import { ReactNode, createContext, useContext } from 'react'

import { pick }      from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader }                                                           from '@acx-ui/components'
import { Features, useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { useApGroupsListQuery, useGetApGroupsTemplateListQuery }            from '@acx-ui/rc/services'
import { ApGroupViewModel, NewApGroupViewModelExtended, useConfigTemplate } from '@acx-ui/rc/utils'


export interface ApGroupContextType {
  id: string,
  name: string,
  venueId: string,
  venueName: string,
  membersCount: number,
  networksCount: number,
  tenantId: string
  apGroupId?: string
  activeTab?: string
}

export const ApGroupContext = createContext({} as ApGroupContextType)

export function useApGroupContext () {
  return useContext(ApGroupContext)
}

export const useApGroupViewModelFields = () => {
  const nonRbacFields = ['id', 'name', 'venueName', 'venueId', 'members', 'networks']
  const rbacFields = [
    'id',
    'name',
    'venueId',
    'venueName',
    'apSerialNumbers',
    'wifiNetworkIds'
  ]
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  return isWifiRbacEnabled ? rbacFields : nonRbacFields
}

// eslint-disable-next-line max-len
const useTransformApGroupContextData = (apGroupData?: ApGroupViewModel | NewApGroupViewModelExtended): ApGroupContextType => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const fields = useApGroupViewModelFields()
  if (!apGroupData) return {} as ApGroupContextType

  const data = isWifiRbacEnabled
    ? apGroupData as NewApGroupViewModelExtended
    : apGroupData as ApGroupViewModel

  const result = {
    ...pick(data, fields)
  } as ApGroupContextType

  if (isWifiRbacEnabled) {
    const data = apGroupData as NewApGroupViewModelExtended
    result.membersCount = data.apSerialNumbers?.length ?? 0
    result.networksCount = data.wifiNetworkIds?.length ?? 0
  } else {
    const data = apGroupData as ApGroupViewModel
    result.membersCount = data.members?.count ?? 0
    result.networksCount = data.networks?.count ?? 0
  }

  return result
}
export function ApGroupContextProvider (props: { children: ReactNode }) {
  const params = useParams()
  const { apGroupId } = params
  const { $t } = useIntl()

  const results = useApGroupsListInstance()

  const { data } = results
  const apiData = useTransformApGroupContextData(data?.[0])

  const values: ApGroupContextType = {
    ...params,
    ...apiData
  } as ApGroupContextType

  return <ApGroupContext.Provider value={values}>
    <Loader states={[results]}>{
      data && data.length
        ? props.children
        : $t({ defaultMessage: 'Could not find AP group {apGroupId}' }, { apGroupId })
    }</Loader>
  </ApGroupContext.Provider>
}

const useApGroupsListInstance = () => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const { isTemplate } = useConfigTemplate()
  const { tenantId, apGroupId } = useParams()
  const fields = useApGroupViewModelFields()

  const apGroupsListPayload = {
    fields,
    searchTargetFields: ['id'],
    searchString: apGroupId
  }

  const apGroupsListNonTemplateNonRbac = useApGroupsListQuery({
    params: { tenantId },
    payload: apGroupsListPayload,
    page: 1,
    pageSize: 10,
    enableRbac: isWifiRbacEnabled
  }, {
    skip: isTemplate,
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })

  const apGroupsListNonTemplate = isWifiRbacEnabled
    ? apGroupsListNonTemplateRbac
    : apGroupsListNonTemplateNonRbac

  const apGroupsListTemplate = useGetApGroupsTemplateListQuery({
    params: { tenantId },
    payload: apGroupsListPayload,
    page: 1,
    pageSize: 10
  }, {
    skip: !isTemplate,
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })

  return isTemplate ? apGroupsListTemplate : apGroupsListNonTemplate
}
