import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Button, Card, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { useGetClientIsolationQuery }                 from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation,
  ClientIsolationSaveData,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { hasAccesses }           from '@acx-ui/user'

import { ClientIsolationInstancesTable } from './ClientIsolationInstancesTable'


export default function ClientIsolationDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetClientIsolationQuery({ params })

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Client Isolation' }),
            // eslint-disable-next-line max-len
            link: getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST })
          }
        ]}
        extra={hasAccesses([
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

  return (
    <Card>
      <GridRow>
        <GridCol col={{ span: 8 }}>
          <Card.Title>{$t({ defaultMessage: 'Client Entries' })}</Card.Title>
          <Typography.Paragraph>{data.allowlist?.length}</Typography.Paragraph>
        </GridCol>
        <GridCol col={{ span: 8 }}>
          <Card.Title>{$t({ defaultMessage: 'Description' })}</Card.Title>
          <Typography.Paragraph>{data.description}</Typography.Paragraph>
        </GridCol>
      </GridRow>
    </Card>
  )
}
