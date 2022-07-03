import { initialize } from '@googlemaps/jest-mocks'
import { Loader }     from '@googlemaps/js-api-loader'


import { BrowserRouter as Router }                        from '@acx-ui/react-router-dom'
import { Provider }                                       from '@acx-ui/store'
import { act, queryByAttribute, render, screen, waitFor } from '@acx-ui/test-utils'

import { VenuesMap } from './'


jest.mock('@acx-ui/config', () => ({
  __esModule: true,
  get: jest.fn().mockReturnValue('some-key')
}))

const executeLoaderCallback = async (): Promise<void> => {
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    const loader = Loader['instance']
    loader.callback()
    await waitFor(() => loader.done)
  })
}

describe('VenuesMap', () => {
  beforeEach(() => {
    initialize()
  })

  it('should load google maps api using the key from env', async () => {
    render(
      <Router>
        <Provider>
          <VenuesMap data={[]} cluster />
        </Provider>
      </Router>
    )

    expect(screen.getByRole('heading').textContent).toEqual('LOADING')

    // eslint-disable-next-line testing-library/no-node-access
    const script = document.getElementsByTagName('script')[0]
    expect(script.src).toEqual(
      'https://maps.googleapis.com/maps/api/js' +
      '?callback=__googleMapsCallback&key=some-key&libraries=places')
  })
  it('should load the child component after api is loaded successfully', async () => {
    const { container } = render(
      <Router>
        <Provider>
          <VenuesMap data={[]} cluster />
        </Provider>
      </Router>
    )
    
    await executeLoaderCallback() // Will make render return success
    const getById = queryByAttribute.bind(null, 'id')
    const map = getById(container, 'map')
    expect(map).toBeTruthy()  
  })
})
