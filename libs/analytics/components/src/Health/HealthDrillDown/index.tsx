// @ts-nocheck
import { useState } from 'react'

import { GridCol, GridRow } from '@acx-ui/components'
import { formatter }        from '@acx-ui/formatter'

import { FunnelChart }             from './funnelChart'
import { Title, Separator, Point } from './styledComponents'

const getFormattedToFunnel = (
  type,
  { authFailure, assoFailure, eapFailure, radiusFailure, dhcpFailure }
) => [
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
  {
    name: 'EAP',
    label: type === 'connection' ? 'EAP Failure' : 'EAP',
    value: eapFailure
  },
  {
    name: 'Radius',
    label: type === 'connection' ? 'RADIUS Failure' : 'RADIUS',
    value: radiusFailure
  },
  {
    name: 'DHCP',
    label: type === 'connection' ? 'DHCP Failure' : 'DHCP',
    value: dhcpFailure
  }
]
const HealthDrillDown = () => {
  const [stage, setStage] = useState('none')
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '105px' }}>
        <Title>{'Connection Steps'}</Title>
        {/* <CloseButton onClick={() => setDrilldownSelection(null)} /> */}
        <div>
          {true ? (
            <FunnelChart
              valueLabel='Fail'
              height={140}
              stages={getFormattedToFunnel('ttc', {
                authFailure: 228.46716757166308,
                assoFailure: 252.04659838138593,
                eapFailure: 352.08455161065757,
                radiusFailure: 252.82345132743362,
                dhcpFailure: 97.25188470066519
              })}
              colors={['#194f70', '#176291', '#1b79b5', '#208fd5', '#35b1ff']}
              selectedStage={'eapFailure'}
              onSelectStage={setStage}
              valueFormatter={formatter('countFormat')}
            />
          ) : (
            <FunnelChart
              valueLabel='Fail'
              height={140}
              stages={getFormattedToFunnel('ttc', {
                authFailure: 228.46716757166308,
                assoFailure: 252.04659838138593,
                eapFailure: 352.08455161065757,
                radiusFailure: 252.82345132743362,
                dhcpFailure: 97.25188470066519
              })}
              colors={['#194f70', '#176291', '#1b79b5', '#208fd5', '#35b1ff']}
              selectedStage={'dhcpFailure'}
              onSelectStage={setStage}
              valueFormatter={valueFormatter}
            />
          )}
        </div>
      </GridCol>
      {stage == 'none'
        ? null
        : (
          <>
            <GridCol col={{ span: 24 }}>
              <Separator><Point /></Separator>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '210px' }}>
            Pie Chart
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '210px' }}>
            Table
            </GridCol>
          </>
        )}
    </GridRow>
  )
}
export { HealthDrillDown }
