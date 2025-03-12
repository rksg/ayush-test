import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, PageHeader }                                                                          from '@acx-ui/components'
import { DpskOverview, ServiceConfigTemplateDetailsLink }                                              from '@acx-ui/rc/components'
import { useGetDpskTemplateQuery }                                                                     from '@acx-ui/rc/services'
import { ServiceOperation, ServiceType, generateConfigTemplateBreadcrumb, getServiceAllowedOperation } from '@acx-ui/rc/utils'
import { filterByAccess }                                                                              from '@acx-ui/user'

export default function DpskDetails () {
  const { $t } = useIntl()
  const { tenantId, serviceId } = useParams()
  const { data: dpskDetail } = useGetDpskTemplateQuery({ params: { tenantId, serviceId } })
  const breadcrumb = generateConfigTemplateBreadcrumb()

  return (
    <>
      <PageHeader
        title={dpskDetail?.name}
        breadcrumb={breadcrumb}
        extra={filterByAccess([
          <ServiceConfigTemplateDetailsLink
            rbacOpsIds={getServiceAllowedOperation(ServiceType.DPSK, ServiceOperation.EDIT, true)}
            type={ServiceType.DPSK}
            oper={ServiceOperation.EDIT}
            serviceId={serviceId!}
          >
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </ServiceConfigTemplateDetailsLink>
        ])}
      />
      <DpskOverview data={dpskDetail} />
    </>
  )
}
