import moment      from 'moment'
import { useIntl } from 'react-intl'

import { PageHeader, RangePicker } from '@acx-ui/components'
import { useGetClientListQuery }   from '@acx-ui/rc/services'
import { useParams }               from '@acx-ui/react-router-dom'
import { useDateFilter }           from '@acx-ui/utils'

import Tabs from './Tabs'

function Header () {
  const { $t } = useIntl()
  const { startDate, setDateFilter, range } = useDateFilter()
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
          selectedRange={{ startDate: moment(startDate), endDate: null }}
          onDateApply={setDateFilter as CallableFunction}
        />
      ] : []}
    />
  )
}

export default Header
