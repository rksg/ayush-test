import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader }                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { useGetAccessControlProfileQuery, useGetAccessControlProfileTemplateQuery } from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  useConfigTemplateQueryFnSwitcher,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'

import { PolicyConfigTemplateLinkSwitcher } from '../../../configTemplates'

import AccessControlNetworksDetail from './AccessControlNetworksDetail'
import AccessControlOverview       from './AccessControlOverview'


export function AccessControlDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetAccessControlProfileQuery,
    useTemplateQueryFn: useGetAccessControlProfileTemplateQuery,
    enableRbac: enableRbac
  })
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.ACCESS_CONTROL)

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={breadcrumb}
        extra={filterByAccessForServicePolicyMutation([
          <PolicyConfigTemplateLinkSwitcher
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

