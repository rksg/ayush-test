import { ApTable }   from '@acx-ui/rc/components'
import { useParams } from '@acx-ui/react-router-dom'

import { NetworkIncidentsTab } from './NetworkIncidentsTab'
import { NetworkOverviewTab }  from './NetworkOverviewTab'
import NetworkPageHeader       from './NetworkPageHeader'
import { NetworkServicesTab }  from './NetworkServicesTab'
import { NetworkTimelineTab }  from './NetworkTimelineTab'
import { NetworkVenuesTab }    from './NetworkVenuesTab'

const tabs = {
  overview: NetworkOverviewTab,
  aps: ApTable,
  venues: NetworkVenuesTab,
  services: NetworkServicesTab,
  timeline: NetworkTimelineTab,
  incidents: NetworkIncidentsTab
}

export default function NetworkDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <NetworkPageHeader />
    { Tab && <Tab /> }
  </>
}
