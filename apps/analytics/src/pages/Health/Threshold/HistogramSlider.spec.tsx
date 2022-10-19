import { Provider, store } from '@acx-ui/store'
import {
  render,
  screen,
  mockDOMWidth
} from '@acx-ui/test-utils'

import { histogramApi } from '../Kpi/services'

import HistogramSlider from './HistogramSlider'


const splits = [1,2,3,4,5,6]
const onSliderChange = jest.fn().mockReturnValueOnce(2)
describe('Threshold Histogram chart', () => {
  mockDOMWidth()
  beforeEach(() => {
    store.dispatch(histogramApi.util.resetApiState())
  })

  it('should render Slider', async () => {
    render(
      <Provider>
        <HistogramSlider
          splits={splits}
          width={100}
          height={100}
          onSliderChange={onSliderChange}
          sliderValue={2}
        />
      </Provider>
    )
    expect(await screen.findByText('2')).toBeInTheDocument()
  })
})
