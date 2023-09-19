import { useParams } from '@acx-ui/react-router-dom'

import { ClientDetailPageHeader }   from './ClientDetailPageHeader'
import { ClientTroubleshootingTab } from './ClientTroubleshooting'

const tabs = {
  overview: () => <div>overview</div>,
  troubleshooting: ClientTroubleshootingTab,
  reports: () => <div>reports</div>
}

const ClientDetails = () => {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <ClientDetailPageHeader />
    { Tab && <Tab />}
  </>
}

export default ClientDetails
