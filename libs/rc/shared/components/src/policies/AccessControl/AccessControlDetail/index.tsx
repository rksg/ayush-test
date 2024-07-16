import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader }                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                            from '@acx-ui/feature-toggle'
import { useGetAccessControlProfileQuery, useGetAccessControlProfileTemplateQuery }          from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType, useConfigTemplate, useConfigTemplateQueryFnSwitcher, usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { WifiScopes }     from '@acx-ui/types'
import { filterByAccess } from '@acx-ui/user'

import { PolicyConfigTemplateLinkSwitcher } from '../../../configTemplates'

import AccessControlNetworksDetail from './AccessControlNetworksDetail'
import AccessControlOverview       from './AccessControlOverview'


export function AccessControlDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : enableRbac

  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetAccessControlProfileQuery,
    useTemplateQueryFn: useGetAccessControlProfileTemplateQuery,
    enableRbac: resolvedRbacEnabled
  })
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.ACCESS_CONTROL)

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={breadcrumb}
        extra={filterByAccess([
          <PolicyConfigTemplateLinkSwitcher
            scopeKey={[WifiScopes.UPDATE]}
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

