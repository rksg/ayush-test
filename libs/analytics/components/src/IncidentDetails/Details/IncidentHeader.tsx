import { useIntl } from 'react-intl'

import { calculateSeverity, shortDescription } from '@acx-ui/analytics/utils'
import type { Incident }                       from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill }            from '@acx-ui/components'

export const IncidentHeader = ({ incident }: { incident: Incident }) => {
  const { $t } = useIntl()
  return <PageHeader
    title={$t({ defaultMessage: 'Incident Details' })}
    titleExtra={<SeverityPill severity={calculateSeverity(incident.severity)!} />}
    breadcrumb={[
      { text: $t({ defaultMessage: 'AI Assurance' }) },
      { text: $t({ defaultMessage: 'AI Analytics' }) },
      { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
    ]}
    subTitle={shortDescription(incident)}
  />
}
