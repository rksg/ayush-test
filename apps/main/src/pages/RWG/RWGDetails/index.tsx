import { useParams } from '@acx-ui/react-router-dom'

import { DNSRecordsTab }      from './DNSRecordsTab'
import { GatewayOverviewTab } from './GatewayOverviewTab'
import RWGPageHeader          from './RWGPageHeader'

const tabs = {
  overview: GatewayOverviewTab,
  dnsRecords: DNSRecordsTab
}

export function RWGDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <RWGPageHeader />
    { Tab && <Tab /> }
  </>
}
