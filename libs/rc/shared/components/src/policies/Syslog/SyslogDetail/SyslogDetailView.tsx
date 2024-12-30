import React, { createContext, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import {
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  SyslogConstant,
  SyslogDetailContextType,
  usePolicyListBreadcrumb,
  useTemplateAwarePolicyAllowedOperation
} from '@acx-ui/rc/utils'

import { PolicyConfigTemplateLinkSwitcher } from '../../../configTemplates'

import SyslogDetailContent from './SyslogDetailContent'
import SyslogVenueDetail   from './SyslogVenueDetail'

export const SyslogDetailContext = createContext({} as SyslogDetailContextType)

export const SyslogDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [filtersId, setFiltersId] = useState([] as string[])
  const [policyName, setPolicyName] = useState('' as string)
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SYSLOG)

  const allowedOperationForEdit = useTemplateAwarePolicyAllowedOperation(
    PolicyType.SYSLOG, PolicyOperation.EDIT
  )

  return (
    <SyslogDetailContext.Provider value={{ filtersId, setFiltersId, policyName, setPolicyName }}>
      <PageHeader
        title={policyName}
        breadcrumb={breadcrumb}
        extra={policyName !== SyslogConstant.DefaultProfile
          ? filterByAccessForServicePolicyMutation([
            <PolicyConfigTemplateLinkSwitcher
              rbacOpsIds={allowedOperationForEdit}
              scopeKey={getScopeKeyByPolicy(PolicyType.SYSLOG, PolicyOperation.EDIT)}
              type={PolicyType.SYSLOG}
              oper={PolicyOperation.EDIT}
              policyId={params.policyId!}
              children={
                <Button key={'configure'} type={'primary'}>
                  {$t({ defaultMessage: 'Configure' })}
                </Button>
              }
            />
          ])
          : []}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <SyslogDetailContent />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          { (filtersId.length > 0) && <SyslogVenueDetail /> }
        </GridCol>
      </GridRow>
    </SyslogDetailContext.Provider>
  )
}
