import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  DatePicker,
  PageHeader
} from '@acx-ui/components'
import {
  useParams,
  useSearchParams
} from '@acx-ui/react-router-dom'

import ClientDetailTabs from './ClientDetailTabs'

export const ClientDetailPageHeader = () => {
  const { $t } = useIntl()
  const { clientId } = useParams()
  const [searchParams] = useSearchParams()

  return (
    <PageHeader
      title={<Space size={4}>{clientId}
        {
          searchParams.get('hostname') &&
      searchParams.get('hostname') !== clientId &&
      <Space style={{ fontSize: '14px', marginLeft: '8px' }} size={0}>
        ({searchParams.get('hostname')})
      </Space>
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