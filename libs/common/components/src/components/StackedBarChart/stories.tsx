import { withKnobs,object, boolean } from '@storybook/addon-knobs'
import { storiesOf }                 from '@storybook/react'
import { defineMessage }             from 'react-intl'

import { getDeviceConnectionStatusColorsv2 } from '../../index'

import { StackedBarChart } from '.'


export const data = [{
  category: 'Infrastructure',
  series: [
    { name: 'P3', value: 0 },
    { name: 'P1', value: 0 },
    { name: 'P2', value: 5 },
    { name: 'P4', value: 0 }
  ]
}, {
  category: 'Performance',
  series: [
    { name: 'P1', value: 0 },
    { name: 'P2', value: 2 },
    { name: 'P3', value: 5 },
    { name: 'P4', value: 0 }
  ]
}, {
  category: 'Connection',
  series: [
    { name: 'P1', value: 2 },
    { name: 'P2', value: 3 },
    { name: 'P3', value: 0 },
    { name: 'P4', value: 7 }
  ]
}]

export const singleBar = [{
  category: 'Something',
  series: [
    { name: '<0>In Setup Phase',value: 5 },
    { name: '<1>Requires Attention',value: 4 },
    { name: '<2>Transient Issue',value: 2 },
    { name: '<3>Operational',value: 13 }]
}]

storiesOf('StackedBarChart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () => <StackedBarChart
    style={{ height: 110, width: 400 }}
    showLabels
    data={data} />)
  .add('Single Chart View', () => <>
    <h3>With prop.totalValue as 24</h3>
    <StackedBarChart
      style={{ height: 110, width: 500 }}
      showLabels={false}
      showTotal={false}
      barWidth={20}
      barColors={getDeviceConnectionStatusColorsv2()}
      data={singleBar}
      totalValue={24} // must pass this value to make proper width
    />
    <h3>Without prop.totalValue having width issue</h3>
    <StackedBarChart
      style={{ height: 110, width: 500 }}
      showLabels={false}
      showTotal={false}
      barWidth={20}
      barColors={getDeviceConnectionStatusColorsv2()}
      data={singleBar} /></>)
  .add('With Knobs', () => <StackedBarChart
    style={{ height: 110, width: 250 }}
    showLabels={boolean('Show Labels', false)}
    showTooltip={boolean('Show Tooltip', false)}
    data={object('data', data)}
  />)
  .add('With Table', () =>
    <table style={{ height: 50, width: 200 }}>
      <thead>
        <tr style={{ height: 30 }}>
          <th></th>
          <th>Networking Devices</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ height: 30 }}>
          <td>Wi-Fi</td>
          <td style={{ width: 120 }}><StackedBarChart
            style={{ height: 30, width: 120 }}
            data={data.slice(2, 3)}
            showLabels={false}
            tooltipFormat={defineMessage({
              defaultMessage: '<span><b>{formattedValue}</b></span>'
            })}
            showTotal={false} />
          </td>
        </tr>
        <tr style={{ height: 30 }}>
          <td>Switch</td>
          <td style={{ width: 120 }}><StackedBarChart
            style={{ height: 30, width: 120 }}
            data={data.slice(1, 2)}
            showLabels={false}
            tooltipFormat={defineMessage({
              defaultMessage: '<span><b>{formattedValue}</b></span>'
            })}
            showTotal={false} />
          </td>
        </tr>
      </tbody>
    </table>)
