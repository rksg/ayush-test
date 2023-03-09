import { useState } from 'react'

import { ApTable }   from '@acx-ui/rc/components'
import { useParams } from '@acx-ui/react-router-dom'

import { NetworkIncidentsTab } from './NetworkIncidentsTab'
import { NetworkOverviewTab }  from './NetworkOverviewTab'
import NetworkPageHeader       from './NetworkPageHeader'
import { NetworkServicesTab }  from './NetworkServicesTab'
import { NetworkTimelineTab }  from './NetworkTimelineTab'
import { NetworkVenuesTab }    from './NetworkVenuesTab'

const tabs = {
  aps: ApTable,
  venues: NetworkVenuesTab,
  services: NetworkServicesTab,
  timeline: NetworkTimelineTab,
  incidents: NetworkIncidentsTab
}

export default function NetworkDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  const [selectedVenues, setSelectedVenues] = useState<string[]>([])
  return activeTab === 'overview'
    ? <>
      <NetworkPageHeader setSelectedVenues={setSelectedVenues} />
      { <NetworkOverviewTab selectedVenues={selectedVenues} /> }
    </>
    : <>
      <NetworkPageHeader />
      <Tab />
    </>
}
