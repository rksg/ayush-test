import { useParams } from '@acx-ui/react-router-dom'

import { ZoneAnalyticsTab } from './ZoneAnalyticsTab'
import ZonePageHeader       from './ZonePageHeader'

const tabs = {
  analytics: ZoneAnalyticsTab
}

export default function ZoneDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <ZonePageHeader />
    { Tab && <Tab /> }
  </>
}

