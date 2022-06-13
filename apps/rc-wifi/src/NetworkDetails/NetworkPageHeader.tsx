/* eslint-disable max-len */

import { BulbOutlined, ClockCircleOutlined } from '@ant-design/icons'

import { Button, PageHeader } from '@acx-ui/components'
import { useGetNetworkQuery } from '@acx-ui/rc/services'
import { useParams }          from '@acx-ui/react-router-dom'

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
      extra={<>
        <Button><ClockCircleOutlined />Last 24 hours</Button>
        <Button>Entire Organization</Button>
        <Button type='primary'>Configure</Button>
        <Button><BulbOutlined /></Button>
      </>}
      footer={<NetworkTabs />}
    />
  )
}

export default NetworkPageHeader
