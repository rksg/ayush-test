import { defineMessage } from 'react-intl'

import { Provider, store } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { api } from '../Kpi/services'

import ThresholdConfig from './ThresholdConfigContent'

const shortXFormat = jest.fn()
describe('Threshold Histogram chart', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render Slider', async () => {
    render(
      <Provider>
        <ThresholdConfig
          thresholdValue={'10'}
          percent={100}
          unit={defineMessage({ defaultMessage: 'seconds' })}
          shortXFormat={shortXFormat}
          onReset={jest.fn()}
        />
      </Provider>
    )
    expect(await screen.findByText('100%')).toBeInTheDocument()
  })
})
