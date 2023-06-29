import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol }                                                                 from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                       from '@acx-ui/feature-toggle'
import { useGetAAAProfileDetailQuery }                                                                                  from '@acx-ui/rc/services'
import { AAAPolicyType, getPolicyDetailsLink, getPolicyListRoutePath, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                   from '@acx-ui/react-router-dom'
import { filterByAccess }                                                                                               from '@acx-ui/user'

import AAAInstancesTable from './AAAInstancesTable'
import AAAOverview       from './AAAOverview'

export default function AAAPolicyDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const queryResults = useGetAAAProfileDetailQuery({ params })
  const tablePath = getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })

  return (
    <>
      <PageHeader
        title={queryResults.data?.name||''}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'RADIUS Server' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'RADIUS Server' }), link: tablePath }
        ]}
        extra={filterByAccess([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.AAA,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId as string
          })}>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Loader states={[queryResults]}>
            <AAAOverview aaaProfile={queryResults.data as AAAPolicyType} />
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <AAAInstancesTable/>
        </GridCol>
      </GridRow>
    </>
  )
}
