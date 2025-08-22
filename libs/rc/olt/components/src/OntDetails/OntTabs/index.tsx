import { useIntl } from 'react-intl'

import { Tabs, Loader } from '@acx-ui/components'
import {
  OntDetailsTabType,
  OltOnt
} from '@acx-ui/olt/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { OntClientTab }   from '../OntClientTab'
import { OntOverviewTab } from '../OntOverviewTab'
import { OntPortTab }     from '../OntPortTab'

export const OntTabs = (props: {
  portDetails?: OltOnt['portDetails']
  clientDetails?: OltOnt['clientDetails']
}) => {
  const { $t } = useIntl()
  const { activeTab, cageId, oltId, venueId } = useParams()
  const { portDetails, clientDetails } = props
  const basePath = useTenantLink(`/devices/optical/${venueId}/${oltId}/cages/${cageId}`)
  const navigate = useNavigate()

  const handleTabChange = (val: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${val}`
    })
  }

  const tabs = [{
    label: $t({ defaultMessage: 'Panel' }),
    value: OntDetailsTabType.PANEL,
    children: <OntOverviewTab data={portDetails} />
  }, {
    label: $t({ defaultMessage: 'Ports' }),
    value: OntDetailsTabType.PORTS,
    children: <OntPortTab data={portDetails} />
  }, {
    label: $t({ defaultMessage: 'Clients ({count})' }, { count: clientDetails?.length || 0 }),
    value: OntDetailsTabType.CLIENTS,
    children: <OntClientTab data={clientDetails} />
  }]

  return <Tabs
    type='line'
    activeKey={activeTab}
    defaultActiveKey={activeTab || tabs[0].value}
    onChange={handleTabChange}
  >
    {tabs.map((tab) => (
      <Tabs.TabPane
        tab={tab.label}
        key={tab.value}
      >
        <Loader
          // states={[{ isLoading: isCagesLoading, isFetching: isCagesFetching }]}
          style={{ minHeight: '100px' }}
        >
          {tab.children}
        </Loader>
      </Tabs.TabPane>
    ))}
  </Tabs>
}