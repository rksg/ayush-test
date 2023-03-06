import { useIntl } from 'react-intl'

import { Button, DisabledButton, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { ClockOutlined }                                        from '@acx-ui/icons'
import { hasAccesses }                                          from '@acx-ui/user'
import { useGetMdnsProxyQuery }                                 from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceDetailsLink,
  getServiceListRoutePath,
  ServiceOperation,
  MdnsProxyScopeData
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { MdnsProxyInstancesTable } from './MdnsProxyInstancesTable'
import { MdnsProxyOverview }       from './MdnsProxyOverview'

export default function MdnsProxyDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetMdnsProxyQuery({ params })

  const getApList = () => {
    if (!data || !data.scope?.length) {
      return null
    }

    return data.scope.map((s: MdnsProxyScopeData) => {
      return s.aps.map(ap => ap.serialNumber)
    }).flat()
  }

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={hasAccesses([
          <DisabledButton key={'date-filter'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </DisabledButton>,
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.MDNS_PROXY,
            oper: ServiceOperation.EDIT,
            serviceId: params.serviceId as string
          })}>
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          {data && <MdnsProxyOverview data={data} />}
        </GridCol>
        <GridCol col={{ span: 24 }}>
          {data && <MdnsProxyInstancesTable apList={getApList()} />}
        </GridCol>
      </GridRow>
    </>
  )
}
