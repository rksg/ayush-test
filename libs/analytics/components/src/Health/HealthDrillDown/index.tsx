// @ts-nocheck
import { useState } from 'react'

import {  Divider } from 'antd'

import { GridCol, GridRow } from '@acx-ui/components'
import { formatter }        from '@acx-ui/formatter'
import { CloseSymbol }      from '@acx-ui/icons'

import { FunnelChart } from './funnelChart'
import {
  Section,
  Title,
  Separator
}                                from './styledComponents'

export type DrilldownSelection = 'connectionFailure' | 'ttc' | null

const titleConfig = {
  connectionFailure: 'Connection Failures',
  ttc: 'Average Time To Connect'
}
type Stages = 'authFailure'| 'assoFailure'|'eapFailure' | 'radiusFailure'| 'dhcpFailure' | null
const getFormattedToFunnel = (type, {
  authFailure,
  assoFailure,
  eapFailure,
  radiusFailure,
  dhcpFailure
}) => [
  {
    name: 'Authentication',
    label: type === 'connection' ? '802.11 Auth. Failure' : '802.11 Auth.',
    value: authFailure
  },
  {
    name: 'Association',
    label: type === 'connection' ? 'Assoc. Failure' : 'Association',
    value: assoFailure
  },
  { name: 'EAP', label: type === 'connection' ? 'EAP Failure' : 'EAP', value: eapFailure },
  {
    name: 'Radius',
    label: type === 'connection' ? 'RADIUS Failure' : 'RADIUS',
    value: radiusFailure
  },
  { name: 'DHCP', label: type === 'connection' ? 'DHCP Failure' : 'DHCP', value: dhcpFailure }
]
const HealthDrillDown = (props: {
  drilldownSelection: DrilldownSelection;
  setDrilldownSelection: CallableFunction;
}) => {
  const { drilldownSelection, setDrilldownSelection } = props
  const [ selectedStage, setSelectedStage ] = useState<Stages>(null)
  return drilldownSelection ? (
    <GridRow style={{ marginTop: 25 }}>
      <GridCol col={{ span: 24 }}>
        <GridRow>
          <GridCol col={{ span: 12 }}>
            <Title>{titleConfig?.[drilldownSelection]}</Title>
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ alignItems: 'end' }}>
            <CloseSymbol onClick={() => setDrilldownSelection(null)} />
          </GridCol>
        </GridRow>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={getFormattedToFunnel(drilldownSelection, {
            authFailure: 228.46716757166308,
            assoFailure: 252.04659838138593,
            eapFailure: 352.08455161065757,
            radiusFailure: 252.82345132743362,
            dhcpFailure: 97.25188470066519
          })}
          colors={['#194f70', '#176291', '#1b79b5', '#208fd5', '#35b1ff']}
          selectedStage={selectedStage}
          onSelectStage={(stage) => setSelectedStage(stage)}
          valueFormatter={
            drilldownSelection === 'connectionFailure' ? formatter('countFormat') : valueFormatter
          }
        />
      </GridCol>
      <Divider />
      {selectedStage && (
        <>
          <GridCol col={{ span: 12 }} style={{ height: '210px' }}>
            PIE chart
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '210px' }}>
            Table
          </GridCol>
        </>
      )}
    </GridRow>
  ) : null
}
export { HealthDrillDown }
