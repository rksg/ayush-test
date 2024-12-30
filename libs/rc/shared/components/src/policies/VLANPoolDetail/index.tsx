import { useIntl } from 'react-intl'

import { PageHeader, Button, GridRow, Loader, GridCol }                             from '@acx-ui/components'
import { Features, useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { useGetVLANPoolPolicyDetailQuery, useGetVlanPoolPolicyTemplateDetailQuery } from '@acx-ui/rc/services'
import {
  VLANPoolPolicyType,
  PolicyType,
  PolicyOperation,
  useConfigTemplateQueryFnSwitcher,
  usePolicyListBreadcrumb, filterByAccessForServicePolicyMutation, getScopeKeyByPolicy,
  useTemplateAwarePolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { PolicyConfigTemplateLinkSwitcher } from '../../configTemplates'

import VLANPoolInstancesTable from './VLANPoolInstancesTable'
import VLANPoolOverview       from './VLANPoolOverview'

export function VLANPoolDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const queryResults = useConfigTemplateQueryFnSwitcher<VLANPoolPolicyType>({
    useQueryFn: useGetVLANPoolPolicyDetailQuery,
    useTemplateQueryFn: useGetVlanPoolPolicyTemplateDetailQuery,
    enableRbac: isPolicyRbacEnabled
  })
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.VLAN_POOL)

  return (
    <>
      <PageHeader
        title={queryResults.data?.name}
        breadcrumb={breadcrumb}
        extra={filterByAccessForServicePolicyMutation([
          <PolicyConfigTemplateLinkSwitcher
            // eslint-disable-next-line max-len
            rbacOpsIds={useTemplateAwarePolicyAllowedOperation(PolicyType.VLAN_POOL, PolicyOperation.EDIT)}
            scopeKey={getScopeKeyByPolicy(PolicyType.VLAN_POOL, PolicyOperation.EDIT)}
            type={PolicyType.VLAN_POOL}
            oper={PolicyOperation.EDIT}
            policyId={params.policyId!}
            children={
              <Button key={'configure'} type={'primary'}>
                {$t({ defaultMessage: 'Configure' })}
              </Button>
            }
          />
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Loader states={[queryResults]}>
            <VLANPoolOverview vlanPoolProfile={queryResults.data as VLANPoolPolicyType} />
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <VLANPoolInstancesTable/>
        </GridCol>
      </GridRow>
    </>
  )
}
