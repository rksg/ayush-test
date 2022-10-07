import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import { ClockOutlined }      from '@acx-ui/icons'

import { MdnsProxyInstancesTable } from './MdnsProxyInstancesTable'
import { MdnsProxyOverview }       from './MdnsProxyOverview'

export function MdnsProxyDetail () {
  const { $t } = useIntl()

  const mockedData = {
    name: 'My mDNS Proxy'
  }

  return (
    <>
      <PageHeader
        title={mockedData.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
        extra={[
          <Button key={'date-filter'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </Button>,
          <Button key={'configure'} type={'primary'}>
            {$t({ defaultMessage: 'Configure' })}
          </Button>
        ]}
      />
      <Row>
        <MdnsProxyOverview />
      </Row>

      <Row style={{ marginTop: 25 }}>
        <MdnsProxyInstancesTable />
      </Row>
    </>
  )
}
