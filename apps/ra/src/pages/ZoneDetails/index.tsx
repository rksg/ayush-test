import { useParams } from '@acx-ui/react-router-dom'

import { ZoneAnalyticsTab } from './ZoneAnalyticsTab'
import ZonePageHeader       from './ZonePageHeader'

const tabs = {
  analytics: ZoneAnalyticsTab,
  clients: () => <div>clients tab</div>,
  devices: () => <div>devices tab</div>,
  networks: () => <div>network tab</div>
}

export default function ZoneDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs] || tabs['analytics']
  return <>
    <ZonePageHeader />
    { Tab && <Tab /> }
  </>
}

