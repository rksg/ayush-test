import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { cloneDeep }              from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, StepsFormLegacy } from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import {
  useGetVLANPoolPolicyViewModelListQuery,
  useLazyApGroupNetworkListV2Query,
  useLazyNewApGroupNetworkListQuery,
  useLazyNewApGroupNetworkListV2Query,
  useUpdateNetworkVenuesMutation,
  useUpdateNetworkVenueTemplateMutation,
  useGetEnhancedVlanPoolPolicyTemplateListQuery,
  useUpdateNetworkVenueMutation
} from '@acx-ui/rc/services'
import {
  KeyValue,
  Network,
  NetworkVenue,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  VLANPoolViewModelType
} from '@acx-ui/rc/utils'

import {
  defaultApGroupNetworkPayload,
  defaultNewApGroupNetworkPayload,
  getCurrentVenue
} from '../../ApGroupNetworkTable'
import { usePathBasedOnConfigTemplate } from '../../configTemplates'
import { ApGroupEditContext }           from '../context'

import { ApGroupVlanRadioDrawer, ApGroupVlanRadioDrawerState } from './ApGroupVlanRadioDrawer'
import { ApGroupVlanRadioTable }                               from './ApGroupVlanRadioTable'

const defaultDrawerStatus: ApGroupVlanRadioDrawerState = {
  visible: false,
  editData: {} as Network
}

export const ApGroupVlanRadioContext = createContext({} as {
  apGroupId: string
  venueId: string
  tableData: Network[] | undefined
  setTableData: (data: Network[]) => void
  drawerStatus: ApGroupVlanRadioDrawerState
  setDrawerStatus: (data: ApGroupVlanRadioDrawerState) => void
  vlanPoolingNameMap: KeyValue<string, string>[]
})

export type VlanPoolNameMapType = { vlanPoolingNameMap: KeyValue<string, string>[] }

