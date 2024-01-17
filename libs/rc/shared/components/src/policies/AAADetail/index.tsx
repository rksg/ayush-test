import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol }              from '@acx-ui/components'
import { useGetAAAProfileDetailQuery, useGetAAAPolicyTemplateQuery } from '@acx-ui/rc/services'
import {
  AAAPolicyType,
  getPolicyDetailsLink,
  PolicyOperation,
  PolicyType,
  useConfigTemplate, usePolicyBreadcrumb
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import AAAInstancesTable from './AAAInstancesTable'
import AAAOverview       from './AAAOverview'

export function AAAPolicyDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const queryResults = useGetAAAPolicyInstance()
  const breadcrumb = usePolicyBreadcrumb(PolicyType.AAA, PolicyOperation.LIST)

  return (
    <>
      <PageHeader
        title={queryResults.data?.name||''}
        breadcrumb={breadcrumb}
        extra={filterByAccess([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.AAA,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId as string
          })}>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Loader states={[queryResults]}>
            <AAAOverview aaaProfile={queryResults.data as AAAPolicyType} />
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <AAAInstancesTable/>
        </GridCol>
      </GridRow>
    </>
  )
}

export function useGetAAAPolicyInstance () {
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const requestPayload = { params }
  const aaaPolicyResult = useGetAAAProfileDetailQuery(requestPayload, {
    skip: isTemplate
  })
  const aaaPolicyTemplateResult = useGetAAAPolicyTemplateQuery(requestPayload, {
    skip: !isTemplate
  })

  return isTemplate ? aaaPolicyTemplateResult : aaaPolicyResult
}
