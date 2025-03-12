import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol } from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { useGetApSnmpViewModelQuery }                   from '@acx-ui/rc/services'
import {
  ApSnmpViewModelData,
  filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  GetApiVersionHeader,
  ApiVersionEnum,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

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
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  // eslint-disable-next-line
  const isSNMPv3PassphraseOn = useIsSplitOn(Features.WIFI_SNMP_V3_AGENT_PASSPHRASE_COMPLEXITY_TOGGLE)
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.SNMP_AGENT, oper: PolicyOperation.LIST })

  const tableQuery = useTableQuery({
    useQuery: useGetApSnmpViewModelQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        id: [params.policyId]
      }
    },
    customHeaders:
    ( isUseRbacApi ?
      GetApiVersionHeader((isSNMPv3PassphraseOn? ApiVersionEnum.v1_1 : ApiVersionEnum.v1)):
      undefined)
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
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.SNMP_AGENT,
              oper: PolicyOperation.EDIT,
              policyId: params.policyId as string
            })}
            scopeKey={getScopeKeyByPolicy(PolicyType.SNMP_AGENT, PolicyOperation.EDIT)}
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.SNMP_AGENT, PolicyOperation.EDIT)}>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </TenantLink>
        ])}
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
