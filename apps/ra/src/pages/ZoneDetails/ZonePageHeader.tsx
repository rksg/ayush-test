import { useEffect } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { useAnalyticsFilter }      from '@acx-ui/analytics/utils'
import { PageHeader, RangePicker } from '@acx-ui/components'
import {
  useParams
} from '@acx-ui/react-router-dom'
import { PathNode, useDateFilter } from '@acx-ui/utils'

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
  const { systemName, zoneName } = useParams()
  const path = [
    { name: 'Network', type: 'network' },
    { name: systemName, type: 'system' },
    { name: zoneName, type: 'zone' }
  ] as PathNode[]
  const { setNetworkPath } = useAnalyticsFilter()
  useEffect(() => {
    setNetworkPath(path, path)
  }, [])
  return (
    <PageHeader
      title={zoneName}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Zones' }), link: '/zones' }
      ]}
      extra={[
        <DatePicker key='venues-date-picker' />
      ]}
      footer={<ZoneTabs />}
    />
  )
}

export default ZonePageHeader

