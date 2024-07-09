import { useParams } from 'react-router-dom'

import { ApAnalyticsTab }    from './ApAnalyticsTab'
import { ApContextProvider } from './ApContextProvider'
import ApPageHeader          from './ApPageHeader'
import { ApReportsTab }      from './ApReportsTab'


const tabs = {
  ai: ApAnalyticsTab,
  reports: ApReportsTab
}
export default function ApDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <ApContextProvider>
    <ApPageHeader />
    { Tab && <Tab /> }
  </ApContextProvider>
}
