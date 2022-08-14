import { useState } from 'react'

import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  categoryNames,
  categoryCodeMap,
  IncidentCode
} from '@acx-ui/analytics/utils'
import { GridRow, GridCol } from '@acx-ui/components'

import Header                   from '../../components/Header'
import IncidentBySeverityWidget from '../../components/IncidentBySeverity'
import NetworkHistoryWidget     from '../../components/NetworkHistory'

const incidentTabs = [
  { text: 'Overview', value: 'overview' },
  ...categoryNames
]
type tabSelectionType =
  | 'connection'
  | 'performance'
  | 'infrastructure'
  | 'overview'
const IncidentTabContent = (props: { tabSelection: tabSelectionType }) => {
  const { tabSelection } = props
  const filters = useAnalyticsFilter()
  const tabWiseIncidentCodes: IncidentCode[] | undefined = categoryCodeMap[
    tabSelection as 'connection' | 'performance' | 'infrastructure'
  ]?.codes as IncidentCode[]

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
  const [tabSelection, setTabSelection] = useState<tabSelectionType>(
    incidentTabs[0].value as tabSelectionType
  )

  return (
    <>
      {' '}
      <Header title={$t({ defaultMessage: 'Incidents' })} />
      <Tabs
        defaultActiveKey={tabSelection}
        onChange={(key) => setTabSelection(key as tabSelectionType)}
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
