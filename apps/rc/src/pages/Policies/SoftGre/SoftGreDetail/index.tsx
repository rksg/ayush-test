import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button,  GridCol, GridRow, Loader, PageHeader }                                                                                                                 from '@acx-ui/components'
import { useGetSoftGreViewDataListQuery }                                                                                                                                from '@acx-ui/rc/services'
import { filterByAccessForServicePolicyMutation, getPolicyAllowedOperation, getScopeKeyByPolicy, PolicyOperation, PolicyType, SoftGreViewData, usePolicyListBreadcrumb } from '@acx-ui/rc/utils'
import { getPolicyDetailsLink }                                                                                                                                          from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                                                    from '@acx-ui/react-router-dom'

import SoftGreDetailContent from './SoftGreDetailContent'
import SoftGreVenueDetail   from './SoftGreVenueDetail'

export default function SoftGreDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SOFTGRE)
  const { softGreDetail, isLoading } = useGetSoftGreViewDataListQuery(
    { payload: { filters: { id: [params.policyId] } } },
    {
      selectFromResult: ( { data, isLoading } ) => {
        return {
          softGreDetail: data?.data?.[0] || {} as SoftGreViewData,
          isLoading
        }
      }
    }
  )

  return (
    <Loader states={[{ isLoading }]}>
      <PageHeader
        title={softGreDetail?.name}
        breadcrumb={breadcrumb}
        extra={
          params.policyId && filterByAccessForServicePolicyMutation([
            <TenantLink
              scopeKey={getScopeKeyByPolicy(PolicyType.SOFTGRE, PolicyOperation.EDIT)}
              rbacOpsIds={getPolicyAllowedOperation(PolicyType.SOFTGRE, PolicyOperation.EDIT)}
              to={getPolicyDetailsLink({
                type: PolicyType.SOFTGRE,
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
          <SoftGreDetailContent data={softGreDetail}/>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <SoftGreVenueDetail data={softGreDetail} />
        </GridCol>
      </GridRow>
    </Loader>
  )
}