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
  getPolicyRoutePath,
  PolicyOperation,
  getPolicyDetailsLink,
  getPolicyListRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import RogueAPDetectionDetailContent from './RogueAPDetectionDetailContent'
import RogueAPDetectionVenueDetail   from './RogueAPDetectionVenueDetail'

export const RogueAPDetailContext = createContext({} as RogueAPDetailContextType)

export const RogueAPDetectionDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [filtersId, setFiltersId] = useState([] as string[])
  const [policyName, setPolicyName] = useState('' as string)
  // eslint-disable-next-line max-len
  const tablePath = getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST })

  return (
    <RogueAPDetailContext.Provider value={{ filtersId, setFiltersId, policyName, setPolicyName }}>
      <PageHeader
        title={policyName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'Rogue AP Detection' }), link: tablePath }
        ]}
        extra={policyName !== RogueApConstant.DefaultProfile ? filterByAccess([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.ROGUE_AP_DETECTION,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId as string
          })}>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </TenantLink>
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
