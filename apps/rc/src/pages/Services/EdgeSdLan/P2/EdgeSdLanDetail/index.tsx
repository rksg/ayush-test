import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader }         from '@acx-ui/components'
import { useGetEdgeSdLanP2ViewDataListQuery } from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { DcSdLanDetailContent }  from './DcSdLanDetailContent'
import { DmzSdLanDetailContent } from './DmzSdLanDetailContent'

const defaultSdLanPayload = {
  fields: [
    'id', 'name',
    'venueId', 'venueName',
    'edgeClusterId', 'edgeClusterName',
    'tunnelProfileId', 'tunnelProfileName',
    'isGuestTunnelEnabled',
    'guestEdgeClusterId', 'guestEdgeClusterName',
    'guestTunnelProfileId', 'guestTunnelProfileName',
    'edgeAlarmSummary',
    'vlans', 'vlanNum', 'vxlanTunnelNum',
    'guestVlanNum', 'guestVxlanTunnelNum', 'guestVlans',
    'networkIds', 'networkInfos',
    'guestNetworkIds', 'guestNetworkInfos',
    'edgeClusterTunnelInfo',
    'guestEdgeClusterTunnelInfo'
  ]
}

const EdgeSdLanDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { edgeSdLanData, isLoading, isFetching } = useGetEdgeSdLanP2ViewDataListQuery(
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
        {isDMZEnabled
          ? <DmzSdLanDetailContent data={edgeSdLanData} />
          : <DcSdLanDetailContent data={edgeSdLanData} />
        }
      </Loader>
    </>
  )
}

export default EdgeSdLanDetail
