import { Loader }    from '@acx-ui/components'
import { useParams } from '@acx-ui/react-router-dom'

import { NetworkApsTab }       from './NetworkApsTab'
import { NetworkEventsTab }    from './NetworkEventsTab'
import { NetworkIncidentsTab } from './NetworkIncidentsTab'
import { NetworkOverviewTab }  from './NetworkOverviewTab'
import NetworkPageHeader       from './NetworkPageHeader'
import { NetworkServicesTab }  from './NetworkServicesTab'
import { NetworkVenuesTab }    from './NetworkVenuesTab'
import { useGetNetwork }       from './services'


const tabs = {
  overview: NetworkOverviewTab,
  aps: NetworkApsTab,
  venues: NetworkVenuesTab,
  services: NetworkServicesTab,
  events: NetworkEventsTab,
  incidents: NetworkIncidentsTab
}

export function NetworkDetails () {
  const query = useGetNetwork()
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <Loader states={[query]}>
    <NetworkPageHeader />
    { Tab && <Tab /> }
  </Loader>
}