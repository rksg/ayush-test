import { useConfigTemplate } from '@acx-ui/rc/utils'
import { useParams }         from '@acx-ui/react-router-dom'
import { hasAccess }         from '@acx-ui/user'

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
        networks: VenueNetworksTab
      }
    }

    return {
      overview: VenueOverviewTab,
      analytics: () => hasAccess() ? <VenueAnalyticsTab/> : null,
      clients: VenueClientsTab,
      devices: VenueDevicesTab,
      networks: VenueNetworksTab,
      units: VenuePropertyTab,
      services: VenueServicesTab,
      timeline: VenueTimelineTab
    }
  }

  const tabs = GenTabs()

  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <VenuePageHeader />
    { Tab && <Tab /> }
  </>
}
