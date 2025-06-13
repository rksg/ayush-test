import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { getDefaultEarliestStart, PageHeader, RangePicker } from '@acx-ui/components'
import { useDateFilter }                                    from '@acx-ui/utils'

import Mdu360Tabs from './Mdu360Tabs'

const Mdu360: React.FC<{}> = () => {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateFilter({
    showResetMsg: true, earliestStart: getDefaultEarliestStart() })

  return (
    <PageHeader
      title={$t({ defaultMessage: 'MDU 360' })}
      extra={[
        <RangePicker
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
          maxMonthRange={3} //TODO: need to check
        />
      ]}
      footer={<Mdu360Tabs startDate={startDate} endDate={endDate} />}
    />
  )
}

export default Mdu360