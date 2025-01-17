import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { MdnsProxyServiceInfo }                 from '@acx-ui/rc/components'
import { useGetEdgeMdnsProxyQuery }             from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  transformEdgeMdnsRulesToViewModelType,
  getServiceAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { CompatibilityCheck } from './CompatibilityCheck'
import { InstancesTable }     from './InstancesTable'

const EdgeMdnsProxyDetails = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetEdgeMdnsProxyQuery({ params })

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'mDNS Proxy for RUCKUS Edge ' }),
            // eslint-disable-next-line max-len
            link: getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY, oper: ServiceOperation.LIST })
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByService(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.EDIT)}
            // eslint-disable-next-line max-len
            rbacOpsIds={getServiceAllowedOperation(ServiceType.EDGE_MDNS_PROXY, ServiceOperation.EDIT)}
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_MDNS_PROXY,
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
      {!!params.serviceId && <GridRow>
        <GridCol col={{ span: 24 }}>
          <CompatibilityCheck
            serviceId={params.serviceId}
          />
        </GridCol>
      </GridRow>}
      <GridRow>
        <GridCol col={{ span: 24 }}>
          {
            // eslint-disable-next-line max-len
            data && <MdnsProxyServiceInfo rules={transformEdgeMdnsRulesToViewModelType(data.forwardingRules)} />}
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <InstancesTable serviceId={params.serviceId}/>
        </GridCol>
      </GridRow>
    </>
  )
}

export default EdgeMdnsProxyDetails