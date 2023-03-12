
import { useEffect, useMemo } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { PageHeader, RangePicker }                                        from '@acx-ui/components'
import { useGetClientListQuery }                                          from '@acx-ui/rc/services'
import { useParams }                                                      from '@acx-ui/react-router-dom'
import { DateFilter, DateRange, getDateRangeFilter, useEncodedParameter } from '@acx-ui/utils'

import Tabs from './Tabs'


export const useClientDateFilter = () => {
  const { read, write } = useEncodedParameter<DateFilter>('guestClientPeriod')

  return useMemo(() => {
    const period = read()
    const dateFilter = period
      ? getDateRangeFilter(period.range, period.startDate, period.endDate)
      : getDateRangeFilter(DateRange.allTime)

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
  const { startDate, setDateFilter, range } = useClientDateFilter()
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

  useEffect(() => {
    if (activeTab === 'guests') {
      setDateFilter({
        range: DateRange.allTime,
        startDate: '',
        endDate: ''
      })
    }
  }, [activeTab])

  return (
    <PageHeader
      title={$t({ defaultMessage: 'Wi-Fi' })}
      footer={<Tabs clientCount={data?.totalCount ? data.totalCount : 0} />}
      extra={activeTab === 'guests' ? [
        <RangePicker
          selectionType={range}
          showAllTime={true}
          selectedRange={{ startDate: moment(startDate), endDate: null }}
          onDateApply={setDateFilter as CallableFunction}
        />
      ] : []}
    />
  )
}

export default Header
