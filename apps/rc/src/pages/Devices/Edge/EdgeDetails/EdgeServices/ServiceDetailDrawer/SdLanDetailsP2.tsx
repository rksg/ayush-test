import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Subtitle }                                               from '@acx-ui/components'
import { useGetEdgeSdLanP2ViewDataListQuery }                             from '@acx-ui/rc/services'
import { EdgeService, getPolicyDetailsLink, PolicyType, PolicyOperation } from '@acx-ui/rc/utils'
import { TenantLink }                                                     from '@acx-ui/react-router-dom'

interface SdLanDetailsProps {
  serviceData: EdgeService
}

export const SdLanDetailsP2 = (props: SdLanDetailsProps) => {
  const { serviceData } = props
  const { $t } = useIntl()

  const { edgeSdLanData, isLoading } = useGetEdgeSdLanP2ViewDataListQuery(
    { payload: {
      fields: [
        'isGuestTunnelEnabled',
        'tunnelProfileId',
        'tunnelProfileName',
        'guestTunnelProfileId',
        'guestTunnelProfileName',
        'networkIds',
        'guestNetworkIds'
      ],
      filters: { id: [serviceData.serviceId] }
    } },
    {
      selectFromResult: ({ data, isLoading }) => ({
        edgeSdLanData: data?.data?.[0],
        isLoading
      })
    }
  )

  return(
    <Loader states={[{ isLoading: false, isFetching: isLoading }]}>
      <Subtitle level={3}>
        { $t({ defaultMessage: 'SD-LAN Settings' }) }
      </Subtitle>
      <Form.Item
        label={$t({ defaultMessage: 'Tunnel Profile (AP-Cluster)' })}
        children={
          edgeSdLanData && <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: edgeSdLanData?.tunnelProfileId!
          })}>
            {edgeSdLanData?.tunnelProfileName!}
          </TenantLink>
        }
      />
      {edgeSdLanData?.isGuestTunnelEnabled &&
        <Form.Item
          label={$t({ defaultMessage: 'Tunnel Profile (Cluster-DMZ Cluster)' })}
          children={
            edgeSdLanData && <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.TUNNEL_PROFILE,
              oper: PolicyOperation.DETAIL,
              policyId: edgeSdLanData?.guestTunnelProfileId!
            })}>
              {edgeSdLanData?.guestTunnelProfileName!}
            </TenantLink>
          }
        />
      }
      <Form.Item
        label={$t({ defaultMessage: 'Tunneling Networks' })}
        children={edgeSdLanData?.networkIds.length}
      />
      {edgeSdLanData?.isGuestTunnelEnabled &&
        <Form.Item
          label={$t({ defaultMessage: 'Tunneling Networks to DMZ' })}
          children={edgeSdLanData?.guestNetworkIds.length}
        />
      }
    </Loader>
  )
}