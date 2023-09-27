import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { PageHeader, RangePicker } from '@acx-ui/components'
import { useParams }               from '@acx-ui/react-router-dom'
import { useDateFilter }           from '@acx-ui/utils'

function ApPageHeader () {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { apId } = useParams()

  return (
    <PageHeader
      title={apId || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Wi-Fi' }) },
        { text: $t({ defaultMessage: 'Access Points' }) },
        { text: $t({ defaultMessage: 'AP List' }), link: '/wifi' }
      ]}
      extra={[
        <RangePicker
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />
      ]}
    />
  )
}

export default ApPageHeader
