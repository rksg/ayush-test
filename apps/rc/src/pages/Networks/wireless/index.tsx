import { useParams } from '@acx-ui/react-router-dom'

import NetworksTable from './NetworksTable'
import PageHeader    from './PageHeader'

type NetworkTabs = 'wireless' | 'wlan' | 'application' | 'wifi'

export default function NetworksList () {

  const { activeTab } = useParams()

  const currentTab = (tab: NetworkTabs) => {
    switch(tab) {
      case 'wireless':
        return <NetworksTable />
      case 'wlan':
        return <div>wlan</div> // return reports/wlan
      case 'application':
        return <>application</> // return reports/application
      case 'wifi':
        return <>wireless</> // return reports/wireless
    }
  }

  return <>
    <PageHeader />
    {currentTab(activeTab as NetworkTabs)}
  </>
}
