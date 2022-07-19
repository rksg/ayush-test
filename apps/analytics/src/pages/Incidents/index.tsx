import React from 'react'

import { Row } from 'antd'

import styled                    from 'styled-components/macro'

import { Button, PageHeader, DashboardCol, DashboardRow } from '@acx-ui/components'
import IncidentBySeverityWidget from '../../components/IncidentBySeverity'

const Wrapper = styled.div`
  display:flex;
`
function Incidents () {
  return <>
    <PageHeader
      title='Incidents'
      extra={[
        <Button key='hierarchy-filter'>network filter</Button>,
        <Button key='date-filter'>date filter</Button>
      ]}
    />
    <Row gutter={[20, 80]} >
    <DashboardCol col={{ span: 5 }} style={{ height: '160px' }}>
      <IncidentBySeverityWidget />
      </DashboardCol>
      <DashboardCol col={{ span: 15 }} style={{ height: '160px' }}>
        timeseries
      </DashboardCol>
    </Row>
    <Row >
    <DashboardCol col={{ span: 6 }}>
        table
    </DashboardCol>
    </Row>
  </>
}
export default Incidents
