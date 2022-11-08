import { useIntl } from 'react-intl'

import { Button, DisabledButton, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { ClockOutlined }                                        from '@acx-ui/icons'
import { useGetMdnsProxyQuery }                                 from '@acx-ui/rc/services'
import { ServiceType }                                          from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                from '@acx-ui/react-router-dom'

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
          <DisabledButton key={'date-filter'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </DisabledButton>,
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
      <GridRow>
        <GridCol col={{ span: 24 }}>
          {data && <MdnsProxyOverview data={data} />}
        </GridCol>
      </GridRow>

      <GridRow style={{ marginTop: 25 }}>
        <GridCol col={{ span: 24 }}>
          <MdnsProxyInstancesTable />
        </GridCol>
      </GridRow>
    </>
  )
}
