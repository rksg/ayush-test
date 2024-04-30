import { useIntl } from 'react-intl'

import { Tabs }                  from '@acx-ui/components'
import { WorkflowDetailsTabKey } from '@acx-ui/rc/utils'
import {
  getPolicyDetailsLink,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink, Path } from '@acx-ui/react-router-dom'
function WorkflowTabs () {
  const { $t } = useIntl()
  const { policyId, activeTab } = useParams()
  const navigate = useNavigate()


  const tabsPathMapping: Record<WorkflowDetailsTabKey, Path> = {
    [WorkflowDetailsTabKey.OVERVIEW]: useTenantLink(getPolicyDetailsLink({
      type: PolicyType.WORKFLOW,
      oper: PolicyOperation.DETAIL,
      policyId: policyId!,
      activeTab: WorkflowDetailsTabKey.OVERVIEW
    })),
    [WorkflowDetailsTabKey.VERSION_HISTORY]: useTenantLink(getPolicyDetailsLink({
      type: PolicyType.WORKFLOW,
      oper: PolicyOperation.DETAIL,
      policyId: policyId!,
      activeTab: WorkflowDetailsTabKey.VERSION_HISTORY
    }))
  }

  const onTabChange = (tab: string) => {
    navigate(tabsPathMapping[tab as WorkflowDetailsTabKey])
  }
  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Overview' })}
        key={WorkflowDetailsTabKey.OVERVIEW}
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Version History' })}
        key={WorkflowDetailsTabKey.VERSION_HISTORY}
      />
    </Tabs>
  )
}

export default WorkflowTabs
