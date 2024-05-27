import { useParams } from 'react-router-dom'

import { useConfigTemplate } from '@acx-ui/rc/utils'
import { goToNotFound }      from '@acx-ui/user'

import { ApGroupContextProvider } from './ApGroupContextProvider'
import ApGroupIncidentsTab        from './ApGroupIncidentsTab'
import ApGroupMembersTab          from './ApGroupMembersTab'
import ApGroupNetworksTab         from './ApGroupNetworksTab'
import ApGroupPageHeader          from './ApGroupPageHeader'


const generalTabs = {
  members: ApGroupMembersTab,
  networks: ApGroupNetworksTab,
  incidents: ApGroupIncidentsTab
}

const configTemplateTabs = {
  networks: ApGroupNetworksTab
}

export function ApGroupDetails () {
  const { activeTab } = useParams()
  const { isTemplate } = useConfigTemplate()
  const tabs = isTemplate ? configTemplateTabs : generalTabs
  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound
  return <ApGroupContextProvider>
    <ApGroupPageHeader />
    { Tab && <Tab /> }
  </ApGroupContextProvider>
}
