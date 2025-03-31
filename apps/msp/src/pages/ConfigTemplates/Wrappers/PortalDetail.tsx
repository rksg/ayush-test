import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol } from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import {
  PortalOverview,
  PortalInstancesTable,
  ServiceConfigTemplateDetailsLink
} from '@acx-ui/rc/components'
import { useGetPortalTemplateQuery } from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  generateConfigTemplateBreadcrumb,
  Demo,
  getServiceAllowedOperation
}  from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

export default function PortalServiceDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const queryResults = useGetPortalTemplateQuery({
    params,
    enableRbac: isEnabledRbacService
  })
  const breadcrumb = generateConfigTemplateBreadcrumb()

  return (
    <>
      <PageHeader
        title={queryResults.data?.name}
        breadcrumb={breadcrumb}
        extra={filterByAccess([
          <ServiceConfigTemplateDetailsLink
            rbacOpsIds={getServiceAllowedOperation(ServiceType.PORTAL, ServiceOperation.EDIT, true)}
            type={ServiceType.PORTAL}
            oper={ServiceOperation.EDIT}
            serviceId={params.serviceId!}
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </ServiceConfigTemplateDetailsLink>
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
