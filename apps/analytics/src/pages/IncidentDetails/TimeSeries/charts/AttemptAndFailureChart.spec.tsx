
import { BrowserRouter } from 'react-router-dom'

import { fakeIncident1 }        from '@acx-ui/analytics/utils'
import { store }                from '@acx-ui/store'
import { mockDOMWidth, render } from '@acx-ui/test-utils'

import { ChartsData } from '../services'
import { Api }        from '../services'

import { AttemptAndFailureChart } from './AttemptAndFailureChart'

const expectedResult = {
  attemptAndFailureChart: {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z'
    ],
    failureCount: [1, 2],
    totalFailureCount: [1, 2],
    attemptCount: [1, 2]
  }
} as unknown as ChartsData

beforeEach(() => store.dispatch(Api.util.resetApiState()))

describe('AttemptAndFailureChart', () => {
  mockDOMWidth()
  it('should render chart', async () => {
    const { asFragment } = render(
      <BrowserRouter>
        <AttemptAndFailureChart incident={fakeIncident1} data={expectedResult}/>
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
