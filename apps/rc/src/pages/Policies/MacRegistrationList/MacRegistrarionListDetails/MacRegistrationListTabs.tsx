import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import {
  getPolicyDetailsLink,
  MacRegistrationDetailsTabKey,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import {
  Path,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

function MacRegistrationListTabs () {
  const { $t } = useIntl()
  const { policyId, activeTab } = useParams()
  const navigate = useNavigate()

  const tabsPathMapping: Record<MacRegistrationDetailsTabKey, Path> = {
    [MacRegistrationDetailsTabKey.OVERVIEW]: useTenantLink(getPolicyDetailsLink({
      type: PolicyType.MAC_REGISTRATION_LIST,
      oper: PolicyOperation.DETAIL,
      policyId: policyId!,
      activeTab: MacRegistrationDetailsTabKey.OVERVIEW
    })),
    [MacRegistrationDetailsTabKey.MAC_REGISTRATIONS]: useTenantLink(getPolicyDetailsLink({
      type: PolicyType.MAC_REGISTRATION_LIST,
      oper: PolicyOperation.DETAIL,
      policyId: policyId!,
      activeTab: MacRegistrationDetailsTabKey.MAC_REGISTRATIONS
    }))
  }

  const onTabChange = (tab: string) => {
    navigate(tabsPathMapping[tab as MacRegistrationDetailsTabKey])
  }
  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Overview' })}
        key={MacRegistrationDetailsTabKey.OVERVIEW}
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'MAC Registrations' })}
        key={MacRegistrationDetailsTabKey.MAC_REGISTRATIONS}
      />
    </Tabs>
  )
}

export default MacRegistrationListTabs
