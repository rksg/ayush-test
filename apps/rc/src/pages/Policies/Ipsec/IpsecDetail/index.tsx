import { useIntl } from 'react-intl'

import { Loader, GridRow, GridCol,PageHeader, Button } from '@acx-ui/components'
import { useGetIpsecViewDataListQuery }                from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink,
  getScopeKeyByPolicy,
  IpsecViewData,
  PolicyOperation,
  PolicyType,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import IpsecDetailContent from './IpsecDetailContent'
import IpsecVenueDetail   from './IpsecVenueDetail'

export default function IpsecDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.IPSEC)
  const { ipsecDetail, isLoading } = useGetIpsecViewDataListQuery(
    { payload: { filters: { id: [params.policyId] } } },
    {
      selectFromResult: ( { data, isLoading } ) => {
        return {
          ipsecDetail: data?.data?.[0] || {} as IpsecViewData,
          isLoading
        }
      }
    }
  )

  return (
    <Loader states={[{ isLoading }]}>
      <PageHeader
        title={ipsecDetail?.name}
        breadcrumb={breadcrumb}
        extra={
          params.policyId && filterByAccessForServicePolicyMutation([
            <TenantLink
              scopeKey={getScopeKeyByPolicy(PolicyType.IPSEC, PolicyOperation.EDIT)}
              to={getPolicyDetailsLink({
                type: PolicyType.IPSEC,
                oper: PolicyOperation.EDIT,
                policyId: params.policyId
              })}
            >
              <Button key={'configure'} type={'primary'}>
                {$t({ defaultMessage: 'Configure' })}
              </Button>
            </TenantLink>
          ])
        }
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <IpsecDetailContent data={ipsecDetail}/>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <IpsecVenueDetail data={ipsecDetail} />
        </GridCol>
      </GridRow>
    </Loader>
  )
}