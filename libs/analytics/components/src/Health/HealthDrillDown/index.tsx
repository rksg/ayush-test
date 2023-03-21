// @ts-nocheck
import { GridCol, GridRow } from '@acx-ui/components';
import { formatter } from '@acx-ui/formatter';

import { FunnelChart } from './funnelChart';
import { HealthPieChart } from './HealthPieChart';
import { Section, Title, Separator } from './styledComponents';

const getFormattedToFunnel = (
  type,
  { authFailure, assoFailure, eapFailure, radiusFailure, dhcpFailure }
) => [
  {
    name: 'Authentication',
    label: type === 'connection' ? '802.11 Auth. Failure' : '802.11 Auth.',
    value: authFailure,
  },
  {
    name: 'Association',
    label: type === 'connection' ? 'Assoc. Failure' : 'Association',
    value: assoFailure,
  },
  {
    name: 'EAP',
    label: type === 'connection' ? 'EAP Failure' : 'EAP',
    value: eapFailure,
  },
  {
    name: 'Radius',
    label: type === 'connection' ? 'RADIUS Failure' : 'RADIUS',
    value: radiusFailure,
  },
  {
    name: 'DHCP',
    label: type === 'connection' ? 'DHCP Failure' : 'DHCP',
    value: dhcpFailure,
  },
];
const HealthDrillDown = () => {
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '105px' }}>
        <Title>{'Connection Steps'}</Title>
        {/* <CloseButton onClick={() => setDrilldownSelection(null)} /> */}
        <div>
          {true ? (
            <FunnelChart
              valueLabel="Fail"
              height={140}
              stages={getFormattedToFunnel('ttc', {
                authFailure: 228.46716757166308,
                assoFailure: 252.04659838138593,
                eapFailure: 352.08455161065757,
                radiusFailure: 252.82345132743362,
                dhcpFailure: 97.25188470066519,
              })}
              colors={['#194f70', '#176291', '#1b79b5', '#208fd5', '#35b1ff']}
              selectedStage={'eapFailure'}
              onSelectStage={(stage) => console.log(stage)}
              valueFormatter={formatter('countFormat')}
            />
          ) : (
            <FunnelChart
              valueLabel="Fail"
              height={140}
              stages={getFormattedToFunnel('ttc', {
                authFailure: 228.46716757166308,
                assoFailure: 252.04659838138593,
                eapFailure: 352.08455161065757,
                radiusFailure: 252.82345132743362,
                dhcpFailure: 97.25188470066519,
              })}
              colors={['#194f70', '#176291', '#1b79b5', '#208fd5', '#35b1ff']}
              selectedStage={'dhcpFailure'}
              onSelectStage={(stage) => console.log(stage)}
              valueFormatter={valueFormatter}
            />
          )}
        </div>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '210px' }}>
        <HealthPieChart />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '210px' }}>
        Table
      </GridCol>
    </GridRow>
  );
};
export { HealthDrillDown };
