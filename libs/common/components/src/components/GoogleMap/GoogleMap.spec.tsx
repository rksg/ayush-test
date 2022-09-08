import { useState } from 'react'

import { initialize, mockInstances, Marker } from '@googlemaps/jest-mocks'
import { Loader as MapLoader }               from '@googlemaps/js-api-loader'
import userEvent                             from '@testing-library/user-event'

import { act, render, screen, waitFor } from '@acx-ui/test-utils'

import { GoogleMap }       from './GoogleMap'
import { GoogleMapMarker } from './GoogleMapMarker'

// taken from @googlemaps/react-wrapper
// ref: https://github.com/googlemaps/react-wrapper/blob/main/src/index.test.tsx#L34-L47
const executeLoaderCallback = async (e?: string | Error): Promise<void> => {
  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    const loader = MapLoader['instance']

    if (e) { loader.onerrorEvent = e }

    loader.callback()
    await waitFor(() => loader.done)
  })
}

describe('GoogleMap', () => {
  beforeEach(() => initialize())
  afterEach(() => jest.resetAllMocks())

  it('should render successfully', async () => {
    render(
      <GoogleMap
        libraries={['places']}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        zoom={1}
        center={{ lat: 0, lng: 0 }}
      >
        <GoogleMapMarker position={{ lat: 0, lng: 0 }} />
        <GoogleMapMarker position={{ lat: 10, lng: 10 }} />
      </GoogleMap>
    )

    await executeLoaderCallback()

    const markers = mockInstances.get(Marker)
    expect(markers[0].setOptions).toHaveBeenCalledWith({ position: { lat: 0, lng: 0 } })
    expect(markers[1].setOptions).toHaveBeenCalledWith({ position: { lat: 10, lng: 10 } })
  })

  it('render failed state', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})

    render(<GoogleMap
      libraries={['places']}
      mapTypeControl={false}
      streetViewControl={false}
      fullscreenControl={false}
      zoom={1}
      center={{ lat: 0, lng: 0 }}
    />)

    await executeLoaderCallback(new Error('error'))

    expect(screen.getByText(/Failed to load Google Maps/)).toBeVisible()
  })

  it('removes marker properly', async () => {
    const Map = () => {
      const [show, setShow] = useState(true)
      return <>
        <button type='button' onClick={() => setShow(false)}>Toggle</button>
        <GoogleMap
          libraries={['places']}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          zoom={1}
          center={{ lat: 0, lng: 0 }}
        >
          {show ? <GoogleMapMarker position={{ lat: 0, lng: 0 }} /> : null}
        </GoogleMap>
      </>
    }

    render(<Map />)

    await executeLoaderCallback()

    const markers = mockInstances.get(Marker)
    expect(markers).toHaveLength(1)
    expect(markers[0].setOptions).toHaveBeenCalledWith({ position: { lat: 0, lng: 0 } })

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))

    expect(markers[0].setMap).toHaveBeenCalledWith(null)
  })
})
