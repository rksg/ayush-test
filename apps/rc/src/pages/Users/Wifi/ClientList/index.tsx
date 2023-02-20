import { ClientDualTable } from '@acx-ui/rc/components'
import { useParams }       from '@acx-ui/react-router-dom'

import { GuestsTab } from './GuestsTab'
import PageHeader    from './PageHeader'

const tabs = {
  clients: ClientDualTable,
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