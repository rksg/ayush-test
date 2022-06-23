import { render, screen } from '@testing-library/react'

import { Provider } from '@acx-ui/store'

import { Map } from './'

jest.mock('@acx-ui/feature-toggle', () => ({
  __esModule: true,
  useSplitTreatment: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true)
}))

describe('Map', () => {
  it('should not render map if feature flag is off', async () => {
    render(
      <Provider>
        <Map />
      </Provider>
    )
    await screen.findByText('Map is not enabled')
  })
  it('should render map if feature flag is on', async () => {
    const { asFragment } = render(
      <Provider>
        <Map />
      </Provider>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
