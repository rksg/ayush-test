import React, { createContext, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Button,
  PageHeader
} from '@acx-ui/components'
import {
  PolicyType,
  RogueApConstant,
  RogueAPDetailContextType,
  PolicyOperation,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

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

  return (
    <RogueAPDetailContext.Provider value={{ filtersId, setFiltersId, policyName, setPolicyName }}>
      <PageHeader
        title={policyName}
        breadcrumb={breadcrumb}
        extra={policyName !== RogueApConstant.DefaultProfile ? filterByAccess([
          <PolicyConfigTemplateLinkSwitcher
            type={PolicyType.ROGUE_AP_DETECTION}
            oper={PolicyOperation.EDIT}
            policyId={params.policyId!}
            children={
              <Button key={'configure'} type={'primary'}>
                {$t({ defaultMessage: 'Configure' })}
              </Button>
            }
          />
        ]) : []}
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
