import { useParams } from '@acx-ui/react-router-dom'

import { NetworkDetailsPageHeader } from './NetworkDetailsHeader'
import { NetworkIncidentsTab }      from './NetworkIncidentsTab'
import { NetworkDetailsReportTab }  from './NetworkReportsTab'

const tabs = {
  incidents: () => <NetworkIncidentsTab />, // Landing Tab
  reports: () => <NetworkDetailsReportTab /> // Overview Tab
}

const NetworkDetails = () => {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <NetworkDetailsPageHeader />
    { Tab && <Tab /> }
  </>
}

export default NetworkDetails
