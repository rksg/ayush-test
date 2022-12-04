import { useParams } from '@acx-ui/react-router-dom'

import { ClientsTab } from './ClientsTab'
import { GuestsTab }  from './GuestsTab'
import PageHeader     from './PageHeader'

const tabs = {
  clients: ClientsTab,
  guests: GuestsTab
}

export default function ClientList () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <PageHeader />
    { Tab && <Tab /> }
  </>
}