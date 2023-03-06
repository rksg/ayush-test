import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { hasAccesses }                          from '@acx-ui/user'
import { useGetAccessControlProfileQuery }      from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import AccessControlNetworksDetail from './AccessControlNetworksDetail'
import AccessControlOverview       from './AccessControlOverview'


export default function AccessControlDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const { data } = useGetAccessControlProfileQuery({ params })

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: getPolicyListRoutePath(true) }
        ]}
        extra={hasAccesses([
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

