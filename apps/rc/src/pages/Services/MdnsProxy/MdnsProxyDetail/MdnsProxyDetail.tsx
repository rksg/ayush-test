import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { Button, PageHeader }    from '@acx-ui/components'
import { ClockOutlined }         from '@acx-ui/icons'
import { useGetMdnsProxyQuery }  from '@acx-ui/rc/services'
import { ServiceType }           from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import {
  getServiceDetailsLink,
  getServiceListRoutePath,
  ServiceOperation
} from '../../serviceRouteUtils'

import { MdnsProxyInstancesTable } from './MdnsProxyInstancesTable'
import { MdnsProxyOverview }       from './MdnsProxyOverview'

export default function MdnsProxyDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetMdnsProxyQuery({ params })

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={[
          <Button key={'date-filter'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </Button>,
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.MDNS_PROXY,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId as string
            })}
            key='edit'
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
      />
      <Row>
        {data && <MdnsProxyOverview data={data} />}
      </Row>

      <Row style={{ marginTop: 25 }}>
        <MdnsProxyInstancesTable />
      </Row>
    </>
  )
}
