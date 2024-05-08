import { defineMessage } from 'react-intl'

import { healthApi }       from '@acx-ui/analytics/services'
import { Provider, store } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'
import { RolesEnum }                      from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'
import { getIntl }                        from '@acx-ui/utils'

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
    expect(await screen.findByText('Apply')).toBeInTheDocument()
    expect(await screen.findByText('Reset')).toBeInTheDocument()
  })
  it('should return correct intl for ACX', async () => {
    const { $t } = getIntl()
    expect($t(getDisabledToolTip(true, undefined))).toEqual(
      'Cannot save threshold at organization level. Please select a Venue or AP to set a threshold.'
    )
  })
  it('should return correct intl for RA', async () => {
    expect(getDisabledToolTip(true, 'true')).toEqual(defineMessage({
      defaultMessage:
      // eslint-disable-next-line max-len
      'Cannot save threshold at organization level. Please select a SZ or any other network node to set a threshold.'
    }))
  })
  it('should hide buttons when disabled', async () => {
    const profile = getUserProfile()
    setUserProfile({ ...profile, profile: {
      ...profile.profile, roles: [RolesEnum.READ_ONLY]
    } })
    render(
      <Provider>
        <ThresholdConfig
          thresholdValue={10}
          percent={100}
          unit={defineMessage({ defaultMessage: 'seconds' })}
          shortXFormat={shortXFormat}
          onReset={jest.fn()}
          onApply={jest.fn()}
          disabled={true}
        />
      </Provider>
    )
    expect(await screen.findByText('100%')).toBeInTheDocument()
    expect(screen.queryByText('Apply')).not.toBeInTheDocument()
    expect(screen.queryByText('Reset')).not.toBeInTheDocument()
  })
})
