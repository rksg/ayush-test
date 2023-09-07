import { Space }   from 'antd'
import moment      from 'moment'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  RangePicker
} from '@acx-ui/components'
import {
  useParams,
  useSearchParams
} from '@acx-ui/react-router-dom'
import { useDateFilter } from '@acx-ui/utils'

import ClientDetailTabs  from './ClientDetailTabs'
import { HostnameSpace } from './styledComponents'

function DatePicker () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return <RangePicker
    selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
    onDateApply={setDateFilter as CallableFunction}
    showTimePicker
    selectionType={range}
  />
}

export const ClientDetailPageHeader = () => {
  const { $t } = useIntl()
  const { clientId } = useParams()
  const [searchParams] = useSearchParams()

  return (
    <PageHeader
      title={<Space size={4}>{clientId}
        {
          searchParams.get('hostname')
            && <HostnameSpace size={4}>
              ({searchParams.get('hostname')})
            </HostnameSpace>
        }
      </Space>}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Clients' }), link: '' },
        { text: $t({ defaultMessage: 'Wireless' }), link: '' },
        { text: $t({ defaultMessage: 'Clients List' }), link: '/users/wifi/clients' }
      ]}
      extra={[
        <DatePicker />
      ]}
      footer={<ClientDetailTabs/>}
    />
  )
}