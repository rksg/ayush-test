import { Form }    from 'antd'
import { uniq }    from 'lodash'
import { useIntl } from 'react-intl'

import { Loader, Subtitle }                                                                    from '@acx-ui/components'
import { useGetEdgeMvSdLanViewDataListQuery }                                                  from '@acx-ui/rc/services'
import { EdgeService, getPolicyDetailsLink, PolicyType, PolicyOperation, EdgeMvSdLanViewData } from '@acx-ui/rc/utils'
import { TenantLink }                                                                          from '@acx-ui/react-router-dom'

interface SdLanDetailsProps {
  serviceData: EdgeService
}

export const MvSdLanDetails = (props: SdLanDetailsProps) => {
  const { serviceData } = props
  const { $t } = useIntl()

  const { edgeSdLanData, isLoading, isFetching } = useGetEdgeMvSdLanViewDataListQuery(
    { payload: {
      fields: [
        'isGuestTunnelEnabled',
        'tunnelProfileId',
        'tunnelProfileName',
        'guestTunnelProfileId',
        'guestTunnelProfileName',
        'tunneledWlans',
        'tunneledGuestWlans'
      ],
      filters: { id: [serviceData.serviceId] }
    } },
    {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        edgeSdLanData: data?.data?.[0] as EdgeMvSdLanViewData,
        isLoading,
        isFetching
      })
    }
  )

  const tunneledVenueIds = uniq(edgeSdLanData?.tunneledWlans?.map(wlan => wlan.venueId))
  const isGuestTunnelEnabled = !!edgeSdLanData?.isGuestTunnelEnabled

  return(
    <Loader states={[{ isLoading, isFetching }]}>
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
      {isGuestTunnelEnabled &&
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
        label={$t({ defaultMessage: 'Tunneled <VenuePlural></VenuePlural>' })}
        children={tunneledVenueIds.length}
      />
      {isGuestTunnelEnabled &&
        <Form.Item
          label={$t({ defaultMessage: 'Tunneled Networks to DMZ' })}
          children={edgeSdLanData.tunneledGuestWlans?.length ?? 0}
        />
      }
    </Loader>
  )
}
