import { useParams } from '@acx-ui/react-router-dom'

import ApsTable   from './ApsTable'
import PageHeader from './PageHeader'

type WifiTabs = 'list' | 'report' | 'airtime'

export default function AccessPointList () {

  const { activeTab } = useParams()

  const currentTab = (tab: WifiTabs) => {
    switch(tab) {
      case 'list':
        return <ApsTable />
      case 'report':
        return <div>report</div>
      case 'airtime':
        return <>airtime</> // return reports/clients
    }
  }

  return <>
    <PageHeader />
    {currentTab(activeTab as WifiTabs)}
  </>
}
