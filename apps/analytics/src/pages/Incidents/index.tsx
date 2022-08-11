import React from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'

import Header                   from '../../components/Header'
import IncidentBySeverityWidget from '../../components/IncidentBySeverity'
import IncidentTableWidget      from '../../components/IncidentTable'
import NetworkHistoryWidget     from '../../components/NetworkHistory'

function Incidents () {
  const { $t } = useIntl()
  const filters = useAnalyticsFilter()

  return <>
    <Header title={$t({ defaultMessage: 'Incidents' })} />
    <Row gutter={[0, 20]}>
      <Col span={4} style={{ display: 'flex', height: 220 }}>
        <IncidentBySeverityWidget />
      </Col>
      <Col span={20} style={{ display: 'flex', height: 220 }}>
        <NetworkHistoryWidget hideTitle filters={filters}/>
      </Col>
      <Col span={24} style={{ display: 'flex', height: 220 }}>
        <IncidentTableWidget />
      </Col>
    </Row>
  </>
}
export default Incidents
