import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { PageHeader, RangePicker } from '@acx-ui/components'
import {
  useParams
} from '@acx-ui/react-router-dom'
import { DateRangeFilter } from '@acx-ui/utils'

import ZoneTabs from './ZoneTabs'

type ZonePageHeaderProps = DateRangeFilter & { setDateFilter: CallableFunction }

function ZonePageHeader ({ startDate, endDate, range, setDateFilter }: ZonePageHeaderProps) {
  const { $t } = useIntl()
  const { zoneName } = useParams()
  return (
    <PageHeader
      title={zoneName}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Zones' }), link: '/zones' }
      ]}
      extra={[
        <RangePicker
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />
      ]}
      footer={<ZoneTabs />}
    />
  )
}

export default ZonePageHeader

