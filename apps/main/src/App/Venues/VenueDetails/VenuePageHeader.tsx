import { Button, PageHeader }          from '@acx-ui/components'
import { ClockOutlined, BulbOutlined } from '@acx-ui/icons'
import { useVenueDetailsHeaderQuery }  from '@acx-ui/rc/services'
import { useParams }                   from '@acx-ui/react-router-dom'

import VenueTabs from './VenueTabs'

function VenuePageHeader () {
  const params = useParams()
  const { data } = useVenueDetailsHeaderQuery({ params })

  return (
    <PageHeader
      title={data?.venue?.name || ''}
      breadcrumb={[
        { text: 'Venues', link: '/venues' }
      ]}
      extra={[
        <Button key='date-filter' icon={<ClockOutlined />}>Last 24 Hours</Button>,
        <Button key='configure' type='primary'>Configure</Button>,
        <Button key='insight' icon={<BulbOutlined />} />
      ]}
      footer={<VenueTabs />}
    />
  )
}

export default VenuePageHeader
