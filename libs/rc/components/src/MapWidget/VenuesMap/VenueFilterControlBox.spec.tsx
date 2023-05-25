import { ApVenueStatusEnum }         from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import VenueFilterControlBox from './VenueFilterControlBox'

describe('VenueFilterControlBox', () => {
  it('should render correctly', async () => {
    const handleChange = jest.fn()
    localStorage.setItem('dashboard-gmap-filter', JSON.stringify({
      [ApVenueStatusEnum.REQUIRES_ATTENTION]: true,
      [ApVenueStatusEnum.TRANSIENT_ISSUE]: true,
      [ApVenueStatusEnum.IN_SETUP_PHASE]: false,
      [ApVenueStatusEnum.OPERATIONAL]: true
    }))
    const { asFragment } = render(
      <Provider>
        <VenueFilterControlBox onChange={handleChange}/>
      </Provider>
    )
    expect(asFragment()).toMatchSnapshot()
    expect(screen.getAllByRole('checkbox')).toHaveLength(4)
  })

  it('should trigger onChange when venue filter is changed', async () => {
    const handleChange = jest.fn()
    render(
      <Provider>
        <VenueFilterControlBox onChange={handleChange}/>
      </Provider>
    )
    fireEvent.click(screen.getAllByRole('checkbox')[0]) // click on first checkbox i.e. Requires Attention
    expect(handleChange).toHaveBeenCalledWith({
      key: '3_RequiresAttention',
      value: false
    })
  })
})
