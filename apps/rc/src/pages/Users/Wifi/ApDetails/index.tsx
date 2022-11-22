import { useParams } from '@acx-ui/react-router-dom'

import ApDetailPageHeader       from './ApDetailPageHeader'
import { ApOverviewTab }        from './ApOverviewTab'
import { ApReportsTab }         from './ApReportsTab'
import { ApTimelineTab }        from './ApTimelineTab'
import { ApTroubleshootingTab } from './ApTroubleshootingTab'

const tabs = {
  overview: ApOverviewTab,
  troubleshooting: ApTroubleshootingTab,
  reports: ApReportsTab,
  timeline: ApTimelineTab
}

export default function ApDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <ApDetailPageHeader />
    { Tab && <Tab /> }
  </>
}
