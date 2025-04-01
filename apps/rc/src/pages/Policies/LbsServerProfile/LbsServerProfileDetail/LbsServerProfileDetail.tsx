/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { useGetLbsServerProfileListQuery }      from '@acx-ui/rc/services'
import {
  LbsServerProfileViewModel,
  PolicyOperation,
  PolicyType,
  filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink,
  getScopeKeyByPolicy,
  usePolicyListBreadcrumb,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink }               from '@acx-ui/react-router-dom'
import { hasCrossVenuesPermission } from '@acx-ui/user'

import { LbsServerProfileInstancesTable } from './LbsServerProfileInstancesTable'
import { LbsServerProfileOverview }       from './LbsServerProfileOverview'

const LbsServerProfileDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { policyId } = params

  const [data, setData] = useState<LbsServerProfileViewModel>()

  const { data: lbsServerProfileList } = useGetLbsServerProfileListQuery({
    params,
    payload: {
      fields: ['id', 'name', 'lbsServerVenueName', 'server', 'venueIds', 'serverConnected'],
      searchString: '',
      filters: { id: [policyId] }
    }
  })

  useEffect(() => {
    const viewModelData = lbsServerProfileList?.data
    if (viewModelData && viewModelData.length > 0) {
      setData(viewModelData[0])
    }
  }, [lbsServerProfileList?.data])

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.LBS_SERVER_PROFILE)

  return (<>
    <PageHeader
      title={data?.name || ''}
      breadcrumb={breadcrumb}
      extra={hasCrossVenuesPermission() && filterByAccessForServicePolicyMutation([
        <TenantLink to={getPolicyDetailsLink({
          type: PolicyType.LBS_SERVER_PROFILE,
          oper: PolicyOperation.EDIT,
          policyId: policyId as string
        })}
        scopeKey={getScopeKeyByPolicy(PolicyType.LBS_SERVER_PROFILE, PolicyOperation.EDIT)}
        rbacOpsIds={getPolicyAllowedOperation(PolicyType.LBS_SERVER_PROFILE, PolicyOperation.EDIT)}>
          <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ])} />

    {data &&
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <LbsServerProfileOverview data={data} />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <LbsServerProfileInstancesTable data={data} />
        </GridCol>
      </GridRow>
    }
  </>
  )

}

export default LbsServerProfileDetail
