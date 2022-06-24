import { render, screen } from '@testing-library/react'

import { Provider } from '@acx-ui/store'

import { VenuesMap } from './'

jest.mock('@acx-ui/config', () => ({
  __esModule: true,
  get: jest.fn().mockReturnValue('some-key')
}))

describe('VenuesMap', () => {
  it('should load google maps api', async () => {
    render(
      <Provider>
        <VenuesMap data={[]} cluster />
      </Provider>
    )

    const status = screen.getByRole('heading').textContent
    expect(status).toEqual('LOADING')

    // grab the script from the document
    // eslint-disable-next-line testing-library/no-node-access
    const script = document.getElementsByTagName('script')[0]
    expect(script.src).toEqual(
      'https://maps.googleapis.com/maps/api/js' +
      '?callback=__googleMapsCallback&key=some-key&libraries=places')
  })
})
