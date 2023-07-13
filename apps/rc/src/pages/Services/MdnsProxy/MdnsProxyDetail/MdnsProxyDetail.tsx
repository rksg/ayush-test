import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { useGetMdnsProxyQuery }                 from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceDetailsLink,
  ServiceOperation,
  MdnsProxyScopeData,
  getServiceRoutePath,
  getServiceListRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }        from '@acx-ui/user'

import { MdnsProxyInstancesTable } from './MdnsProxyInstancesTable'
import { MdnsProxyOverview }       from './MdnsProxyOverview'

export default function MdnsProxyDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetMdnsProxyQuery({ params })
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'mDNS Proxy' }),
            link: getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.LIST })
          }
        ] : [
          {
            text: $t({ defaultMessage: 'Services' }),
            link: getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.LIST })
          }
        ]}
        extra={filterByAccess([
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
