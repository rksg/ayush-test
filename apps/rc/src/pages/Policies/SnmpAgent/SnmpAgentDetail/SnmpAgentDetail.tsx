import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol } from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { useGetApSnmpViewModelQuery }                   from '@acx-ui/rc/services'
import {
  ApSnmpViewModelData,
  filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink,
  usePolicyListBreadcrumb,
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

const rbacSnmpFields = [
  'id',
  'name',
  'communityNames',
  'userNames'
]

export default function SnmpAgentDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  // eslint-disable-next-line
  const isSNMPv3PassphraseOn = useIsSplitOn(Features.WIFI_SNMP_V3_AGENT_PASSPHRASE_COMPLEXITY_TOGGLE)

  const defaultPayload = {
    searchString: '',
    fields: (isUseRbacApi) ? rbacSnmpFields: [ 'id', 'name', 'v2Agents', 'v3Agents' ],
    sortField: 'name',
    sortOrder: 'ASC',
    page: 1,
    pageSize: 25
  }

  const tableQuery = useTableQuery({
    useQuery: useGetApSnmpViewModelQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        id: [params.policyId]
      }
    },
    enableRbac: isUseRbacApi,
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
        breadcrumb={usePolicyListBreadcrumb(PolicyType.SNMP_AGENT)}
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
