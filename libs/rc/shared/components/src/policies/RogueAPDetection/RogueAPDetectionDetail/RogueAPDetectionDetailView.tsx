import React, { createContext, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import {
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  RogueApConstant,
  RogueAPDetailContextType,
  usePolicyListBreadcrumb,
  useTemplateAwarePolicyAllowedOperation
} from '@acx-ui/rc/utils'

import { PolicyConfigTemplateLinkSwitcher } from '../../../configTemplates'

import RogueAPDetectionDetailContent from './RogueAPDetectionDetailContent'
import RogueAPDetectionVenueDetail   from './RogueAPDetectionVenueDetail'

export const RogueAPDetailContext = createContext({} as RogueAPDetailContextType)

export const RogueAPDetectionDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [filtersId, setFiltersId] = useState([] as string[])
  const [policyName, setPolicyName] = useState('' as string)

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.ROGUE_AP_DETECTION)
  const allowedOperationForEdit = useTemplateAwarePolicyAllowedOperation(
    PolicyType.ROGUE_AP_DETECTION, PolicyOperation.EDIT
  )

  return (
    <RogueAPDetailContext.Provider value={{ filtersId, setFiltersId, policyName, setPolicyName }}>
      <PageHeader
        title={policyName}
        breadcrumb={breadcrumb}
        extra={policyName !== RogueApConstant.DefaultProfile
          ? filterByAccessForServicePolicyMutation([
            <PolicyConfigTemplateLinkSwitcher
              rbacOpsIds={allowedOperationForEdit}
              scopeKey={getScopeKeyByPolicy(PolicyType.ROGUE_AP_DETECTION, PolicyOperation.EDIT)}
              type={PolicyType.ROGUE_AP_DETECTION}
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
          <RogueAPDetectionDetailContent />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          { filtersId.length !== 0 && <RogueAPDetectionVenueDetail /> }
        </GridCol>
      </GridRow>
    </RogueAPDetailContext.Provider>
  )
}
