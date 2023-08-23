import { useParams } from '@acx-ui/react-router-dom'
import { hasAccess } from '@acx-ui/user'

import { ApAnalyticsTab }       from './ApAnalyticsTab'
import { ApClientsTab }         from './ApClientsTab'
import { ApContextProvider }    from './ApContextProvider'
import { ApNeighborsTab }       from './ApNeighbors'
import { ApNetworksTab }        from './ApNetworksTab'
import { ApOverviewTab }        from './ApOverviewTab'
import ApPageHeader             from './ApPageHeader'
import { ApReportsTab }         from './ApReportsTab'
import { ApServicesTab }        from './ApServicesTab'
import { ApTimelineTab }        from './ApTimelineTab'
import { ApTroubleshootingTab } from './ApTroubleshootingTab'

const tabs = {
  overview: ApOverviewTab,
  analytics: () => hasAccess() ? <ApAnalyticsTab/> : null,
  troubleshooting: ApTroubleshootingTab,
  reports: ApReportsTab,
  networks: ApNetworksTab,
  clients: ApClientsTab,
  services: ApServicesTab,
  timeline: ApTimelineTab,
  neighbors: ApNeighborsTab
}

export default function ApDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <ApContextProvider>
    <ApPageHeader />
    { Tab && <Tab /> }
  </ApContextProvider>
}
