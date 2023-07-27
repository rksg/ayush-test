import { withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { useIntl } from 'react-intl';
import AutoSizer from 'react-virtualized-auto-sizer';
import moment from 'moment-timezone';
import { TooltipWrapper } from '@acx-ui/components';
import { renderToString } from 'react-dom/server';
import { Card } from '../Card';
import { Heatmap } from '.';
import { flatten } from 'lodash';

export const chartData: any = {
  time: [
    '2023-07-18T00:00:00.000Z',
    '2023-07-18T00:03:00.000Z',
    '2023-07-18T00:06:00.000Z',
    '2023-07-18T00:09:00.000Z',
    '2023-07-18T00:12:00.000Z',
    '2023-07-18T00:15:00.000Z',
    '2023-07-18T00:18:00.000Z',
  ],
  heatmap: [
    [
      {
        timestamp: '2023-07-18T00:00:00.000Z',
        channel: '56',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:00:00.000Z',
        channel: '60',
        apCount: 1,
      },
      {
        timestamp: '2023-07-18T00:00:00.000Z',
        channel: '116',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:00:00.000Z',
        channel: '132',
        apCount: 2,
      },
    ],
    [
      {
        timestamp: '2023-07-18T00:03:00.000Z',
        channel: '56',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:03:00.000Z',
        channel: '60',
        apCount: 1,
      },
      {
        timestamp: '2023-07-18T00:03:00.000Z',
        channel: '116',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:03:00.000Z',
        channel: '132',
        apCount: 1,
      },
    ],
    [
      {
        timestamp: '2023-07-18T00:06:00.000Z',
        channel: '56',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:06:00.000Z',
        channel: '60',
        apCount: 1,
      },
      {
        timestamp: '2023-07-18T00:06:00.000Z',
        channel: '116',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:06:00.000Z',
        channel: '132',
        apCount: 1,
      },
    ],
    [
      {
        timestamp: '2023-07-18T00:09:00.000Z',
        channel: '56',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:09:00.000Z',
        channel: '60',
        apCount: 1,
      },
      {
        timestamp: '2023-07-18T00:09:00.000Z',
        channel: '116',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:09:00.000Z',
        channel: '132',
        apCount: 1,
      },
    ],
    [
      {
        timestamp: '2023-07-18T00:12:00.000Z',
        channel: '56',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:12:00.000Z',
        channel: '60',
        apCount: 1,
      },
      {
        timestamp: '2023-07-18T00:12:00.000Z',
        channel: '116',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:12:00.000Z',
        channel: '132',
        apCount: 1,
      },
    ],
    [
      {
        timestamp: '2023-07-18T00:15:00.000Z',
        channel: '56',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:15:00.000Z',
        channel: '60',
        apCount: 1,
      },
      {
        timestamp: '2023-07-18T00:15:00.000Z',
        channel: '116',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:15:00.000Z',
        channel: '132',
        apCount: 1,
      },
    ],
    [
      {
        timestamp: '2023-07-18T00:18:00.000Z',
        channel: '56',
        apCount: 3,
      },
      {
        timestamp: '2023-07-18T00:18:00.000Z',
        channel: '60',
        apCount: 1,
      },
      {
        timestamp: '2023-07-18T00:18:00.000Z',
        channel: '116',
        apCount: 6,
      },
      {
        timestamp: '2023-07-18T00:18:00.000Z',
        channel: '132',
        apCount: 10,
      },
    ],
  ],
};

export const tooltipFormatter = (params: any) => {
  const value1 = Array.isArray(params.data) ? params.data[0] : '';
  const value2 = Array.isArray(params.data) ? params.data[1] : '';
  const value3 = Array.isArray(params.data) ? params.data[2] : '';

  return renderToString(
    <TooltipWrapper>
      <div>
        {('Time: ' + value1) as string} <br />
        {('Channel: ' + value2) as string}
        <br />
        {('Count : ' + value3) as string}
      </div>
    </TooltipWrapper>
  );
};
export const xAxisCategories = chartData.time.map((datum: string) =>
  moment(datum).format('DD MMM HH:mm')
);

export const data = flatten(chartData.heatmap).map((datum: any) => [
  moment(datum.timestamp).format('DD MMM HH:mm'),
  datum.channel,
  datum.apCount,
]);
storiesOf('Heatmap', module)
  .addDecorator(withKnobs)
  .add('Default ', () => {
    const { $t } = useIntl();
    return (
      <div style={{ width: 800, height: 500 }}>
        <Card title="Heatmap">
          <AutoSizer>
            {({ height, width }) => (
              <Heatmap
                style={{ width, height }}
                tooltipFormatter={tooltipFormatter}
                xAxisCategories={xAxisCategories ?? []}
                yAxisCategories={['56', '60', '116', '132']}
                data={data}
                colors={['green', 'orange', 'red']}
                min={0}
                max={5}
                title={'Heatmap'}
              />
            )}
          </AutoSizer>
        </Card>
      </div>
    );
  });
