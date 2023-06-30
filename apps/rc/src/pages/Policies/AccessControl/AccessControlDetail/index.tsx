import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { useGetAccessControlProfileQuery }      from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import AccessControlNetworksDetail from './AccessControlNetworksDetail'
import AccessControlOverview       from './AccessControlOverview'


export default function AccessControlDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })

  const { data } = useGetAccessControlProfileQuery({ params })

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Access Control' }),
            link: tablePath
          }
        ] : [
          { text: $t({ defaultMessage: 'Policies' }), link: getPolicyListRoutePath(true) }
        ]}
        extra={filterByAccess([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.ACCESS_CONTROL,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId as string
          })}>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <AccessControlOverview data={data} />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <AccessControlNetworksDetail data={data} />
        </GridCol>
      </GridRow>
    </>
  )
}

