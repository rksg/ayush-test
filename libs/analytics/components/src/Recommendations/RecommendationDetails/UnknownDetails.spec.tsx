import { BrowserRouter, useLocation } from 'react-router-dom'

import { get }            from '@acx-ui/config'
import { render, screen } from '@acx-ui/test-utils'

import { UnknownDetails } from './UnknownDetails'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn()
}))
const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('Insufficient Licenses', () => {
  it('renders correctly for insufficient licenses', async () => {
    jest.mocked(useLocation).mockReturnValue({
      search: `?status=insufficientLicenses&date=2023-11-09T06:00:00.000Z
      &sliceValue=TestInsufficientLicenses&extra=null`,
      state: undefined,
      key: '',
      pathname: '',
      hash: ''
    })

    render(<BrowserRouter>
      <UnknownDetails />
    </BrowserRouter>)

    expect(await screen.findByText('Insufficient Licenses')).toBeVisible()
    expect(await screen.findByText('TestInsufficientLicenses')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('RUCKUS AI will not be able to generate an RRM recommendation due to Venue TestInsufficientLicenses license compliance being incomplete. Ensure you have sufficient license subscriptions and have assigned licenses for all your APs to your venue to meet the 100% venue license compliance. This is a prerequisite to enable RUCKUS AI to optimize your network RRM configuration.')).toBeVisible()
  })

  it('renders correctly for verification error with mesh', async () => {
    jest.mocked(useLocation).mockReturnValue({
      search: `?status=verificationError&date=2023-11-09T06:00:00.000Z
      &sliceValue=TestVerificationError&extra=mesh`,
      state: undefined,
      key: '',
      pathname: '',
      hash: ''
    })

    render(<BrowserRouter>
      <UnknownDetails />
    </BrowserRouter>)

    expect(await screen.findByText('Verification Error')).toBeVisible()
    expect(await screen.findByText('TestVerificationError')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('RUCKUS AI has detected mesh configuration in your zone and this configuration is not supported for RRM recommendations.')).toBeVisible()
  })

  it('renders correctly for verification error with global_zone_checker', async () => {
    jest.mocked(useLocation).mockReturnValue({
      search: `?status=verificationError&date=2023-11-09T06:00:00.000Z
      &sliceValue=TestVerificationError&extra=global_zone_checker`,
      state: undefined,
      key: '',
      pathname: '',
      hash: ''
    })

    render(<BrowserRouter>
      <UnknownDetails />
    </BrowserRouter>)

    expect(await screen.findByText('Verification Error')).toBeVisible()
    expect(await screen.findByText('TestVerificationError')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('RUCKUS AI will not be able to generate RRM recommendations as the controller version is below pre-requisite levels. Please upgrade your controller to v5.2.1 and above.')).toBeVisible()
  })

  it('renders correctly for verified', async () => {
    jest.mocked(useLocation).mockReturnValue({
      search: `?status=verified&date=2023-11-09T06:00:00.000Z
      &sliceValue=TestVerified&extra=null`,
      state: undefined,
      key: '',
      pathname: '',
      hash: ''
    })
    render(<BrowserRouter>
      <UnknownDetails />
    </BrowserRouter>)

    expect(await screen.findByText('Verified')).toBeVisible()
    expect(await screen.findByText('TestVerified')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Your venue is already AI verified and in an optimal state. RUCKUS AI does not recommend any changes to your RRM configuration. The venue will continue to be monitored and a recommendation will be raised if an improvement is needed.')).toBeVisible()
  })

  it('renders correctly for insufficient licenses in RA SA', async () => {
    mockGet.mockReturnValue(true)
    jest.mocked(useLocation).mockReturnValue({
      search: `?status=insufficientLicenses&date=2023-11-09T06:00:00.000Z
      &sliceValue=TestInsufficientLicenses&extra=null`,
      state: undefined,
      key: '',
      pathname: '',
      hash: ''
    })

    render(<BrowserRouter>
      <UnknownDetails />
    </BrowserRouter>)

    expect(await screen.findByText('Insufficient Licenses')).toBeVisible()
    expect(await screen.findByText('TestInsufficientLicenses')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('RUCKUS AI will not be able to generate an RRM recommendation due to Zone TestInsufficientLicenses license compliance being incomplete. Ensure you have sufficient license subscriptions and have assigned licenses for all your APs to your zone to meet the 100% zone license compliance. This is a prerequisite to enable RUCKUS AI to optimize your network RRM configuration.')).toBeVisible()
  })
})
