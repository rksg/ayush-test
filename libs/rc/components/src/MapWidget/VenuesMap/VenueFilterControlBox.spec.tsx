import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import VenueFilterControlBox from './VenueFilterControlBox'

jest.mock('@acx-ui/icons', () => ({
  ...jest.requireActual('@acx-ui/icons'),
  Close: () => <div data-testid='Close' />,
  VenueInfoMarkerGreen: () => <div data-testid='VenueInfoMarkerGreen' />,
  VenueInfoMarkerGrey: () => <div data-testid='VenueInfoMarkerGrey' />,
  VenueInfoMarkerOrange: () => <div data-testid='VenueInfoMarkerOrange' />,
  VenueInfoMarkerRed: () => <div data-testid='VenueInfoMarkerRed' />,
  VenueMarkerGreen: () => <div data-testid='VenueMarkerGreen' />,
  VenueMarkerGrey: () => <div data-testid='VenueMarkerGrey' />,
  VenueMarkerOrange: () => <div data-testid='VenueMarkerOrange' />,
  VenueMarkerRed: () => <div data-testid='VenueMarkerRed' />
}))

describe('VenueFilterControlBox', () => {
  it('should render correctly', async () => {
    const handleChange = jest.fn()
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
