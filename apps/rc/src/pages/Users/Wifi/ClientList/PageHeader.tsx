import { useMemo } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { PageHeader, RangePicker }                                        from '@acx-ui/components'
import { useGetClientListQuery }                                          from '@acx-ui/rc/services'
import { useParams }                                                      from '@acx-ui/react-router-dom'
import { DateFilter, DateRange, getDateRangeFilter, useEncodedParameter } from '@acx-ui/utils'

import Tabs from './Tabs'

export const useDateForGuestFilter = () => {
  const { read, write } = useEncodedParameter<DateFilter>('period')

  return useMemo(() => {
    const period = read()
    const dateFilter = period
      ? getDateRangeFilter(period.range, period.startDate, period.endDate)
      : getDateRangeFilter(DateRange.last24Hours)

    const setDateFilter = (date: DateFilter) => {
      write({
        ...date,
        initiated: (new Date()).getTime() // for when we click same relative date again
      })
    }
    return {
      dateFilter,
      setDateFilter,
      ...dateFilter
    } as const
  }, [read, write])
}


function Header () {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateForGuestFilter()
  const { tenantId, venueId, serialNumber, activeTab } = useParams()
  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }

  // For display the total count, use query for a quick solution.
  // Might hitting timing issue and the count could be inconsistent with the size of client table
  const { data } = useGetClientListQuery({ params: { tenantId }, payload: defaultPayload }, {
    pollingInterval: 30_000
  })

  return (
    <PageHeader
      title={$t({ defaultMessage: 'Wi-Fi' })}
      footer={<Tabs clientCount={data?.totalCount ? data.totalCount : 0} />}
      // Have side effect, revert it and check the rangePicker
      extra={activeTab === 'guests' ? [
        <RangePicker
          selectionType={range}
          showAllTime={true}
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
        />
      ] : []}
    />
  )
}

export default Header
