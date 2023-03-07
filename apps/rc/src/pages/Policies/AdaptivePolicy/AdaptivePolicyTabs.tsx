import { useEffect, useState } from 'react'

import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import {
  useAdaptivePolicyListQuery,
  useAdaptivePolicySetListQuery,
  useRadiusAttributeGroupListQuery
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType, useTableQuery
} from '@acx-ui/rc/utils'
import { Path, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { AdaptivePolicyTabKey } from './index'

export default function AdaptivePolicyTabs () {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const navigate = useNavigate()

  const [adaptivePolicyCount, setAdaptivePolicyCount] = useState({
    policyTotalCount: 0,
    policySetTotalCount: 0,
    attributeGroupTotalCount: 0
  })

  const attributeGroupTableQuery = useTableQuery({
    useQuery: useRadiusAttributeGroupListQuery,
    defaultPayload: {}
  })

  const policyTableQuery = useTableQuery({
    useQuery: useAdaptivePolicyListQuery,
    defaultPayload: {}
  })

  const policySetTableQuery = useTableQuery({
    useQuery: useAdaptivePolicySetListQuery,
    defaultPayload: {}
  })

  useEffect(() => {
    if (attributeGroupTableQuery.data || policyTableQuery.data || policySetTableQuery.data) {
      setAdaptivePolicyCount({
        policySetTotalCount: policySetTableQuery.data?.totalCount ?? 0,
        policyTotalCount: policyTableQuery.data?.totalCount ?? 0,
        attributeGroupTotalCount: attributeGroupTableQuery.data?.totalCount ?? 0
      })
    }
  }, [attributeGroupTableQuery.data, policyTableQuery.data, policySetTableQuery.data])

  const tabsPathMapping: Record<AdaptivePolicyTabKey, Path> = {
    [AdaptivePolicyTabKey.RADIUS_ATTRIBUTE_GROUP]: useTenantLink(getPolicyRoutePath({
      type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
      oper: PolicyOperation.LIST
    })),
    [AdaptivePolicyTabKey.ADAPTIVE_POLICY]: useTenantLink(getPolicyRoutePath({
      type: PolicyType.ADAPTIVE_POLICY,
      oper: PolicyOperation.LIST
    })),
    [AdaptivePolicyTabKey.ADAPTIVE_POLICY_SET]: useTenantLink(getPolicyRoutePath({
      type: PolicyType.ADAPTIVE_POLICY_SET,
      oper: PolicyOperation.LIST
    }))
  }

  const onTabChange = (tab: string) => {
    navigate(tabsPathMapping[tab as AdaptivePolicyTabKey])
  }

  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      <Tabs.TabPane
        // eslint-disable-next-line max-len
        tab={$t({ defaultMessage: 'Adaptive Policy ({count})' }, { count: adaptivePolicyCount.policyTotalCount })}
        key={AdaptivePolicyTabKey.ADAPTIVE_POLICY}
      />
      <Tabs.TabPane
        // eslint-disable-next-line max-len
        tab={$t({ defaultMessage: 'Adaptive Policy Sets ({count})' }, { count: adaptivePolicyCount.policySetTotalCount })}
        key={AdaptivePolicyTabKey.ADAPTIVE_POLICY_SET}
      />
      <Tabs.TabPane
        // eslint-disable-next-line max-len
        tab={$t({ defaultMessage: 'RADIUS Attribute Groups ({count})' }, { count: adaptivePolicyCount.attributeGroupTotalCount })}
        key={AdaptivePolicyTabKey.RADIUS_ATTRIBUTE_GROUP}
      />
    </Tabs>
  )
}
