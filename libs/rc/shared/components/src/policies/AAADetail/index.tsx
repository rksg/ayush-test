import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol }           from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useAaaPolicyQuery,
  useAaaPolicyCertificateQuery,
  useGetAAAPolicyTemplateQuery
} from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  useConfigTemplate,
  useConfigTemplateQueryFnSwitcher,
  useTemplateAwarePolicyAllowedOperation,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'

import { PolicyConfigTemplateLinkSwitcher } from '../../configTemplates'

import AAAInstancesTable from './AAAInstancesTable'
import AAAOverview       from './AAAOverview'

export function AAAPolicyDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const isServicePolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadSecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadSec = isRadSecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServicePolicyRbacEnabled
  const queryResults = useConfigTemplateQueryFnSwitcher({
    useQueryFn: supportRadSec ? useAaaPolicyCertificateQuery : useAaaPolicyQuery,
    useTemplateQueryFn: useGetAAAPolicyTemplateQuery,
    enableRbac
  })
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.AAA)

  return (
    <>
      <PageHeader
        title={queryResults.data?.name || ''}
        breadcrumb={breadcrumb}
        extra={filterByAccessForServicePolicyMutation([
          <PolicyConfigTemplateLinkSwitcher
            // eslint-disable-next-line max-len
            rbacOpsIds={useTemplateAwarePolicyAllowedOperation(PolicyType.AAA, PolicyOperation.EDIT)}
            scopeKey={getScopeKeyByPolicy(PolicyType.AAA, PolicyOperation.EDIT)}
            type={PolicyType.AAA}
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
            <AAAOverview aaaProfile={queryResults.data} />
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <AAAInstancesTable />
        </GridCol>
      </GridRow>
    </>
  )
}
