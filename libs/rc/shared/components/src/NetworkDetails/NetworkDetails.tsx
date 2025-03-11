import { useState } from 'react'

import { useConfigTemplate }              from '@acx-ui/rc/utils'
import { useParams }                      from '@acx-ui/react-router-dom'
import { goToNotFound, hasRaiPermission } from '@acx-ui/user'

import { NetworkApsTab }       from './NetworkApsTab'
import { NetworkClientsTab }   from './NetworkClientsTab'
import { NetworkIncidentsTab } from './NetworkIncidentsTab'
import { NetworkOverviewTab }  from './NetworkOverviewTab'
import NetworkPageHeader       from './NetworkPageHeader'
import { NetworkServicesTab }  from './NetworkServicesTab'
import { NetworkTimelineTab }  from './NetworkTimelineTab'
import { NetworkVenuesTab }    from './NetworkVenuesTab'

export function NetworkDetails () {
  const { activeTab } = useParams()
  const GenTabs = () => {
    const { isTemplate } = useConfigTemplate()
    if (isTemplate) {
      return {
        venues: NetworkVenuesTab
      }
    }

    return {
      aps: NetworkApsTab,
      venues: NetworkVenuesTab,
      services: NetworkServicesTab,
      timeline: NetworkTimelineTab,
      incidents: () => hasRaiPermission('READ_INCIDENTS') ? <NetworkIncidentsTab/> : null,
      clients: NetworkClientsTab
    }
  }

  const tabs = GenTabs()

  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound
  const [selectedVenues, setSelectedVenues] = useState<string[]>([])

  switch(activeTab) {
    case 'overview':
      return (
        <>
          <NetworkPageHeader
            selectedVenues={selectedVenues}
            setSelectedVenues={setSelectedVenues}
          />
          { <NetworkOverviewTab selectedVenues={selectedVenues} /> }
        </>
      )
    case 'overview-no-config':
      return (
        <>
          <NetworkPageHeader
            selectedVenues={selectedVenues}
            setSelectedVenues={setSelectedVenues}
            noConfig={true}
          />
          { <NetworkOverviewTab selectedVenues={selectedVenues} /> }
        </>
      )
    default:
      return (
        <>
          <NetworkPageHeader />
          { Tab && <Tab /> }
        </>
      )
  }
}
