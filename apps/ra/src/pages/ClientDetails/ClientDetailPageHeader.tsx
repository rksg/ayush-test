import { Space }   from 'antd'
import moment      from 'moment'
import { useIntl } from 'react-intl'

import { useNetworkClientListQuery } from '@acx-ui/analytics/services'
import {
  PageHeader,
  RangePicker
} from '@acx-ui/components'
import {
  useParams
} from '@acx-ui/react-router-dom'
import { useDateFilter } from '@acx-ui/utils'


import ClientDetailTabs  from './ClientDetailTabs'
import { HostnameSpace } from './styledComponents'

export const ClientDetailPageHeader = () => {
  const { $t } = useIntl()
  const { clientId } = useParams()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const DatePicker = <RangePicker
    selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
    onDateApply={setDateFilter as CallableFunction}
    showTimePicker
    selectionType={range}
  />
  const hostname = useNetworkClientListQuery({
    start: startDate,
    end: endDate,
    limit: 1,
    query: clientId as string,
    filter: {}
  })?.data?.clientsByTraffic?.[0]?.hostname
  return (
    <PageHeader
      title={<Space size={4}>{`${clientId} ${hostname ? `(${hostname})` : ''}`}
        {<HostnameSpace size={4}>
          {/* TODO: use client detail query to get hostname */}
        </HostnameSpace>}
      </Space>}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Clients' }), link: '' },
        { text: $t({ defaultMessage: 'Wireless' }), link: '' },
        { text: $t({ defaultMessage: 'Clients List' }), link: '/users/wifi/clients' }
      ]}
      extra={[DatePicker]}
      footer={<ClientDetailTabs/>}
    />
  )
}
