import { Provider, store } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { api } from '../Kpi/services'

import HistogramSlider from './HistogramSlider'


const splits = [1,2,3,4,5,6]
const onSliderChange = jest.fn()
describe('Threshold Histogram chart', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
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
          shortXFormat={jest.fn()}
        />
      </Provider>
    )
    expect(await screen.findByRole('slider')).toBeInTheDocument()
  })
})
