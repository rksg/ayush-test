import React from 'react'

import { Row } from 'antd'

import styled from 'styled-components/macro'
import Header from '../../components/Header'

import { Button, PageHeader, DashboardCol } from '@acx-ui/components'
import IncidentBySeverityWidget from '../../components/IncidentBySeverity'

const Wrapper = styled.div`
  display:flex;
`
function Incidents () {
  return <>
    <Header title='Incidents' />    
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
