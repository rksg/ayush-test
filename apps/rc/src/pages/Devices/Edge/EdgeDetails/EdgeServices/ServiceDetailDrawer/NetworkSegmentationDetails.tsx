import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Subtitle }                    from '@acx-ui/components'
import { NetworkSegmentationDetailTableGroup } from '@acx-ui/rc/components'
import {
  useGetEdgeDhcpServiceQuery,
  useGetNetworkSegmentationViewDataListQuery,
  useGetPersonaGroupByIdQuery,
  useGetTunnelProfileByIdQuery
} from '@acx-ui/rc/services'
import {
  EdgeService,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  getPolicyDetailsLink,
  getServiceDetailsLink
}              from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

interface NetworkSegmentationDetailsProps {
  serviceData: EdgeService
}

export const NetworkSegmentationDetails = (props: NetworkSegmentationDetailsProps) => {

  const { serviceData } = props
  const params = useParams()
  const { tenantId } = params
  const { $t } = useIntl()
  const {
    nsgViewData,
    venueInfo,
    dhcpPoolId,
    isNsgViewDataLoading
  } = useGetNetworkSegmentationViewDataListQuery({
    payload: {
      filters: { id: [serviceData.serviceId] }
    }
  }, {
    skip: !serviceData.serviceId,
    selectFromResult: ({ data, isLoading }) => {
      const nsgViewData = data?.data[0]
      return {
        nsgViewData,
        venueInfo: nsgViewData?.venueInfos?.[0],
        dhcpPoolId: nsgViewData?.edgeInfos[0]?.dhcpPoolId,
        isNsgViewDataLoading: isLoading
      }
    }
  })
  const { dhcpName, dhcpId, dhcpPool, isLoading: isDhcpLoading } = useGetEdgeDhcpServiceQuery(
    { params: { id: nsgViewData?.edgeInfos[0].dhcpInfoId } },{
      skip: !!!nsgViewData?.edgeInfos[0],
      selectFromResult: ({ data, isLoading }) => {
        return {
          dhcpName: data?.serviceName,
          dhcpId: data?.id,
          dhcpPool: data?.dhcpPools?.find(item => item.id === dhcpPoolId),
          isLoading
        }
      }
    })
  const{ data: tunnelData, isLoading: isTunnelLoading } = useGetTunnelProfileByIdQuery(
    { params: { id: nsgViewData?.vxlanTunnelProfileId } }, {
      skip: !!!nsgViewData?.vxlanTunnelProfileId
    }
  )
  const {
    data: personaGroupData,
    isLoading: isPersonaGroupLoading
  } = useGetPersonaGroupByIdQuery(
    { params: { groupId: nsgViewData?.venueInfos[0].personaGroupId } },
    { skip: !!!nsgViewData?.venueInfos[0] }
  )

  return(
    <Loader states={[{
      isLoading: false,
      isFetching: isNsgViewDataLoading || isDhcpLoading ||
        isTunnelLoading || isPersonaGroupLoading
    }]}>
      <Subtitle level={3}>
        { $t({ defaultMessage: 'Network Segmentation Settings' }) }
      </Subtitle>
      <Form.Item
        label={$t({ defaultMessage: 'Venue' })}
        children={
          <TenantLink
            to={`/venues/${venueInfo?.venueId}/venue-details/overview`}
          >
            {venueInfo?.venueName}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Persona Group' })}
        children={
          <TenantLink to={`users/persona-management/persona-group/${personaGroupData?.id}`}>
            {personaGroupData?.name}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Number of Segments' })}
        children={nsgViewData?.edgeInfos[0]?.segments}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Number of devices per segment' })}
        children={nsgViewData?.edgeInfos[0]?.devices}
      />
      <Form.Item
        label={$t({ defaultMessage: 'DHCP Service' })}
      >
        {
          dhcpName &&
          <>
            <TenantLink to={getServiceDetailsLink({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.DETAIL,
              serviceId: dhcpId!
            })}>
              {`${dhcpName}`}
            </TenantLink>
            {` (${dhcpPool?.poolName})`}
          </>
        }
      </Form.Item>
      <Form.Item
        label={$t({ defaultMessage: 'Tunnel Profile' })}
        children={
          tunnelData &&
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: tunnelData.id!
          })}>
            {
              `${tunnelData.id === tenantId ? $t({ defaultMessage: 'Default' }): tunnelData.name}
              (${nsgViewData?.tunnelNumber || 0})`
            }
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Networks' })}
        children={nsgViewData?.networkIds?.length}
      />
      <NetworkSegmentationDetailTableGroup nsgId={serviceData.serviceId} />
    </Loader>
  )
}