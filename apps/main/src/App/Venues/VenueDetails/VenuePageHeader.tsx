import { useIntl } from 'react-intl'

import { Button, PageHeader }         from '@acx-ui/components'
import { ClockOutlined }              from '@acx-ui/icons'
import { useVenueDetailsHeaderQuery } from '@acx-ui/rc/services'
import { useParams }                  from '@acx-ui/react-router-dom'

import VenueTabs from './VenueTabs'

function VenuePageHeader () {
  const { $t } = useIntl()
  const params = useParams()
  const { data } = useVenueDetailsHeaderQuery({ params })

  return (
    <PageHeader
      title={data?.venue?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Venues' }), link: '/venues' }
      ]}
      extra={[
        <Button key='date-filter' icon={<ClockOutlined />}>
          {$t({ defaultMessage: 'Last 24 Hours' })}
        </Button>,
        <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
      ]}
      footer={<VenueTabs />}
    />
  )
}

export default VenuePageHeader
