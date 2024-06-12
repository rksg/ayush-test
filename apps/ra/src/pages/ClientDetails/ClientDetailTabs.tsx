import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { hasPermission }                         from '@acx-ui/user'

enum ClientDetailTabEnum {
  TROUBLESHOOTING = 'troubleshooting',
  REPORTS = 'reports'
}

interface Tab {
  key: ClientDetailTabEnum,
  title: string
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const troubleshootingTab = {
    key: ClientDetailTabEnum.TROUBLESHOOTING,
    title: $t({ defaultMessage: 'Troubleshooting' })
  }
  const reportsTab = {
    key: ClientDetailTabEnum.REPORTS,
    title: $t({ defaultMessage: 'Reports' })
  }

  let tabsWithPermissions = [] as Tab[]
  if (hasPermission({ permission: 'READ_CLIENT_TROUBLESHOOTING' })) {
    tabsWithPermissions.push(troubleshootingTab as Tab)
  }
  if (hasPermission({ permission: 'READ_WIRELESS_CLIENTS_REPORT' })) {
    tabsWithPermissions.push(reportsTab as Tab)
  }

  return tabsWithPermissions
}

function ClientDetailTabs () {
  const params = useParams()
  const basePath = useTenantLink(`/users/wifi/clients/${params.clientId}/details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const tabs = useTabs()
  return (tabs.length <= 1
    ? <></>
    :
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
    </Tabs>
  )
}

export default ClientDetailTabs
