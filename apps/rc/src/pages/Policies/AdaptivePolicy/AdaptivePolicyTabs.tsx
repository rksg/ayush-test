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
import { Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { AdaptivePolicyTabKey } from './index'

export default function AdaptivePolicyTabs (props: { activeTab: AdaptivePolicyTabKey }) {
  const { $t } = useIntl()
  const { activeTab } = props
  const navigate = useNavigate()

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
        tab={$t({ defaultMessage: 'Adaptive Policy ({count})' }, { count: policyTableQuery.data?.totalCount ?? 0 })}
        key={AdaptivePolicyTabKey.ADAPTIVE_POLICY}
      />
      <Tabs.TabPane
        // eslint-disable-next-line max-len
        tab={$t({ defaultMessage: 'Adaptive Policy Sets ({count})' }, { count: policySetTableQuery.data?.totalCount ?? 0 })}
        key={AdaptivePolicyTabKey.ADAPTIVE_POLICY_SET}
      />
      <Tabs.TabPane
        // eslint-disable-next-line max-len
        tab={$t({ defaultMessage: 'RADIUS Attribute Groups ({count})' }, { count: attributeGroupTableQuery.data?.totalCount ?? 0 })}
        key={AdaptivePolicyTabKey.RADIUS_ATTRIBUTE_GROUP}
      />
    </Tabs>
  )
}
