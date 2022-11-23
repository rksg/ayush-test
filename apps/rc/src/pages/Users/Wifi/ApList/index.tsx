import { useParams } from '@acx-ui/react-router-dom'

import { ApClientsTab } from './ApClientsTab'
import { ApGuestsTab }  from './ApGuestsTab'
import ApPageHeader     from './ApPageHeader'

const tabs = {
  clients: ApClientsTab,
  guests: ApGuestsTab
}

export default function ApList () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <ApPageHeader />
    { Tab && <Tab /> }
  </>
}