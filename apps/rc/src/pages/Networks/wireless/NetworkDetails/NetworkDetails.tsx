import { useState } from 'react'

import { useParams } from '@acx-ui/react-router-dom'
import { hasAccess } from '@acx-ui/user'

import { NetworkApsTab }       from './NetworkApsTab'
import { NetworkIncidentsTab } from './NetworkIncidentsTab'
import { NetworkOverviewTab }  from './NetworkOverviewTab'
import NetworkPageHeader       from './NetworkPageHeader'
import { NetworkServicesTab }  from './NetworkServicesTab'
import { NetworkTimelineTab }  from './NetworkTimelineTab'
import { NetworkVenuesTab }    from './NetworkVenuesTab'

const tabs = {
  aps: NetworkApsTab,
  venues: NetworkVenuesTab,
  services: NetworkServicesTab,
  timeline: NetworkTimelineTab,
  incidents: () => hasAccess() ? <NetworkIncidentsTab/> : null
}

export default function NetworkDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  const [selectedVenues, setSelectedVenues] = useState<string[]>([])
  return activeTab === 'overview'
    ? <>
      <NetworkPageHeader selectedVenues={selectedVenues} setSelectedVenues={setSelectedVenues} />
      { <NetworkOverviewTab selectedVenues={selectedVenues} /> }
    </>
    : <>
      <NetworkPageHeader />
      { Tab && <Tab /> }
    </>
}
