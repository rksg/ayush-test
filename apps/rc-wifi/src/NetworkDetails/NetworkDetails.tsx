import React         from 'react'
import { useParams } from '@acx-ui/react-router-dom'

import { NetworkApsTab }       from './NetworkApsTab'
import { NetworkEventsTab }    from './NetworkEventsTab'
import { NetworkIncidentsTab } from './NetworkIncidentsTab'
import { NetworkOverviewTab }  from './NetworkOverviewTab'
import NetworkPageHeader       from './NetworkPageHeader'
import { NetworkServicesTab }  from './NetworkServicesTab'
import { NetworkVenuesTab }    from './NetworkVenuesTab'


const tabs = {
  overview: NetworkOverviewTab,
  aps: NetworkApsTab,
  venues: NetworkVenuesTab,
  services: NetworkServicesTab,
  events: NetworkEventsTab,
  incidents: NetworkIncidentsTab
}

export function NetworkDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <NetworkPageHeader />
    { Tab && <Tab /> }
  </>
}
