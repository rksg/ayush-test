import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { Button, Loader, PageHeader }                         from '@acx-ui/components'
import { useIsSplitOn, Features }                             from '@acx-ui/feature-toggle'
import { useApListQuery, useGetEdgeMvSdLanViewDataListQuery } from '@acx-ui/rc/services'
import {
  EdgeMvSdLanViewData,
  ServiceOperation,
  ServiceType,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  getServiceAllowedOperation,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { CompatibilityCheck }    from './CompatibilityCheck'
import { DcSdLanDetailContent }  from './DcSdLanDetailContent'
import { DmzSdLanDetailContent } from './DmzSdLanDetailContent'
import { VenueTableDataType }    from './VenueTable'

export const defaultSdLanApTablePayload = {
  fields: [
    'serialNumber',
    'name',
    'venueId',
    'venueName',
    'deviceGroupId',
    'deviceGroupName',
    'apStatusData.vxlanStatus.vxlanMtu',
    'apStatusData.vxlanStatus.tunStatus',
    'apStatusData.vxlanStatus.primaryRvtepInfo.deviceId',
    'apStatusData.vxlanStatus.activeRvtepInfo.deviceId'
  ]
}

const defaultSdLanPayload = {
  fields: [
    'id', 'name',
    'edgeClusterId', 'edgeClusterName',
    'tunnelProfileId', 'tunnelProfileName',
    'isGuestTunnelEnabled',
    'guestEdgeClusterId', 'guestEdgeClusterName',
    'guestTunnelProfileId', 'guestTunnelProfileName',
    'edgeAlarmSummary',
    'vlans', 'vlanNum', 'vxlanTunnelNum',
    'guestVlanNum', 'guestVxlanTunnelNum', 'guestVlans',
    'tunneledWlans',
    'tunneledGuestWlans',
    'edgeClusterTunnelInfo',
    'guestEdgeClusterTunnelInfo'
  ]
}

export const EdgeSdLanDetail = () => {
  const isEdgeCompatibilityEnabled = useIsSplitOn(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const { $t } = useIntl()
  const params = useParams()

  const { edgeSdLanData, isLoading, isFetching } = useGetEdgeMvSdLanViewDataListQuery(
    { payload: {
      ...defaultSdLanPayload,
      filters: { id: [params.serviceId] }
    } },
    {
      pollingInterval: 5 * 60 * 1000,
      selectFromResult: ({ data, isLoading, isFetching, isUninitialized }) => ({
        edgeSdLanData: data?.data?.[0],
        isLoading: isUninitialized || isLoading,
        isFetching
      })
    }
  )

  const isDMZEnabled = edgeSdLanData?.isGuestTunnelEnabled

  return (
    <>
      <PageHeader
        title={edgeSdLanData?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'SD-LAN' }),
            link: getServiceRoutePath({
              type: ServiceType.EDGE_SD_LAN,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByService(ServiceType.EDGE_SD_LAN, ServiceOperation.EDIT)}
            rbacOpsIds={getServiceAllowedOperation(ServiceType.EDGE_SD_LAN, ServiceOperation.EDIT)}
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_SD_LAN,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId!
            })}>
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[{
        isLoading: isLoading,
        isFetching: isFetching
      }]}>
        {(isEdgeCompatibilityEnabled && !!params.serviceId) && <Row>
          <Col span={24}>
            <CompatibilityCheck
              serviceId={params.serviceId}
            />
          </Col>
        </Row>}
        {isDMZEnabled
          ? <DmzSdLanDetailContent data={edgeSdLanData} />
          : <DcSdLanDetailContent data={edgeSdLanData} />
        }
      </Loader>
    </>
  )
}

export const getVenueTableData = (sdLanData?: EdgeMvSdLanViewData): VenueTableDataType[] => {
  let wlans =sdLanData?.tunneledWlans ?? []
  const result = [] as VenueTableDataType[]
  wlans.forEach(wlan => {
    const target = result.find(item => item.venueId === wlan.venueId)
    if(target) {
      target.selectedNetworks.push({
        networkId: wlan.networkId,
        networkName: wlan.networkName
      })
    } else {
      result.push({
        venueId: wlan.venueId,
        venueName: wlan.venueName,
        selectedNetworks: [{
          networkId: wlan.networkId,
          networkName: wlan.networkName
        }]
      } as VenueTableDataType)
    }
  })
  return result
}
export const useSdlanApListTableQuery = (sdLanData?: EdgeMvSdLanViewData) => {
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const settingsId = 'sdlan-ap-table'
  const venueIds = getVenueTableData(sdLanData).map(v => v.venueId)

  return useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultSdLanApTablePayload,
      filters: { venueId: venueIds }
    },
    search: {
      searchString: '',
      searchTargetFields: ['name']
    },
    pagination: { settingsId },
    option: { skip: false },
    enableRbac: isUseWifiRbacApi
  })
}