export function ApGroupVlanRadioTab () {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const isUseNewRbacNetworkVenueApi = useIsSplitOn(Features.WIFI_NETWORK_VENUE_QUERY)

  const {
    isApGroupTableFlag,
    isRbacEnabled,
    setEditContextData,
    venueId
  } = useContext(ApGroupEditContext)

  const { tenantId, apGroupId = '' } = useParams()

  const updateDataRef = useRef<NetworkVenue[]>([])
  const oldDataRef = useRef<NetworkVenue[]>([])
  const networkDataRef = useRef<string[]>([])

  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate('/devices/', '')
  const navigatePathName = isTemplate ? basePath.pathname : ((isApGroupTableFlag)
    ? `${basePath.pathname}/wifi/apgroups`
    : `${basePath.pathname}/wifi`)

  const [getApGroupNetworkListV2] = useLazyApGroupNetworkListV2Query()
  const [getRbacApGroupNetworkList] = useLazyNewApGroupNetworkListQuery()
  const [getRbacApGroupNetworkListV2] = useLazyNewApGroupNetworkListV2Query()
  const [updateNetworkVenues] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateNetworkVenuesMutation,
    useTemplateMutationFn: useUpdateNetworkVenueTemplateMutation
  })

  const [updateNetworkVenue] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateNetworkVenueMutation,
    useTemplateMutationFn: useUpdateNetworkVenueTemplateMutation
  })

  const [tableData, setTableData] = useState<Network[] | undefined>(undefined)
  const [drawerStatus, setDrawerStatus] = useState(defaultDrawerStatus)

  // eslint-disable-next-line max-len
  const { vlanPoolingNameMap }: VlanPoolNameMapType = useGetVLANPoolPolicyInstance(!(tableData?.length))

  useEffect(() => {

    const getApGroupNetworkData = async (venueId: string) => {
      if (isRbacEnabled) {
        const params = { venueId, apGroupId }
        const payload = cloneDeep({
          ...defaultNewApGroupNetworkPayload,
          isTemplate: isTemplate,
          isTemplateRbacEnabled: isRbacEnabled,
          filters: {
            'venueApGroups.apGroupIds': [apGroupId],
            'venueApGroups.isAllApGroups': [false]
          }
        })

        if (isUseNewRbacNetworkVenueApi) {
          const { data } = await getRbacApGroupNetworkListV2({ params, payload })
          return data
        } else {
          const { data } = await getRbacApGroupNetworkList({ params, payload })
          return data
        }
      } else {
        const params = { tenantId, venueId, apGroupId }
        const payload = cloneDeep({
          ...defaultApGroupNetworkPayload,
          isTemplate: isTemplate,
          filters: { isAllApGroups: [false] }
        })

        const { data } = await getApGroupNetworkListV2({ params, payload })
        return data
      }
    }

    const getInitTableData = async () => {
      const data = await getApGroupNetworkData(venueId!)

      const initData = data?.data || [] as Network[]
      setTableData(cloneDeep(initData))
    }

    if (venueId) {
      getInitTableData()
    }

  }, [ tenantId, venueId, apGroupId,
    getApGroupNetworkListV2, getRbacApGroupNetworkList, getRbacApGroupNetworkListV2,
    isRbacEnabled, isTemplate, isUseNewRbacNetworkVenueApi ])

  const handleUpdateAllApGroupVlanRadio = async () => {
    const updateData = updateDataRef.current
    const updateOldData = oldDataRef.current
    const networkIds = networkDataRef.current

    if (updateData.length > 0) {
      if (isRbacEnabled) {
        const allReqs = updateData.map((data, idx) => {
          return updateNetworkVenue({
            params: {
              tenantId: tenantId,
              venueId: venueId,
              networkId: networkIds[idx]
            },
            payload: {
              oldPayload: updateOldData[idx],
              newPayload: data
            },
            enableRbac: isRbacEnabled
          }).unwrap()
        })
        await Promise.allSettled(allReqs)
      } else {
        await updateNetworkVenues({
          payload: updateData
        }).unwrap()
      }
    }

    setEditContextData({
      tabTitle: $t({ defaultMessage: 'VLAN & Radio' }),
      unsavedTabKey: 'vlanRadio',
      isDirty: false
    })
  }

  const handleUpdateApGroupVlanRadio = (editData: Network, oldData: Network) => {
    const editNetworkVenue = cloneDeep(getCurrentVenue(editData, venueId!)!)
    const oldNetworkVenue = cloneDeep(getCurrentVenue(oldData, venueId!)!)
    const updateData = cloneDeep(updateDataRef.current)
    const updateOldData = cloneDeep(oldDataRef.current)
    const networkIdsData = cloneDeep(networkDataRef.current)

    const findIdx = updateData.findIndex(d => (d.id === editNetworkVenue.id))
    if (findIdx === -1) {
      updateData.push(editNetworkVenue)
      updateOldData.push(oldNetworkVenue)
      networkIdsData.push(editData.id)
    } else {
      updateData.splice(findIdx, 1, editNetworkVenue)
      updateOldData.splice(findIdx, 1, oldNetworkVenue)
      networkIdsData.splice(findIdx, 1, editData.id)
    }
    updateDataRef.current = updateData
    oldDataRef.current = updateOldData
    networkDataRef.current = networkIdsData

    setTableData(
      tableData?.map(data => {
        return (editData.id === data.id) ? editData : data
      })
    )

    setEditContextData({
      tabTitle: $t({ defaultMessage: 'VLAN & Radio' }),
      unsavedTabKey: 'vlanRadio',
      isDirty: true,
      updateChanges: () => handleUpdateAllApGroupVlanRadio()
    })
  }

  const handleDiscardChanges = async () => {
    setEditContextData({
      tabTitle: $t({ defaultMessage: 'VLAN & Radio' }),
      unsavedTabKey: 'vlanRadio',
      isDirty: false
    })

    navigate({
      ...basePath,
      pathname: navigatePathName
    })
  }

  return (
    <StepsFormLegacy
      onFinish={handleUpdateAllApGroupVlanRadio}
      onCancel={() => handleDiscardChanges()}
      buttonLabel={{
        submit: $t({ defaultMessage: 'Apply' })
      }}
    >
      <StepsFormLegacy.StepForm>
        {$t({
          // eslint-disable-next-line max-len
          defaultMessage: 'Configure the VLAN & Radio settings for the following networks which are applied to this AP group:'
        })}
        <Loader states={[{ isLoading: !tableData || !venueId }]}>
          <ApGroupVlanRadioContext.Provider value={{
            venueId: venueId!, apGroupId,
            tableData, setTableData,
            drawerStatus, setDrawerStatus,
            vlanPoolingNameMap }} >
            <ApGroupVlanRadioTable />
            <ApGroupVlanRadioDrawer updateData={handleUpdateApGroupVlanRadio} />
          </ApGroupVlanRadioContext.Provider>
        </Loader>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}

export const useGetVLANPoolPolicyInstance = (skipQuery: boolean) => {
  const { tenantId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const transformVlanPoolData = ({ data }: { data?: { data: VLANPoolViewModelType[] } }) => ({
    vlanPoolingNameMap: data?.data
      ? data.data.map(vlanPool => ({ key: vlanPool.id!, value: vlanPool.name }))
      : [] as KeyValue<string, string>[]
  })

  const vlanPoolPayload = {
    fields: ['name', 'id', 'vlanMembers'],
    sortField: 'name',
    sortOrder: 'ASC',
    page: 1,
    pageSize: 10000
  }

  const vlanPoolingNonTemplate: VlanPoolNameMapType = useGetVLANPoolPolicyViewModelListQuery({
    params: { tenantId },
    payload: vlanPoolPayload,
    enableRbac: isPolicyRbacEnabled
  }, {
    skip: skipQuery || isTemplate,
    selectFromResult: transformVlanPoolData
  })

  const vlanPoolingTemplate: VlanPoolNameMapType = useGetEnhancedVlanPoolPolicyTemplateListQuery({
    params: { tenantId },
    payload: vlanPoolPayload,
    enableRbac: enableTemplateRbac
  }, {
    skip: skipQuery || !isTemplate,
    selectFromResult: transformVlanPoolData
  })

  return isTemplate ? vlanPoolingTemplate : vlanPoolingNonTemplate
}
