import { useEffect, useRef } from 'react'

export type MarkerProps = google.maps.MarkerOptions

export const GoogleMapMarker: React.FC<google.maps.MarkerOptions> = (options) => {
  const marker = useRef<google.maps.Marker>(new google.maps.Marker())

  useEffect(() => {
    const { current } = marker
    current.setOptions(options)
    return () => { current.setMap(null) }
  }, [options])

  return null
}
