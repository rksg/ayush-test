import { useHeaderExtra } from '@acx-ui/analytics/components'
import { PageHeader }     from '@acx-ui/components'
import { useParams }      from '@acx-ui/react-router-dom'

import { SwitchContextProvider } from './SwitchContextProvider'
import { SwitchIncidentsTab }    from './SwitchIncidentsTab'
import { SwitchReportsTab }      from './SwitchReportsTab'
import SwitchTabs                from './SwitchTabs'

const tabs = {
  incidents: SwitchIncidentsTab,
  reports: SwitchReportsTab
}

const SwitchDetails = () => {
  const { switchId, activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]

  return (
    <SwitchContextProvider>
      <PageHeader
        title={switchId}
        breadcrumb={[
          { text: 'Wired' },
          { text: 'Switches' },
          { text: 'Switch List', link: '/devices/switch' }
        ]}
        extra={useHeaderExtra({ excludeNetworkFilter: true })}
        footer={<SwitchTabs/>}
      />
      { Tab && <Tab /> }
    </SwitchContextProvider>
  )
}

export default SwitchDetails
