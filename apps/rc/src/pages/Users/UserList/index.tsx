import { useParams } from '@acx-ui/react-router-dom'

import { UserClientsTab } from './UserClientsTab'
import { UserGuestsTab }  from './UserGuestsTab'
import UsersPageHeader    from './UsersPageHeader'

const tabs = {
  clients: UserClientsTab,
  guests: UserGuestsTab
}

export default function UserList () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <UsersPageHeader />
    { Tab && <Tab /> }
  </>
}