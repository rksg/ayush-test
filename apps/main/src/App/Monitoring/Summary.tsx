import React from 'react'

import { DashboardRow, DashboardCol } from '@acx-ui/components'

const WiFiWidgets = React.lazy(() => import('rc-wifi/Widgets'))
const AnalyticsWidgets = React.lazy(() => import('analytics/Widgets'))

function Placeholder ({
  style,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const styles = {
    inner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    } as React.CSSProperties,
    outer: {
      position: 'relative'
    } as React.CSSProperties
  }
  return (
    <div {...props} style={{ ...style, ...styles.outer }}>
      <div style={styles.inner} children={children} />
    </div>
  )
}

export function Summary () {
  return (
    <DashboardRow gutter={[20, 20]}>
      <DashboardCol col={{ span: 6 }}>
        <WiFiWidgets name='dashboard/alarms' />
      </DashboardCol>
      <DashboardCol col={{ span: 6 }}>
        <WiFiWidgets name='dashboard/incidents' />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }}>
        <Placeholder style={{ paddingTop: '64.76%' }} children='SLA' />
      </DashboardCol>
      <DashboardCol col={{ span: 24 }}>
        <Placeholder style={{ paddingTop: '37.47%' }} children='Map' />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }}>
        <AnalyticsWidgets name='monitoring/trafficByVolume'/>
      </DashboardCol>
      <DashboardCol col={{ span: 12 }}>
        <Placeholder
          style={{ paddingTop: '49.4661921708%' }}
          children='Network History'
        />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }}>
        <Placeholder
          style={{ paddingTop: '49.4661921708%' }}
          children='Traffic by Clients'
        />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }}>
        <Placeholder
          style={{ paddingTop: '49.4661921708%' }}
          children='Applications'
        />
      </DashboardCol>
    </DashboardRow>
  )
}
