import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol } from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { PortalOverview, PortalInstancesTable }         from '@acx-ui/rc/components'
import { useGetPortalQuery }                            from '@acx-ui/rc/services'
import {
  Demo,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  getServiceAllowedOperation,
  getServiceDetailsLink,
  ServiceOperation,
  ServiceType,
  useServiceListBreadcrumb
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'


export default function PortalServiceDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const queryResults = useGetPortalQuery({ params, enableRbac: isEnabledRbacService })

  return (
    <>
      <PageHeader
        title={queryResults.data?.serviceName ?? queryResults.data?.name}
        breadcrumb={useServiceListBreadcrumb(ServiceType.PORTAL)}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.PORTAL,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId!
            })}
            rbacOpsIds={getServiceAllowedOperation(ServiceType.PORTAL, ServiceOperation.EDIT)}
            scopeKey={getScopeKeyByService(ServiceType.PORTAL, ServiceOperation.EDIT)}
          >
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Loader states={[queryResults]}>
            <PortalOverview demoValue={queryResults.data?.content as Demo} />
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <PortalInstancesTable/>
        </GridCol>
      </GridRow>
    </>
  )
}
