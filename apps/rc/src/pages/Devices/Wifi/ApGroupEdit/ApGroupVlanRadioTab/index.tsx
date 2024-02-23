import { createContext, useContext, useEffect, useRef, useState } from 'react'

import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { StepsFormLegacy }        from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetApGroupQuery,
  useLazyApGroupNetworkListQuery,
  useLazyApGroupNetworkListV2Query,
  useUpdateNetworkVenuesMutation,
  useVlanPoolListQuery
} from '@acx-ui/rc/services'
import { Network, NetworkVenue, VlanPool } from '@acx-ui/rc/utils'
import { useTenantLink }                   from '@acx-ui/react-router-dom'

import { ApGroupEditContext }                            from '..'
import { defaultApGroupNetworkPayload, getCurrentVenue } from '../../ApGroupNetworkTable'

import { ApGroupVlanRadioDrawer, ApGroupVlanRadioDrawerState } from './ApGroupVlanRadioDrawer'
import { ApGroupVlanRadioTable }                               from './ApGroupVlanRadioTable'


const defaultTableData: Network[] = []
const defaultDrawerStatus: ApGroupVlanRadioDrawerState = {
  visible: false,
  editData: {} as Network
}

export const ApGroupVlanRadioContext = createContext({} as {
  apGroupId: string
  venueId: string
  tableData: Network[]
  setTableData: (data: Network[]) => void
  drawerStatus: ApGroupVlanRadioDrawerState
  setDrawerStatus: (data: ApGroupVlanRadioDrawerState) => void
  vlanPoolOptions: VlanPool[]
})


export function ApGroupVlanRadioTab () {
  const { $t } = useIntl()
  const isUseWifiApiV2 = useIsSplitOn(Features.WIFI_API_V2_TOGGLE)
  const {
    isEditMode,
    isApGroupTableFlag,
    setEditContextData
  } = useContext(ApGroupEditContext)

  const { tenantId, apGroupId = '' } = useParams()

  const updateDataRef = useRef<NetworkVenue[]>([])

  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const navigatePathName = (isApGroupTableFlag)?
    `${basePath.pathname}/wifi/apgroups` :
    `${basePath.pathname}/wifi`

  const { data: apGroupData, isLoading: isApGroupDataLoading } = useGetApGroupQuery(
    { params: { tenantId, apGroupId } },
    { skip: !(isApGroupTableFlag && isEditMode) })


  const [getApGroupNetworkList] = useLazyApGroupNetworkListQuery()
  const [getApGroupNetworkListV2] = useLazyApGroupNetworkListV2Query()
  const [updateNetworkVenues] = useUpdateNetworkVenuesMutation()

  const { vlanPoolOptions } = useVlanPoolListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        vlanPoolOptions: data ?? []
      }
    }
  })

  const [venueId, setVenueId] = useState('')
  const [tableData, setTableData] = useState(defaultTableData)
  const [drawerStatus, setDrawerStatus] = useState(defaultDrawerStatus)

  useEffect(() => {
    if (apGroupData && !isApGroupDataLoading) {
      const payload = _.cloneDeep({
        ...defaultApGroupNetworkPayload,
        filters: { isAllApGroups: [false] }
      })

      const getApGroupNetworkData = async (isUseWifiApiV2: boolean, venueId: string) => {
        if (isUseWifiApiV2) {
          const { data } = await getApGroupNetworkListV2({
            params: { tenantId, venueId, apGroupId },
            payload
          })

          return data
        }
        const { data } = await getApGroupNetworkList({
          params: { tenantId, venueId, apGroupId },
          payload
        })
        return data
      }

      const getInitTableData = async () => {
        const venueId = apGroupData.venueId
        const data = await getApGroupNetworkData(isUseWifiApiV2, venueId)

        setVenueId(venueId)
        const initData = data?.data || [] as Network[]
        setTableData(_.cloneDeep(initData))
      }

      getInitTableData()
    }
  }, [apGroupData, isApGroupDataLoading,
    isUseWifiApiV2, getApGroupNetworkList, getApGroupNetworkListV2,
    tenantId, apGroupId])

  const handleUpdateAllApGroupVlanRadio = async () => {
    const updateData = updateDataRef.current

    if (updateData.length > 0) {
      await updateNetworkVenues({ payload: updateData }).unwrap()
    }

    setEditContextData({
      tabTitle: $t({ defaultMessage: 'VLAN & Radio' }),
      unsavedTabKey: 'vlanRadio',
      isDirty: false
    })
  }

  const handleUpdateApGroupVlanRadio = (editData: Network) => {
    const editNetworkVenue = _.cloneDeep(getCurrentVenue(editData, venueId)!)
    const updateData = _.cloneDeep(updateDataRef.current)

    const findIdx = updateData.findIndex(d => (d.id === editNetworkVenue.id))
    if (findIdx === -1) {
      updateData.push(editNetworkVenue)
    } else {
      updateData.splice(findIdx, 1, editNetworkVenue)
    }
    updateDataRef.current = updateData
    //console.log('updateData', updateDataRef.current)

    setTableData(
      tableData.map(data => {
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
        <ApGroupVlanRadioContext.Provider value={{
          venueId, apGroupId,
          tableData, setTableData,
          drawerStatus, setDrawerStatus,
          vlanPoolOptions }} >
          <ApGroupVlanRadioTable />
          <ApGroupVlanRadioDrawer updateData={handleUpdateApGroupVlanRadio}/>
        </ApGroupVlanRadioContext.Provider>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}