import { Space }   from 'antd'
import moment      from 'moment'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  RangePicker
} from '@acx-ui/components'
import {
  useParams
} from '@acx-ui/react-router-dom'
import { useDateFilter } from '@acx-ui/utils'

import NetworkDetailsTabs from './NetworkDetailsTabs'

function DatePicker () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return <RangePicker
    selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
    onDateApply={setDateFilter as CallableFunction}
    showTimePicker
    selectionType={range}
  />
}

export const NetworkDetailsPageHeader = () => {
  const { $t } = useIntl()
  const { networkId } = useParams()

  return (
    <PageHeader
      title={<Space size={4}>{networkId}</Space>}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Wi-Fi' }), link: '' },
        { text: $t({ defaultMessage: 'Wi-Fi Networks' }), link: '' },
        { text: $t({ defaultMessage: 'Network List' }), link: '/networks/wireless' }
      ]}
      extra={[
        <DatePicker />
      ]}
      footer={<NetworkDetailsTabs/>}
    />
  )
}
