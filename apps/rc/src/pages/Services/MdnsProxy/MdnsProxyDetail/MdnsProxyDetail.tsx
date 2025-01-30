import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { MdnsProxyServiceInfo }                 from '@acx-ui/rc/components'
import { useGetMdnsProxyQuery }                 from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceDetailsLink,
  ServiceOperation,
  ApMdnsProxyScopeData,
  getServiceRoutePath,
  getServiceListRoutePath,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  getServiceAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { MdnsProxyInstancesTable } from './MdnsProxyInstancesTable'

export default function MdnsProxyDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { data } = useGetMdnsProxyQuery({ params, enableRbac })

  const getApList = () => {
    if (!data || !data.scope?.length) {
      return null
    }

    return data.scope.map((s: ApMdnsProxyScopeData) => {
      return s.aps.map(ap => ap.serialNumber)
    }).flat()
  }

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'mDNS Proxy' }),
            link: getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.LIST })
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            rbacOpsIds={getServiceAllowedOperation(ServiceType.MDNS_PROXY, ServiceOperation.EDIT)}
            scopeKey={getScopeKeyByService(ServiceType.MDNS_PROXY, ServiceOperation.EDIT)}
            to={getServiceDetailsLink({
              type: ServiceType.MDNS_PROXY,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId as string
            })}
          >
            <Button key='configure' type='primary'>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          {data && <MdnsProxyServiceInfo rules={data.rules} />}
        </GridCol>
        <GridCol col={{ span: 24 }}>
          {data && <MdnsProxyInstancesTable apList={getApList()} />}
        </GridCol>
      </GridRow>
    </>
  )
}
