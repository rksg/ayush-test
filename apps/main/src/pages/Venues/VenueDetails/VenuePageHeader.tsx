import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Button, DisabledButton, PageHeader, RangePicker } from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { ClockOutlined }                                   from '@acx-ui/icons'
import { useVenueDetailsHeaderQuery }                      from '@acx-ui/rc/services'
import { VenueDetailHeader }                               from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
}                  from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
import { useDateFilter }  from '@acx-ui/utils'

import VenueTabs from './VenueTabs'


function DatePicker () {
  const { $t } = useIntl()
  const enableVenueAnalytics = useIsSplitOn(Features.VENUE_ANALYTICS)
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return (enableVenueAnalytics)
    ? <RangePicker
      selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
      onDateApply={setDateFilter as CallableFunction}
      showTimePicker
      selectionType={range}
    />
    : <DisabledButton icon={<ClockOutlined />}>
      {$t({ defaultMessage: 'Last 24 Hours' })}
    </DisabledButton>
}


function VenuePageHeader () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const { data } = useVenueDetailsHeaderQuery({ params: { tenantId, venueId } })

  const navigate = useNavigate()
  const basePath = useTenantLink(`/venues/${venueId}`)

  return (
    <PageHeader
      title={data?.venue?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Venues' }), link: '/venues' }
      ]}
      extra={filterByAccess([
        <DatePicker key='date-filter' />,
        <Button
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/edit/details`
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>
      ])}
      footer={<VenueTabs venueDetail={data as VenueDetailHeader} />}
    />
  )
}

export default VenuePageHeader
