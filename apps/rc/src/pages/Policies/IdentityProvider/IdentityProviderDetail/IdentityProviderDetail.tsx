import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { useGetIdentityProviderQuery }          from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { IdentityProviderInstancesTable } from './IdentityProviderInstancesTable'
import { IdentityProviderOverview }       from './IdentityProviderOverview'


const IdentityProviderDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetIdentityProviderQuery({ params })
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.LIST })

  const breadcrumb = [
    { text: $t({ defaultMessage: 'Network Control' }) },
    { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) },
    { text: $t({ defaultMessage: 'Identity Provider' }), link: tablePath }
  ]

  return (<>
    <PageHeader
      title={data?.name}
      breadcrumb={breadcrumb}
      extra={filterByAccess([
        <TenantLink to={getPolicyDetailsLink({
          type: PolicyType.IDENTITY_PROVIDER,
          oper: PolicyOperation.EDIT,
          policyId: params.policyId as string
        })}>
          <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ])} />

    <GridRow>
      <GridCol col={{ span: 24 }}>
        {<IdentityProviderOverview />
        //data && <IdentityProviderOverview data={data} />
        }
      </GridCol>
      <GridCol col={{ span: 24 }}>
        <IdentityProviderInstancesTable />
      </GridCol>
    </GridRow>
  </>
  )

}

export default IdentityProviderDetail