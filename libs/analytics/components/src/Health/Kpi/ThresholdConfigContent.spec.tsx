import { defineMessage } from 'react-intl'

import { healthApi }       from '@acx-ui/analytics/services'
import { Provider, store } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import ThresholdConfig , { getDisabledToolTip } from './ThresholdConfigContent'
const shortXFormat = jest.fn()
describe('Threshold Histogram chart', () => {
  beforeEach(() => {
    store.dispatch(healthApi.util.resetApiState())
  })

  it('should render Slider', async () => {
    render(
      <Provider>
        <ThresholdConfig
          thresholdValue={10}
          percent={100}
          unit={defineMessage({ defaultMessage: 'seconds' })}
          shortXFormat={shortXFormat}
          onReset={jest.fn()}
          onApply={jest.fn()}
        />
      </Provider>
    )
    expect(await screen.findByText('100%')).toBeInTheDocument()
  })
  it('should return correct intl for ACX', async () => {
    expect(getDisabledToolTip(true, undefined)).toEqual(defineMessage({
      defaultMessage:
      'Cannot save threshold at organization level. Please select a Venue or AP to set a threshold.'
    }))
  })
  it('should return correct intl for RA', async () => {
    expect(getDisabledToolTip(true, 'true')).toEqual(defineMessage({
      defaultMessage:
      // eslint-disable-next-line max-len
      'Cannot save threshold at organization level. Please select a SZ or any other network node to set a threshold.'
    }))
  })
})
