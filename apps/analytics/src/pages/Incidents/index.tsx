import React from 'react'

//import { DashboardCol, DashboardRow } from 'antd'

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
    <DashboardRow gutter={[20, 80]} >
    <DashboardCol col={{ span: 6 }} style={{ height: '384px' }}>
      <IncidentBySeverityWidget />
      </DashboardCol>
      <DashboardCol col={{ span: 6 }} style={{ height: '384px' }}>
        timeseries
      </DashboardCol>
     
    </DashboardRow>
    <DashboardRow >
    <DashboardCol col={{ span: 6 }} style={{ height: '384px' }}>
        table
      </DashboardCol>
      </DashboardRow>
  </>
}
export default Incidents
