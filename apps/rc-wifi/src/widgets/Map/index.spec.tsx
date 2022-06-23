import { render, screen } from '@testing-library/react'

import { Provider } from '@acx-ui/store'

import { Map } from './'

describe('Map', () => {
  it('should not render map if feature flag is off', async () => {
    render(
      <Provider>
        <Map />
      </Provider>
    )
    await screen.findByText('Map is not enabled')
  })
})
