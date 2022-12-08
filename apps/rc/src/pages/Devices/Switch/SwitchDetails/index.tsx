import { useParams } from 'react-router-dom'

import { SwitchClientsTab }         from './SwitchClientsTab'
import { SwitchConfigurationTab }   from './SwitchConfigurationTab'
import { SwitchDhcpTab }            from './SwitchDhcpTab'
import { SwitchIncidentsTab }       from './SwitchIncidentsTab'
import { SwitchOverviewTab }        from './SwitchOverviewTab'
import SwitchPageHeader             from './SwitchPageHeader'
import { SwitchReportsTab }         from './SwitchReportsTab'
import { SwitchTimelineTab }        from './SwitchTimelineTab'
import { SwitchTroubleshootingTab } from './SwitchTroubleshootingTab'

const tabs = {
  overview: SwitchOverviewTab,
  incidents: SwitchIncidentsTab,
  troubleshooting: SwitchTroubleshootingTab,
  reports: SwitchReportsTab,
  clients: SwitchClientsTab,
  configuration: SwitchConfigurationTab,
  dhcp: SwitchDhcpTab,
  timeline: SwitchTimelineTab
}

export default function SwitchDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <SwitchPageHeader />
    { Tab && <Tab /> }
  </>
}