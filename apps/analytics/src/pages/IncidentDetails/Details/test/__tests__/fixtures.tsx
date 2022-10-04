/* eslint-env jest */

import { jest } from '@jest/globals'

import { NetworkImpact } from '../../../NetworkImpact'

export function mockNetworkImpact () {
  jest.mocked(NetworkImpact).mockImplementation((props) => <div data-testid='networkImpact'>
    {props.charts.map(item => <div
      key={item.chart}
      data-testid={`network-impact-${item.chart}`}
      data-type={item.type}
      data-dimension={item.dimension}
    />)}
  </div>)
}
