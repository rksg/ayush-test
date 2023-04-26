import { useIntl }    from 'react-intl'

import {
  calculateSeverity,
  Incident,
  shortDescription
} from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill, Dropdown } from '@acx-ui/components'
import { ConfigurationOutlined }              from '@acx-ui/icons'
import { TenantLink }                         from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

const configureButton = <UI.ConfigureButton><ConfigurationOutlined /></UI.ConfigureButton>

const linkToIncidents = <TenantLink to='/analytics/incidents'>incidents</TenantLink>

const muteIncident = <UI.MuteIncidentContainer>{linkToIncidents}</UI.MuteIncidentContainer>
function IncidentDetailsHeader({ incident }: { incident: Incident }) {
  const { $t } = useIntl()
  console.log($t(incident.category))
  return <PageHeader
    title={$t({ defaultMessage: 'Incident Details' })}
    titleExtra={<SeverityPill severity={calculateSeverity(incident.severity)!} />}
    breadcrumb={[
      { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
    ]}
    subTitle={shortDescription(incident)}
    extra={[<Dropdown overlay={muteIncident}>{() => configureButton}</Dropdown>]}
  />
}
export default IncidentDetailsHeader
