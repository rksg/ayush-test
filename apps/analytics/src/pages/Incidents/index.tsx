import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { useAnalyticsFilter }                           from '@acx-ui/analytics/utils'
import { categoryNames, categoryCodeMap, IncidentCode } from '@acx-ui/analytics/utils'
import { GridRow, GridCol }                             from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink }        from '@acx-ui/react-router-dom'

import Header                   from '../../components/Header'
import IncidentBySeverityWidget from '../../components/IncidentBySeverity'
import NetworkHistoryWidget     from '../../components/NetworkHistory'

const incidentTabs = [{ text: 'Overview', value: 'overview' }, ...categoryNames]
type IncidentListTabs = 'overview' | 'connection' | 'performance' | 'infrastructure'

const IncidentTabContent = (props: { tabSelection: IncidentListTabs }) => {
  const { tabSelection } = props
  const filters = useAnalyticsFilter()
  const incidentCodesBasedOnCategory: IncidentCode[] | undefined = categoryCodeMap[
    tabSelection as Exclude<IncidentListTabs, 'overview'>
  ]?.codes as IncidentCode[]

  return (
    <GridRow gutter={[0, 20]}>
      <GridCol col={{ span: 4 }} style={{ height: '220px' }}>
        <IncidentBySeverityWidget filters={{ ...filters, code: incidentCodesBasedOnCategory }} />
      </GridCol>
      <GridCol col={{ span: 20 }} style={{ height: '220px' }}>
        <NetworkHistoryWidget
          hideTitle
          filters={{ ...filters, code: incidentCodesBasedOnCategory }}
        />
      </GridCol>
      <GridCol col={{ span: 24 }}>table</GridCol>
    </GridRow>
  )
}

function Incidents () {
  const { $t } = useIntl()
  const { activeTab = incidentTabs[0].value } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/tab/')

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  return (
    <>
      <Header
        title={$t({ defaultMessage: 'Incidents' })}
        footer={
          <Tabs activeKey={activeTab} onChange={onTabChange}>
            {incidentTabs.map((tabInfo) => (
              <Tabs.TabPane
                tab={$t({ defaultMessage: '{tab}' }, { tab: tabInfo.text })}
                key={tabInfo.value}
              />
            ))}
          </Tabs>
        }
      />
      <IncidentTabContent tabSelection={activeTab as IncidentListTabs} />
    </>
  )
}
export default Incidents
