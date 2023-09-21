import { useParams }                  from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType } from '@acx-ui/reports/components'

import { ClientDetailPageHeader }   from './ClientDetailPageHeader'
import { ClientTroubleshootingTab } from './ClientTroubleshooting'

const ClientReport = () => {
  const param = useParams()
  return (
    <EmbeddedReport
      reportName={ReportType.CLIENT_DETAIL}
      rlsClause={`"clientMac" in ('${param?.clientId?.toUpperCase()}')`}
    />
  )
}
const tabs = {
  overview: () => <div>overview</div>,
  troubleshooting: ClientTroubleshootingTab,
  reports: ClientReport
}

const ClientDetails = () => {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <ClientDetailPageHeader />
    { Tab && <Tab />}
  </>
}

export default ClientDetails
