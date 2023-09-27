import { useHeaderExtra }             from '@acx-ui/analytics/components'
import { PageHeader }                 from '@acx-ui/components'
import { useParams }                  from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType } from '@acx-ui/reports/components'

const SwitchDetails = () => {

  const { switchId } = useParams()

  return (
    <>
      <PageHeader
        title={switchId}
        breadcrumb={[
          { text: 'Wired' },
          { text: 'Switches' },
          { text: 'Switch List', link: '/switch' }
        ]}
        extra={useHeaderExtra({ excludeNetworkFilter: true })}
        footer={false}
        footerSpacer={false}
      />
      <EmbeddedReport
        reportName={ReportType.SWITCH_DETAIL}
        rlsClause={`"switchId" in ('${switchId}')`}
      />
    </>
  )
}

export default SwitchDetails
