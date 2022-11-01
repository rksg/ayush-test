import { useParams } from '@acx-ui/react-router-dom'

import { ApAnalyticsTab }       from './ApAnalyticsTab'
import { ApClientsTab }         from './ApClientsTab'
import { ApNetworksTab }        from './ApNetworksTab'
import { ApOverviewTab }        from './ApOverviewTab'
import ApPageHeader             from './ApPageHeader'
import { ApReportsTab }         from './ApReportsTab'
import { ApServicesTab }        from './ApServicesTab'
import { ApTimelineTab }        from './ApTimelineTab'
import { ApTroubleshootingTab } from './ApTroubleshootingTab'

const tabs = {
  overview: ApOverviewTab,
  analytics: ApAnalyticsTab,
  troubleshooting: ApTroubleshootingTab,
  reports: ApReportsTab,
  networks: ApNetworksTab,
  clients: ApClientsTab,
  services: ApServicesTab,
  timeline: ApTimelineTab
}

export default function ApDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <ApPageHeader />
    { Tab && <Tab /> }
  </>
}
