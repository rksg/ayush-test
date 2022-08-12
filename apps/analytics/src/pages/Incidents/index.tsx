import React from 'react'

import { useIntl } from 'react-intl'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridRow, GridCol }   from '@acx-ui/components'

import Header                   from '../../components/Header'
import IncidentBySeverityWidget from '../../components/IncidentBySeverity'
import IncidentTableWidget      from '../../components/IncidentTable'
import NetworkHistoryWidget     from '../../components/NetworkHistory'

function Incidents () {
  const { $t } = useIntl()
  const filters = useAnalyticsFilter()

  return <>
    <Header title={$t({ defaultMessage: 'Incidents' })} />
    <GridRow gutter={[0, 20]}>
      <GridCol col={{ span: 4 }} style={{ height: '220px' }}>
        <IncidentBySeverityWidget />
      </GridCol>
      <GridCol col={{ span: 20 }} style={{ height: '220px' }}>
        <NetworkHistoryWidget hideTitle filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ height: '400px' }}>
        <IncidentTableWidget />
      </GridCol>
    </GridRow>
  </>
}
export default Incidents
