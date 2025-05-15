import { Space }   from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { getDefaultEarliestStart, PageHeader, RangePicker } from '@acx-ui/components'
import { Features, useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { useParams }                                        from '@acx-ui/react-router-dom'
import { useDateFilter }                                    from '@acx-ui/utils'

import ApWiredClientDetailTabs     from './ApWireClientDetailTabs'
import { useApWiredClientContext } from './ApWiredClientContextProvider'


function DatePicker () {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { startDate, endDate, setDateFilter, range } = useDateFilter({
    showResetMsg,
    earliestStart: getDefaultEarliestStart() })

  return <RangePicker
    selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
    onDateApply={setDateFilter as CallableFunction}
    showTimePicker
    selectionType={range}
    maxMonthRange={isDateRangeLimit ? 1 : 3}
  />
}


const ApWiredClientDetailPageHeader = () => {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const enableTimeFilter = () => ['event'].includes(activeTab as string)

  const { clientInfo } = useApWiredClientContext()


  return (
    <PageHeader
      title={<Space size={4}>{clientInfo?.hostname}
      </Space>}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Clients' }), link: '' },
        { text: $t({ defaultMessage: 'Wired' }), link: '' },
        { text: $t({ defaultMessage: 'Clients List' }), link: '/users/wired/wifi/clients' }
      ]}
      extra={[
        enableTimeFilter() && <DatePicker />
      ]}
      footer={<ApWiredClientDetailTabs />}
    />
  )
}

export default ApWiredClientDetailPageHeader