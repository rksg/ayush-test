import { Provider, store } from '@acx-ui/store'
import {
  render,
  screen,
  mockDOMWidth
} from '@acx-ui/test-utils'

import { histogramApi } from '../Kpi/services'

import ThresholdConfig from './ThresholdConfigContent'

const shortXFormat = jest.fn()
describe('Threshold Histogram chart', () => {
  mockDOMWidth()
  beforeEach(() => {
    store.dispatch(histogramApi.util.resetApiState())
  })

  it('should render Slider', async () => {
    render(
      <Provider>
        <ThresholdConfig
          thresholdValue={'10'}
          percent={100}
          unit={'seconds'}
          shortXFormat={shortXFormat}
        />
      </Provider>
    )
    expect(await screen.findByText('100%')).toBeInTheDocument()
  })
})
