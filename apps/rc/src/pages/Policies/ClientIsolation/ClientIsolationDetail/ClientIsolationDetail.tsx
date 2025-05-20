import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, SummaryCard } from '@acx-ui/components'
import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { useGetClientIsolationQuery }                        from '@acx-ui/rc/services'
import {
  ClientIsolationSaveData,
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  usePolicyListBreadcrumb,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { ClientIsolationInstancesTable } from './ClientIsolationInstancesTable'


export default function ClientIsolationDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { data } = useGetClientIsolationQuery({ params, enableRbac })

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={usePolicyListBreadcrumb(PolicyType.CLIENT_ISOLATION)}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.CLIENT_ISOLATION,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId as string
          })}
          rbacOpsIds={getPolicyAllowedOperation(PolicyType.CLIENT_ISOLATION, PolicyOperation.EDIT)}
          scopeKey={getScopeKeyByPolicy(PolicyType.CLIENT_ISOLATION, PolicyOperation.EDIT)}>
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          {data && <ClientIsolationOverview data={data} />}
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <ClientIsolationInstancesTable />
        </GridCol>
      </GridRow>
    </>
  )
}

interface ClientIsolationOverviewProps {
  data: ClientIsolationSaveData
}

function ClientIsolationOverview (props: ClientIsolationOverviewProps) {
  const { data } = props
  const { $t } = useIntl()
  const clientIsolationInfo = [
    {
      title: $t({ defaultMessage: 'Client Entries' }),
      content: data.allowlist?.length
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      content: data.description
    }
  ]

  return <SummaryCard data={clientIsolationInfo} />
}
