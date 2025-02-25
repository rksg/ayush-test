import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Subtitle }                        from '@acx-ui/components'
import { PersonalIdentityNetworkDetailTableGroup } from '@acx-ui/rc/components'
import {
  useGetEdgeDhcpServiceQuery,
  useGetEdgePinViewDataListQuery,
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
  getServiceDetailsLink,
  transformDisplayNumber,
  MAX_DEVICE_PER_SEGMENT
}              from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

const defaultFields = [
  'id', 'name',
  'venueId', 'venueName',
  'edgeClusterInfo',
  'personaGroupId',
  'vxlanTunnelProfileId',
  'tunneledWlans',
  'tunnelNumber',
  'edgeAlarmSummary'
]
interface PersonalIdentityNetworkDetailsProps {
  serviceData: EdgeService
}

export const PersonalIdentityNetworkDetails = (props: PersonalIdentityNetworkDetailsProps) => {

  const { serviceData } = props
  const params = useParams()
  const { tenantId } = params
  const { $t } = useIntl()
  const {
    pinViewData,
    dhcpPoolId,
    isPinViewDataLoading
  } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: defaultFields,
      filters: { id: [serviceData.serviceId] }
    }
  }, {
    skip: !serviceData.serviceId,
    selectFromResult: ({ data, isLoading }) => {
      const pinViewData = data?.data[0]
      return {
        pinViewData,
        dhcpPoolId: pinViewData?.edgeClusterInfo?.dhcpPoolId,
        isPinViewDataLoading: isLoading
      }
    }
  })

  const { dhcpName, dhcpId, dhcpPool, isLoading: isDhcpLoading } = useGetEdgeDhcpServiceQuery(
    { params: { id: pinViewData?.edgeClusterInfo?.dhcpInfoId } },{
      skip: !pinViewData?.edgeClusterInfo,
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
    { params: { id: pinViewData?.vxlanTunnelProfileId } }, {
      skip: !pinViewData?.vxlanTunnelProfileId
    })

  const {
    data: personaGroupData,
    isLoading: isPersonaGroupLoading
  } = useGetPersonaGroupByIdQuery(
    { params: { groupId: pinViewData?.personaGroupId } },
    { skip: !pinViewData?.personaGroupId }
  )

  return(
    <Loader states={[{
      isLoading: false,
      isFetching: isPinViewDataLoading || isDhcpLoading ||
        isTunnelLoading || isPersonaGroupLoading
    }]}>
      <Subtitle level={3}>
        { $t({ defaultMessage: 'Personal Identity Network Settings' }) }
      </Subtitle>
      <Form.Item
        label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={
          <TenantLink
            to={`/venues/${pinViewData?.venueId}/venue-details/overview`}
          >
            {pinViewData?.venueName}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Identity Group' })}
        children={
          <TenantLink to={`users/persona-management/persona-group/${personaGroupData?.id}`}>
            {personaGroupData?.name}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Number of Segments' })}
        children={pinViewData?.edgeClusterInfo?.segments}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Number of devices per segment' })}
        children={MAX_DEVICE_PER_SEGMENT}
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
              (${pinViewData?.tunnelNumber || 0})`
            }
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Networks' })}
        children={transformDisplayNumber(pinViewData?.tunneledWlans?.length)}
      />
      <PersonalIdentityNetworkDetailTableGroup pinId={serviceData.serviceId} />
    </Loader>
  )
}
