import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { useMacRegistrationsQuery } from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  MacRegistrationDetailsTabKey,
  PolicyOperation,
  PolicyType, useTableQuery
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

  const tableQuery = useTableQuery({
    useQuery: useMacRegistrationsQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'macAddress',
      sortOrder: 'asc'
    }
  })

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
        tab={$t({ defaultMessage: 'MAC Registrations ({count})' },
          { count: tableQuery.data?.totalCount ?? 0 })}
        key={MacRegistrationDetailsTabKey.MAC_REGISTRATIONS}
      />
    </Tabs>
  )
}

export default MacRegistrationListTabs
