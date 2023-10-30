import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { PageHeader, RangePicker } from '@acx-ui/components'
import {
  useParams
} from '@acx-ui/react-router-dom'
import { useDateFilter } from '@acx-ui/utils'

import ZoneTabs from './ZoneTabs'

function DatePicker () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return <RangePicker
    selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
    onDateApply={setDateFilter as CallableFunction}
    showTimePicker
    selectionType={range}
  />
}

function ZonePageHeader () {
  const { $t } = useIntl()
  const { zoneName } = useParams()
  return (
    <PageHeader
      title={zoneName}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Zones' }), link: '/zones' }
      ]}
      extra={[
        <DatePicker key='zone-details-date-picker' />
      ]}
      footer={<ZoneTabs />}
    />
  )
}

export default ZonePageHeader

