import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol }                                                                                      from '@acx-ui/components'
import { useGetApSnmpViewModelQuery }                                                                                                        from '@acx-ui/rc/services'
import { ApSnmpViewModelData, getPolicyDetailsLink, getPolicyListRoutePath, getPolicyRoutePath, PolicyOperation, PolicyType, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                        from '@acx-ui/react-router-dom'

import SnmpAgentInstancesTable from './SnmpAgentInstancesTable'
import SnmpAgentOverview       from './SnmpAgentOverview'

const defaultPayload = {
  searchString: '',
  fields: [ 'id', 'name', 'v2Agents', 'v3Agents' ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25
}

export default function SnmpAgentDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.SNMP_AGENT, oper: PolicyOperation.LIST })

  const tableQuery = useTableQuery({
    useQuery: useGetApSnmpViewModelQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        id: [params.policyId]
      }
    }
  })

  const basicData = tableQuery.data?.data?.[0]

  return (
    <>
      <PageHeader
        title={basicData?.name||''}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'SNMP Agent' }), link: tablePath }
        ]}
        extra={[
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.SNMP_AGENT,
              oper: PolicyOperation.EDIT,
              policyId: params.policyId as string
            })}
            key='edit'>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ]}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Loader states={[tableQuery]}>
            <SnmpAgentOverview snmpData={basicData as ApSnmpViewModelData} />
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <SnmpAgentInstancesTable />
        </GridCol>
      </GridRow>
    </>
  )
}
