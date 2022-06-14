import { Button, PageHeader }                       from '@acx-ui/components'
import { ArrowExpand, ClockOutlined, BulbOutlined } from '@acx-ui/icons'
import { useGetNetworkQuery }                       from '@acx-ui/rc/services'
import { useParams }                                from '@acx-ui/react-router-dom'

import NetworkTabs from './NetworkTabs'

function NetworkPageHeader () {
  const { tenantId, networkId } = useParams()
  const network = useGetNetworkQuery({
    params: {
      tenantId, networkId
    }
  })
  return (
    <PageHeader
      title={network?.data?.name}
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      extra={[
        <Button key='date'><ClockOutlined />Last 24 hours</Button>,
        <Button key='hierarchy'>Entire Organization <ArrowExpand /></Button>,
        <Button key='configure' type='primary'>Configure</Button>,
        <Button key='insight'><BulbOutlined /></Button>
      ]}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
