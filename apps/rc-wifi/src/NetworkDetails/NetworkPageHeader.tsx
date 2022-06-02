/* eslint-disable max-len */

import { BulbOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Button }                            from 'antd'
import { useParams }                         from 'react-router-dom'

import { PageHeader }    from '@acx-ui/components'
import { useTenantLink } from '@acx-ui/react-router-dom'

import NetworkTabs from './NetworkTabs'

function NetworkPageHeader (props: any) {
  const { networkId } = useParams()
  const url = `/networks/${networkId}/network-details/`
  const pathBaseUrl = useTenantLink(url)
  return (
    <PageHeader
      title='Lab Network'
      breadcrumb={[
        { text: 'Networks', link: '/networks' }
      ]}
      extra={[
        <Button key='1'><ClockCircleOutlined />Last 24 hours</Button>,
        <Button key='2'>Entire Organization</Button>,
        <Button key='3' style={{ background: 'black', color: 'white' }}>Configure</Button>,
        <Button key='4'><BulbOutlined /></Button>
      ]}
      footer={<NetworkTabs pathBaseUrl={pathBaseUrl.pathname} defaultActiveKey={props.defaultActiveKey}></NetworkTabs>}
    />
  )
}

export default NetworkPageHeader