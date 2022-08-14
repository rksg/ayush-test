import { useState } from 'react'

import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  categoryNames,
  categoryCodeMap,
  incidentCodes
} from '@acx-ui/analytics/utils'
import { GridRow, GridCol } from '@acx-ui/components'

import Header                   from '../../components/Header'
import IncidentBySeverityWidget from '../../components/IncidentBySeverity'
import NetworkHistoryWidget     from '../../components/NetworkHistory'

const incidentTabs = [
  { text: 'Overview', value: 'overview' },
  ...categoryNames
]
const IncidentTabContent = (props: any) => {
  const { tabSelection } = props
  const filters = useAnalyticsFilter()
  const tabWiseIncidentCodes =
    tabSelection === 'overview'
      ? incidentCodes
      : categoryCodeMap[
          tabSelection as 'connection' | 'performance' | 'infrastructure'
      ].codes

  return (
    <GridRow gutter={[0, 20]}>
      <GridCol col={{ span: 4 }} style={{ height: '220px' }}>
        <IncidentBySeverityWidget
          filters={{ ...filters, code: tabWiseIncidentCodes }}
        />
      </GridCol>
      <GridCol col={{ span: 20 }} style={{ height: '220px' }}>
        <NetworkHistoryWidget
          hideTitle
          filters={{ ...filters, code: tabWiseIncidentCodes }}
        />
      </GridCol>
      <GridCol col={{ span: 24 }}>table</GridCol>
    </GridRow>
  )
}

function Incidents () {
  const { $t } = useIntl()
  const [tabSelection, setTabSelection] = useState(incidentTabs[0].value)

  return (
    <>
      {' '}
      <Header title={$t({ defaultMessage: 'Incidents' })} />
      <Tabs
        defaultActiveKey={tabSelection}
        onChange={(key) => setTabSelection(key)}
        style={{ lineHeight: 2.33 }}
      >
        {incidentTabs.map((tabInfo) => (
          <Tabs.TabPane tab={tabInfo.text} key={tabInfo.value}>
            <IncidentTabContent tabSelection={tabSelection} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </>
  )
}
export default Incidents
