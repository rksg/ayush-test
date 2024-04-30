import { useParams } from 'react-router-dom'

import { goToNotFound } from '@acx-ui/user'

import { ApGroupContextProvider } from './ApGroupContextProvider'
import ApGroupIncidentsTab        from './ApGroupIncidentsTab'
import ApGroupMembersTab          from './ApGroupMembersTab'
import ApGroupNetworksTab         from './ApGroupNetworksTab'
import ApGroupPageHeader          from './ApGroupPageHeader'


const tabs = {
  members: ApGroupMembersTab,
  networks: ApGroupNetworksTab,
  incidents: ApGroupIncidentsTab
}

export default function ApGroupDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound
  return <ApGroupContextProvider>
    <ApGroupPageHeader />
    { Tab && <Tab /> }
  </ApGroupContextProvider>
}
