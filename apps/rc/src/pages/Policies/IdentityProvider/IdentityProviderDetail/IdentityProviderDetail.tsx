import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { useGetIdentityProviderListQuery }      from '@acx-ui/rc/services'
import {
  IdentityProviderViewModel,
  PolicyOperation,
  PolicyType,
  filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink,
  getScopeKeyByPolicy,
  usePolicyListBreadcrumb,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { IdentityProviderInstancesTable } from './IdentityProviderInstancesTable'
import { IdentityProviderOverview }       from './IdentityProviderOverview'

const IdentityProviderDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { policyId } = params

  const [data, setData] = useState<IdentityProviderViewModel>()

  const { data: identityProviderList } = useGetIdentityProviderListQuery({
    params,
    payload: {
      fields: ['id', 'name', 'wifiNetworkIds',
        'naiRealms', 'plmns', 'roamConsortiumOIs',
        'authRadiusId', 'accountingRadiusId'],
      searchString: '',
      filters: { id: [policyId] }
    }
  })

  useEffect(() => {
    const viewModelData = identityProviderList?.data
    if (viewModelData && viewModelData.length > 0) {
      setData(viewModelData[0])
    }
  }, [identityProviderList?.data])

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.IDENTITY_PROVIDER)

  return (<>
    <PageHeader
      title={data?.name || ''}
      breadcrumb={breadcrumb}
      extra={filterByAccessForServicePolicyMutation([
        <TenantLink to={getPolicyDetailsLink({
          type: PolicyType.IDENTITY_PROVIDER,
          oper: PolicyOperation.EDIT,
          policyId: policyId as string
        })}
        scopeKey={getScopeKeyByPolicy(PolicyType.IDENTITY_PROVIDER, PolicyOperation.EDIT)}
        rbacOpsIds={getPolicyAllowedOperation(PolicyType.IDENTITY_PROVIDER, PolicyOperation.EDIT)}>
          <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ])} />

    { data &&
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <IdentityProviderOverview data={data} />
      </GridCol>
      <GridCol col={{ span: 24 }}>
        <IdentityProviderInstancesTable data={data}/>
      </GridCol>
    </GridRow>
    }
  </>
  )

}

export default IdentityProviderDetail