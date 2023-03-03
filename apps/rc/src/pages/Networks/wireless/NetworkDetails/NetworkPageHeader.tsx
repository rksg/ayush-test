import moment      from 'moment'
import { useIntl } from 'react-intl'


import { Button, DisabledButton, PageHeader, RangePicker } from '@acx-ui/components'
import { ArrowExpand }                                     from '@acx-ui/icons'
import { hasAccesses }                                     from '@acx-ui/rbac'
import { TenantLink, useParams }                           from '@acx-ui/react-router-dom'
import { useDateFilter }                                   from '@acx-ui/utils'

import NetworkTabs       from './NetworkTabs'
import { useGetNetwork } from './services'

function NetworkPageHeader () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const network = useGetNetwork()
  const { networkId } = useParams()
  const { $t } = useIntl()
  return (
    <PageHeader
      title={network.data?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Networks' }), link: '/networks' }
      ]}
      extra={hasAccesses([
        <DisabledButton key='hierarchy-filter'>
          {$t({ defaultMessage: 'All Active Venues' })}<ArrowExpand /></DisabledButton>,
        <RangePicker
          key='date-filter'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />,
        <TenantLink to={`/networks/wireless/${networkId}/edit`}>
          <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ])}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
