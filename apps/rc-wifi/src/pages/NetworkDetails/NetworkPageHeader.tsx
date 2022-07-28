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
        { text: $t({defaultMessage: 'Networks'}), link: '/networks' }
      ]}
      extra={[
        <Button key='date-filter' icon={<ClockOutlined />}>{$t({defaultMessage: 'Last 24 Hours'})}</Button>,
        <Button key='hierarchy-filter'>{$t({defaultMessage: 'Entire Organization'})}<ArrowExpand /></Button>,
        <Button key='configure' type='primary'>{$t({defaultMessage: 'Configure'})}</Button>,
        <Button key='insight' icon={<BulbOutlined />} />
      ]}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
