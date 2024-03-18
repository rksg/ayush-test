import { createContext, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader }                                                                                                               from '@acx-ui/components'
import { PolicyOperation, PolicyType, WifiOperatorConstant, WifiOperatorDetailContextType, getPolicyDetailsLink, getPolicyListRoutePath, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                                                                              from '@acx-ui/react-router-dom'
import { filterByAccess }                                                                                                                                     from '@acx-ui/user'

import WifiOperatorDetailContent from './WifiOperatorDetailContent'
import WifiOperatorNetworkDetail from './WifiOperatorNetworkDetail'

export const WifiOperatorDetailContext = createContext({} as WifiOperatorDetailContextType)

export const WifiOperatorDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [filtersId, setFiltersId] = useState([] as string[])
  const [policyName, setPolicyName] = useState('' as string)
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.LIST })

  return (
    <WifiOperatorDetailContext.Provider
      value={{ filtersId, setFiltersId, policyName, setPolicyName }}>
      <PageHeader
        title={policyName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Wi-Fi Operator' }),
            link: tablePath
          }
        ]}
        extra={policyName !== WifiOperatorConstant.DefaultProfile ? filterByAccess([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.WIFI_OPERATOR,
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
          <WifiOperatorDetailContent />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          { (filtersId.length > 0) && <WifiOperatorNetworkDetail /> }
        </GridCol>
      </GridRow>
    </WifiOperatorDetailContext.Provider>
  )
}