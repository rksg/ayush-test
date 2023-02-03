import { useIntl } from 'react-intl'

import moment      from 'moment'

import { Button, DisabledButton, PageHeader, RangePicker } from '@acx-ui/components'
import { ArrowExpand, ClockOutlined }         from '@acx-ui/icons'
import { TenantLink, useParams }              from '@acx-ui/react-router-dom'
import {
  dateRangeForLast,
  useDateFilter,
  useEncodedParameter
} from '@acx-ui/utils'
import NetworkTabs       from './NetworkTabs'
import { useGetNetwork } from './services'

function NetworkPageHeader () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { write, read } = useEncodedParameter('ssid', true)
  const network = useGetNetwork()
  const { networkId } = useParams()
  const { $t } = useIntl()
  const ssid  = network.data?.wlan?.ssid
  if (ssid && ssid !== read()) write(ssid)
  return (
    <PageHeader
      title={network.data?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Networks' }), link: '/networks' }
      ]}
      extra={[
        <DisabledButton key='hierarchy-filter'>
          {$t({ defaultMessage: 'All Active Venues' })}<ArrowExpand /></DisabledButton>,
        <RangePicker
          key='date-filter'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          enableDates={dateRangeForLast(3,'months')}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />,
        <TenantLink to={`/networks/wireless/${networkId}/edit`} key='edit'>
          <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ]}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
