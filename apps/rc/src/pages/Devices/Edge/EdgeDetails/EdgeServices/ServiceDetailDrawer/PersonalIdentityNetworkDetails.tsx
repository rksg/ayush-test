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
  getServiceDetailsLink
}              from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

const defaultFields = [
  'id', 'name',
  'venueId', 'venueName',
  'edgeClusterInfo',
  'personaGroupId',
  'vxlanTunnelProfileId',
  'tunneledWlans',
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
    nsgViewData,
    dhcpPoolId,
    isNsgViewDataLoading
  } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: defaultFields,
      filters: { id: [serviceData.serviceId] }
    }
  }, {
    skip: !serviceData.serviceId,
    selectFromResult: ({ data, isLoading }) => {
      const nsgViewData = data?.data[0]
      return {
        nsgViewData,
        dhcpPoolId: nsgViewData?.edgeClusterInfo?.dhcpPoolId,
        isNsgViewDataLoading: isLoading
      }
    }
  })

  const { dhcpName, dhcpId, dhcpPool, isLoading: isDhcpLoading } = useGetEdgeDhcpServiceQuery(
    { params: { id: nsgViewData?.edgeClusterInfo?.dhcpInfoId } },{
      skip: !nsgViewData?.edgeClusterInfo,
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
      skip: !nsgViewData?.vxlanTunnelProfileId
    })

  const {
    data: personaGroupData,
    isLoading: isPersonaGroupLoading
  } = useGetPersonaGroupByIdQuery(
    { params: { groupId: nsgViewData?.personaGroupId } },
    { skip: !nsgViewData?.personaGroupId }
  )

  return(
    <Loader states={[{
      isLoading: false,
      isFetching: isNsgViewDataLoading || isDhcpLoading ||
        isTunnelLoading || isPersonaGroupLoading
    }]}>
      <Subtitle level={3}>
        { $t({ defaultMessage: 'Personal Identity Network Settings' }) }
      </Subtitle>
      <Form.Item
        label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={
          <TenantLink
            to={`/venues/${nsgViewData?.venueId}/venue-details/overview`}
          >
            {nsgViewData?.venueName}
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
        children={nsgViewData?.edgeClusterInfo?.segments}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Number of devices per segment' })}
        children={nsgViewData?.edgeClusterInfo?.devices}
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
        children={nsgViewData?.tunneledWlans?.length}
      />
      <PersonalIdentityNetworkDetailTableGroup nsgId={serviceData.serviceId} />
    </Loader>
  )
}
