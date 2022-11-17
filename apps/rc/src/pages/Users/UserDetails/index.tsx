import { useParams } from '@acx-ui/react-router-dom'

import UserDetailPageHeader       from './UserDetailPageHeader'
import { UserOverviewTab }        from './UserOverviewTab'
import { UserReportsTab }         from './UserReportsTab'
import { UserTimelineTab }        from './UserTimelineTab'
import { UserTroubleshootingTab } from './UserTroubleshootingTab'

const tabs = {
  overview: UserOverviewTab,
  troubleshooting: UserTroubleshootingTab,
  reports: UserReportsTab,
  timeline: UserTimelineTab
}

export default function UserDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <UserDetailPageHeader />
    { Tab && <Tab /> }
  </>
}
