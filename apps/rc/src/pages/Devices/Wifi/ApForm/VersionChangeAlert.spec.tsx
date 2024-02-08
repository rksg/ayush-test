
import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { render, screen } from '@acx-ui/test-utils'

import { VersionChangeAlert } from './VersionChangeAlert'


describe('VersionChangeAlert', () => {
  it('renders the correct message when the condition is met', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(<VersionChangeAlert
      targetVenueVersion={'7.0.0.103.1'}
      apFirmwareVersion={'7.0.0.104.1'}
    />)

    // eslint-disable-next-line max-len
    expect(await screen.findByText('Moving to this venue involves a firmware version downgrade. Please consider the impact on AP stability before proceeding.')).toBeInTheDocument()
  })

  it('renders nothing when the condition is not met', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { rerender } = render(<VersionChangeAlert
      targetVenueVersion={'7.0.0.104.1'}
      apFirmwareVersion={'7.0.0.104.1'}
    />)

    // eslint-disable-next-line max-len
    expect(screen.queryByText('Moving to this venue involves a firmware version downgrade. Please consider the impact on AP stability before proceeding.')).toBeNull()

    rerender(<VersionChangeAlert
      targetVenueVersion={'7.0.0.104.1'}
      apFirmwareVersion={'7.0.0.103.1'}
    />)

    // eslint-disable-next-line max-len
    expect(screen.queryByText('Moving to this venue involves a firmware version downgrade. Please consider the impact on AP stability before proceeding.')).toBeNull()
  })
})
