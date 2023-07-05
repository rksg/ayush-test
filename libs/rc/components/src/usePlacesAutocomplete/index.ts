import { useRef, useEffect, useState } from 'react'

import { Loader as MapLoader } from '@googlemaps/js-api-loader'
import { InputRef }            from 'antd'

import { get }                    from '@acx-ui/config'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { Address }                from '@acx-ui/rc/utils'

import { usePreference } from '../usePreference'


export function usePlacesAutocomplete ( props:
  {
    onPlaceSelected?: (place: google.maps.places.PlaceResult)=>void
    currentAddress?: Address
  }
) {
  const { currentMapRegion } = usePreference()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const inputRef = useRef<InputRef>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete>()
  const { onPlaceSelected, currentAddress } = props

  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!isMapEnabled) return
    if (currentAddress && !currentAddress.addressLine) return // for Edit mode: waiting for editing value
    if (!!window.google?.maps?.places) {
      setMapReady(true)
    } else {
      const loader = new MapLoader({
        apiKey: get('GOOGLE_MAPS_KEY'),
        libraries: ['places'],
        language: 'en',
        region: currentMapRegion
      })
      loader.load().then(()=>{
        setMapReady(true)
      })
    }
  }, [isMapEnabled, currentMapRegion, currentAddress])

  useEffect(() => {
    if (mapReady && inputRef.current?.input && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current.input)
      autocompleteRef.current.addListener('place_changed', async () => {
        if (autocompleteRef.current && onPlaceSelected) {
          const place = autocompleteRef.current.getPlace()
          onPlaceSelected(place)
        }
      })
    }
  }, [mapReady, onPlaceSelected])

  return {
    ref: inputRef,
    autocompleteRef
  }
}
