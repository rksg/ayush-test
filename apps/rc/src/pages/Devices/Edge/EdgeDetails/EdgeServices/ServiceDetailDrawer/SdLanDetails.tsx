import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Subtitle }                                               from '@acx-ui/components'
import { useGetEdgeSdLanViewDataListQuery }                               from '@acx-ui/rc/services'
import { EdgeService, getPolicyDetailsLink, PolicyType, PolicyOperation } from '@acx-ui/rc/utils'
import { TenantLink }                                                     from '@acx-ui/react-router-dom'
import { useTenantId }                                                    from '@acx-ui/utils'

interface SdLanDetailsProps {
  serviceData: EdgeService
}

export const SdLanDetails = (props: SdLanDetailsProps) => {
  const { serviceData } = props
  const { $t } = useIntl()
  const tenantId = useTenantId()

  const { edgeSdLanData, isLoading } = useGetEdgeSdLanViewDataListQuery(
    { payload: {
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
        label={$t({ defaultMessage: 'Tunnel Profile' })}
        children={
          edgeSdLanData && <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: edgeSdLanData?.tunnelProfileId!
          })}>
            {
              edgeSdLanData?.tunnelProfileId === tenantId
                ? $t({ defaultMessage: 'Default' })
                : edgeSdLanData?.tunnelProfileName!
            }
          </TenantLink>
        }
      />
    </Loader>
  )
}