import { useParams } from '@acx-ui/react-router-dom'

import { VenueAnalyticsTab } from './VenueAnalyticsTab'
import { VenueClientsTab }   from './VenueClientsTab'
import { VenueDevicesTab }   from './VenueDevicesTab'
import { VenueNetworksTab }  from './VenueNetworksTab'
import { VenueOverviewTab }  from './VenueOverviewTab'
import VenuePageHeader       from './VenuePageHeader'
import { VenueServicesTab }  from './VenueServicesTab'
import { VenueTimelineTab }  from './VenueTimelineTab'

const tabs = {
  overview: VenueOverviewTab,
  analytics: VenueAnalyticsTab,
  clients: VenueClientsTab,
  devices: VenueDevicesTab,
  networks: VenueNetworksTab,
  services: VenueServicesTab,
  timeline: VenueTimelineTab
}

export function VenueDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <VenuePageHeader />
    { Tab && <Tab /> }
  </>
}
