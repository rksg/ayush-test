import { useIntl } from 'react-intl'

import { Button, PageHeader }                       from '@acx-ui/components'
import { ArrowExpand, ClockOutlined, BulbOutlined } from '@acx-ui/icons'

import NetworkTabs       from './NetworkTabs'
import { useGetNetwork } from './services'

function NetworkPageHeader () {
  const network = useGetNetwork()
  const { $t } = useIntl()
  return (
    <PageHeader
      title={network.data?.name || ''}
      breadcrumb={[
        { text: $t({id: 'network.title', defaultMessage: 'Networks'}), link: '/networks' }
      ]}
      extra={[
        <Button key='date-filter' icon={<ClockOutlined />}>{$t({id: 'network.last24Hours', defaultMessage: 'Last 24 Hours'})}</Button>,
        <Button key='hierarchy-filter'>{$t({id: 'network.entireOrg', defaultMessage: 'Entire Organization'})}<ArrowExpand /></Button>,
        <Button key='configure' type='primary'>{$t({id: 'network.configure', defaultMessage: 'Configure'})}</Button>,
        <Button key='insight' icon={<BulbOutlined />} />
      ]}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
