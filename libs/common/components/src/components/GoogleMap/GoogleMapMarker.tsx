import { useEffect, useRef } from 'react'

export interface MarkerProps extends google.maps.MarkerOptions {
  onDragEnd?: Function
}

export const GoogleMapMarker: React.FC<MarkerProps> = (options) => {
  const marker = useRef<google.maps.Marker>(new google.maps.Marker())

  useEffect(() => {
    const { current } = marker
    current.setOptions(options)
    return () => { current.setMap(null) }
  }, [options])

  useEffect(() => {
    if (options?.draggable && options?.onDragEnd) {
      marker.current.addListener('dragend', options?.onDragEnd)
    }
  }, [])

  return null
}
