import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Button, PageHeader, RangePicker }                    from '@acx-ui/components'
import { useLocation, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }                                     from '@acx-ui/user'
import { useDateFilter }                                      from '@acx-ui/utils'

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
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('/networks/wireless')
  const { networkId, activeTab } = useParams()
  const { $t } = useIntl()
  const enableTimeFilter = () => {
    switch (activeTab) {
        case "aps":
        case "venues":
            return false
        default:
            return true
    }
  }
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
          enableTimeFilter()
          ? <RangePicker
          key='date-filter'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
          />
          : <div />,
        <Button
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/${networkId}/edit`
            }, {
              state: {
                from: location
              }
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>
      ])}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
