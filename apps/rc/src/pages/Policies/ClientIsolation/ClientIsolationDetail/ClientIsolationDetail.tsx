import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, SummaryCard } from '@acx-ui/components'
import { useGetClientIsolationQuery }                        from '@acx-ui/rc/services'
import {
  ClientIsolationSaveData,
  PolicyOperation,
  PolicyType,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  getPolicyListRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }        from '@acx-ui/user'

import { ClientIsolationInstancesTable } from './ClientIsolationInstancesTable'


export default function ClientIsolationDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetClientIsolationQuery({ params })
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST })

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Client Isolation' }),
            link: tablePath
          }
        ]}
        extra={filterByAccess([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.CLIENT_ISOLATION,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId as string
          })}>
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
