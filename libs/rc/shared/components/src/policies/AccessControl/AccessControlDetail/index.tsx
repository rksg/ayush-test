import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import {
  useGetAccessControlProfileTemplateListQuery,
  useGetEnhancedAccessControlProfileListQuery
} from '@acx-ui/rc/services'
import {
  EnhancedAccessControlInfoType,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  useConfigTemplate,
  usePolicyListBreadcrumb, useTableQuery,
  useTemplateAwarePolicyAllowedOperation
} from '@acx-ui/rc/utils'

import { PolicyConfigTemplateLinkSwitcher } from '../../../configTemplates'

import AccessControlNetworksDetail from './AccessControlNetworksDetail'
import AccessControlOverview       from './AccessControlOverview'


export function AccessControlDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

  const data = useGetAclPolicyInstance()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.ACCESS_CONTROL)
  let breadcrumbWithSwitchMacAcl = [...breadcrumb]
  if (breadcrumbWithSwitchMacAcl.length >= 3) {
    breadcrumbWithSwitchMacAcl[2] = {
      ...breadcrumbWithSwitchMacAcl[2],
      link: 'policies/accessControl/wifi'
    }
  }

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={isSwitchMacAclEnabled ? breadcrumbWithSwitchMacAcl : breadcrumb}
        extra={filterByAccessForServicePolicyMutation([
          <PolicyConfigTemplateLinkSwitcher
            // eslint-disable-next-line max-len
            rbacOpsIds={useTemplateAwarePolicyAllowedOperation(PolicyType.ACCESS_CONTROL, PolicyOperation.EDIT)}
            scopeKey={getScopeKeyByPolicy(PolicyType.ACCESS_CONTROL, PolicyOperation.EDIT)}
            type={PolicyType.ACCESS_CONTROL}
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
          <AccessControlOverview data={data} />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <AccessControlNetworksDetail data={data} />
        </GridCol>
      </GridRow>
    </>
  )
}

const useGetAclPolicyInstance = () => {
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const isServiceRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServiceRbacEnabled

  const defaultPayload = {
    filters: { id: [params.policyId] },
    searchString: '',
    fields: [
      'id',
      'name',
      'l2AclPolicyName',
      'l2AclPolicyId',
      'l3AclPolicyName',
      'l3AclPolicyId',
      'devicePolicyName',
      'devicePolicyId',
      'applicationPolicyName',
      'applicationPolicyId',
      'clientRateUpLinkLimit',
      'clientRateDownLinkLimit',
      'networkIds',
      'networkCount'
    ],
    page: 1
  }

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedAccessControlProfileListQuery,
    defaultPayload,
    enableRbac,
    option: {
      skip: isTemplate
    }
  })

  const useAclPolicy = tableQuery?.data?.data[0]

  const templateTableQuery = useTableQuery({
    useQuery: useGetAccessControlProfileTemplateListQuery,
    defaultPayload,
    enableRbac,
    option: {
      skip: !isTemplate
    }
  })

  const useAclTemplatePolicy = templateTableQuery?.data?.data[0]

  return ((isTemplate ? useAclTemplatePolicy : useAclPolicy) || {}) as EnhancedAccessControlInfoType
}


