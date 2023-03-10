import moment      from 'moment'
import { useIntl } from 'react-intl'

import { Button, PageHeader, RangePicker } from '@acx-ui/components'
import { TenantLink, useParams }           from '@acx-ui/react-router-dom'
import { filterByAccess }                  from '@acx-ui/user'
import { useDateFilter }                   from '@acx-ui/utils'

import { ActiveVenueFilter } from './ActiveVenueFilter'
import NetworkTabs           from './NetworkTabs'
import { useGetNetwork }     from './services'

function NetworkPageHeader ({
  setSelectedVenues,
  selectedVenues
}: {
  setSelectedVenues?: CallableFunction,
  selectedVenues?: string[]
}) {
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
      extra={filterByAccess([
        ...(setSelectedVenues && selectedVenues)
          ? [
            <ActiveVenueFilter
              selectedVenues={selectedVenues}
              setSelectedVenues={setSelectedVenues}
              key='hierarchy-filter'
            />
          ]
          : [],
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
