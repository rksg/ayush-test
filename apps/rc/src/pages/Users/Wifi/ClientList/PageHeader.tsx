

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { PageHeader, RangePicker }                      from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { useGetClientListQuery, useGetGuestsListQuery } from '@acx-ui/rc/services'
import { useParams }                                    from '@acx-ui/react-router-dom'
import { DateRange, getDateRangeFilter }                from '@acx-ui/utils'

import Tabs from './Tabs'

export interface GuestDateFilter {
  range: DateRange,
  setRange: (v: DateRange) => void,
  startDate: string,
  setStartDate: (v: string) => void,
  endDate: string,
  setEndDate: (v: string) => void,
}

function Header (
  props: { dateFilter: GuestDateFilter }
) {
  const { $t } = useIntl()
  const { tenantId, venueId, serialNumber, activeTab } = useParams()
  const navbarEnhancement = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }
  const { range, setRange, startDate, setStartDate, endDate, setEndDate } = props.dateFilter

  // For display the total count, use query for a quick solution.
  // Might hitting timing issue and the count could be inconsistent with the size of client table
  const clientList = useGetClientListQuery({ params: { tenantId }, payload: defaultPayload }, {
    pollingInterval: 30_000
  })
  const guestList = useGetGuestsListQuery({ params: { tenantId }, payload: defaultPayload }, {
    pollingInterval: 30_000
  })

  const setDateFilter = function (data: {
    range: DateRange,
    startDate?: string,
    endDate?: string
  }) {
    const period = getDateRangeFilter(data.range, data.startDate, data.endDate)
    setRange(period.range)
    setStartDate(period.startDate)
    setEndDate(period.endDate)
  }

  return (
    <PageHeader
      title={navbarEnhancement
        ? $t({ defaultMessage: 'Wireless' })
        : $t({ defaultMessage: 'Wi-Fi' })
      }
      breadcrumb={navbarEnhancement ? [
        { text: $t({ defaultMessage: 'Cients' }), link: '/users/wifi/clients' }
      ]: []}
      footer={<Tabs
        clientCount={clientList?.data?.totalCount ? clientList?.data.totalCount : 0}
        guestCount={guestList?.data?.totalCount ? guestList?.data.totalCount : 0}
      />}
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
