import { useParams } from '@acx-ui/react-router-dom'

import ClientDetailPageHeader       from './ClientDetailPageHeader'
import { ClientOverviewTab }        from './ClientOverviewTab'
import { ClientReportsTab }         from './ClientReportsTab'
import { ClientTimelineTab }        from './ClientTimelineTab'
import { ClientTroubleshootingTab } from './ClientTroubleshootingTab'

const tabs = {
  overview: ClientOverviewTab,
  troubleshooting: ClientTroubleshootingTab,
  reports: ClientReportsTab,
  timeline: ClientTimelineTab
}

export default function ClientDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <ClientDetailPageHeader />
    { Tab && <Tab /> }
  </>
}
