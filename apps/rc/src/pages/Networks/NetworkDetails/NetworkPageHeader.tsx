import { useIntl } from 'react-intl'

import { Button, DisabledButton, PageHeader } from '@acx-ui/components'
import { ArrowExpand, ClockOutlined }         from '@acx-ui/icons'
import { TenantLink, useParams }              from '@acx-ui/react-router-dom'

import NetworkTabs       from './NetworkTabs'
import { useGetNetwork } from './services'

function NetworkPageHeader () {
  const network = useGetNetwork()
  const { networkId } = useParams()
  const { $t } = useIntl()
  return (
    <PageHeader
      title={network.data?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Networks' }), link: '/networks' }
      ]}
      extra={[
        <DisabledButton key='hierarchy-filter'>
          {$t({ defaultMessage: 'All Active Venues' })}<ArrowExpand /></DisabledButton>,
        <DisabledButton key='date-filter' icon={<ClockOutlined />}>
          {$t({ defaultMessage: 'Last 24 Hours' })}</DisabledButton>,
        <TenantLink to={`/networks/${networkId}/edit`} key='edit'>
          <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ]}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
