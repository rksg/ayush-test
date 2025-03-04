import { createContext, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import {
  PolicyOperation,
  PolicyType,
  WifiOperatorConstant,
  WifiOperatorDetailContextType,
  getPolicyDetailsLink,
  getScopeKeyByPolicy,
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import WifiOperatorDetailContent from './WifiOperatorDetailContent'
import WifiOperatorNetworkDetail from './WifiOperatorNetworkDetail'

export const WifiOperatorDetailContext = createContext({} as WifiOperatorDetailContextType)

export const WifiOperatorDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [filtersId, setFiltersId] = useState([] as string[])
  const [policyName, setPolicyName] = useState('' as string)

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.WIFI_OPERATOR)

  return (
    <WifiOperatorDetailContext.Provider
      value={{ filtersId, setFiltersId, policyName, setPolicyName }}>
      <PageHeader
        title={policyName}
        breadcrumb={breadcrumb}
        extra={policyName !== WifiOperatorConstant.DefaultProfile
          ? filterByAccessForServicePolicyMutation([
            <TenantLink
              to={getPolicyDetailsLink({
                type: PolicyType.WIFI_OPERATOR,
                oper: PolicyOperation.EDIT,
                policyId: params.policyId as string
              })}
              scopeKey={getScopeKeyByPolicy(PolicyType.WIFI_OPERATOR, PolicyOperation.EDIT)}
              rbacOpsIds={getPolicyAllowedOperation(PolicyType.WIFI_OPERATOR, PolicyOperation.EDIT)}
            >
              <Button key={'configure'} type={'primary'}>
                {$t({ defaultMessage: 'Configure' })}
              </Button>
            </TenantLink>
          ])
          : []}
      />

      <GridRow>
        <GridCol col={{ span: 24 }}>
          <WifiOperatorDetailContent />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          { (filtersId.length > 0) && <WifiOperatorNetworkDetail /> }
        </GridCol>
      </GridRow>
    </WifiOperatorDetailContext.Provider>
  )
}
