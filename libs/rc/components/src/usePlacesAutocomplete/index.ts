import { useRef, useEffect } from 'react'

// TODO: import { Loader } from '@googlemaps/js-api-loader'
import { InputRef } from 'antd'

import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'

export function usePlacesAutocomplete ( props:
  {
    onPlaceSelected?: (place: google.maps.places.PlaceResult)=>void
  }
) {
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const inputRef = useRef<InputRef>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete>()
  const { onPlaceSelected } = props

  useEffect(() => {
    if (isMapEnabled && window.google?.maps?.places
      && inputRef.current?.input && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current.input)
      autocompleteRef.current.addListener('place_changed', async () => {
        if (autocompleteRef?.current && onPlaceSelected) {
          const place = autocompleteRef.current.getPlace()
          onPlaceSelected(place)
        }
      })
    }
  }, [isMapEnabled, onPlaceSelected])

  return {
    ref: inputRef,
    autocompleteRef
  }
}
