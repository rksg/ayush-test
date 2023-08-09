import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Subtitle }     from '@acx-ui/components'
import { useGetDhcpStatsQuery } from '@acx-ui/rc/services'
import { EdgeService }          from '@acx-ui/rc/utils'

interface DhcpDetailsProps {
  serviceData: EdgeService
}

export const DhcpDetails = (props: DhcpDetailsProps) => {

  const { serviceData } = props
  const { $t } = useIntl()
  const getDhcpStatsPayload = {
    fields: [
      'serviceName',
      'dhcpRelay',
      'dhcpPoolNum',
      'leaseTime'
    ],
    filters: { id: [serviceData.serviceId] }
  }
  const { dhcpStats, isLoading } = useGetDhcpStatsQuery({
    params: { serviceId: serviceData.serviceId },
    payload: getDhcpStatsPayload
  }, {
    skip: !!!serviceData.serviceId,
    selectFromResult: ({ data, isLoading }) => {
      return {
        dhcpStats: data?.data?.[0],
        isLoading
      }
    }
  })

  return(
    <Loader states={[{
      isLoading: false,
      isFetching: isLoading
    }]}>
      <Subtitle level={3}>
        { $t({ defaultMessage: 'DHCP Settings' }) }
      </Subtitle>
      <Form.Item
        label={$t({ defaultMessage: 'DHCP Relay' })}
        children={
          dhcpStats?.dhcpRelay === 'true' ?
            $t({ defaultMessage: 'ON' }) :
            dhcpStats?.dhcpRelay === undefined ?
              '--' :
              $t({ defaultMessage: 'OFF' })
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'DHCP Pool' })}
        children={dhcpStats?.dhcpPoolNum || '--'}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Lease Time' })}
        children={dhcpStats?.leaseTime || '--'}
      />
    </Loader>
  )
}