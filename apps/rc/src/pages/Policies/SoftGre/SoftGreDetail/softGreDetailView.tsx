import { useEffect, useState } from 'react'
import _ from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button,  GridCol, GridRow, Loader, PageHeader }                                                       from '@acx-ui/components'
import { useGetSoftGreViewDataListQuery }                                                                      from '@acx-ui/rc/services'
import { PolicyOperation, PolicyType, SoftGreActivationInformation, SoftGreViewData, usePolicyListBreadcrumb } from '@acx-ui/rc/utils'
import { getPolicyDetailsLink }                                                                                from '@acx-ui/rc/utils'
import { TenantLink }                                                                                          from '@acx-ui/react-router-dom'
import { WifiScopes }                                                                                          from '@acx-ui/types'
import { filterByAccess }                                                                                      from '@acx-ui/user'

import SoftGreDetailContent from './softGreDetailContent'
import SoftGreVenueDetail   from './softGreVenueDetail'

export default function SoftGreDetailView () {
  const { $t } = useIntl()
  const params = useParams()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SOFTGRE)
  const [ softGreData, setSoftGreData ] = useState<SoftGreViewData>()
  const defaultPayload = { filters: { id: [params.policyId] } }

  const { softGreDetail, isLoading } = useGetSoftGreViewDataListQuery(
    { payload: defaultPayload },
    {
      selectFromResult: ( { data, isLoading } ) => {
        return {
          softGreDetail: data?.data[0] || {} as SoftGreViewData,
          isLoading
        }
      }
    }
  )

  useEffect(() => {
    if (softGreDetail && !_.isEqual(softGreDetail, softGreData)) {
      setSoftGreData(softGreDetail)
    }
  }, [softGreDetail])

  return (
    <Loader states={[{ isLoading }]}>
      <PageHeader
        title={softGreData?.name}
        breadcrumb={breadcrumb}
        extra={
          filterByAccess([
            <TenantLink
              scopeKey={[WifiScopes.UPDATE]}
              to={getPolicyDetailsLink({
                type: PolicyType.SOFTGRE,
                oper: PolicyOperation.EDIT,
                policyId: params.policyId as string
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
          <SoftGreDetailContent data={softGreData}/>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <SoftGreVenueDetail activationInformations={
            (softGreData?.activationInformations || []) as SoftGreActivationInformation[]}
          />
        </GridCol>
      </GridRow>
    </Loader>
  )
}