import { useConfigTemplate }              from '@acx-ui/rc/utils'
import { useParams }                      from '@acx-ui/react-router-dom'
import { goToNotFound, hasRaiPermission } from '@acx-ui/user'

import { VenueAnalyticsTab } from './VenueAnalyticsTab'
import { VenueClientsTab }   from './VenueClientsTab'
import { VenueDevicesTab }   from './VenueDevicesTab'
import { VenueNetworksTab }  from './VenueNetworksTab'
import { VenueOverviewTab }  from './VenueOverviewTab'
import VenuePageHeader       from './VenuePageHeader'
import { VenuePropertyTab }  from './VenuePropertyTab'
import { VenueServicesTab }  from './VenueServicesTab'
import { VenueTimelineTab }  from './VenueTimelineTab'


export function VenueDetails () {
  const { activeTab } = useParams()
  const GenTabs = () => {
    const { isTemplate } = useConfigTemplate()
    if (isTemplate) {
      return {
        networks: VenueNetworksTab,
        services: VenueServicesTab
      }
    }

    return {
      overview: VenueOverviewTab,
      analytics: () => hasRaiPermission('READ_INCIDENTS') ? <VenueAnalyticsTab/> : null,
      clients: VenueClientsTab,
      devices: VenueDevicesTab,
      networks: VenueNetworksTab,
      units: VenuePropertyTab,
      services: VenueServicesTab,
      timeline: VenueTimelineTab
    }
  }

  const tabs = GenTabs()

  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound
  return <>
    <VenuePageHeader />
    { Tab && <Tab /> }
  </>
}
