import React, { useRef, useEffect } from 'react'

import { Wrapper, WrapperProps, Status } from '@googlemaps/react-wrapper'
import { useIntl }                       from 'react-intl'

import { get } from '@acx-ui/config'

import { Loader } from '../Loader'
import { NoData } from '../NoData'

import * as UI from './styledComponents'

export interface MapProps extends google.maps.MapOptions {
  style?: React.CSSProperties
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
  libraries: WrapperProps['libraries']
}

export const GoogleMap = ({
  libraries,
  ...props
}: MapProps) => {
  const { $t } = useIntl()
  return <Wrapper
    apiKey={get('GOOGLE_MAPS_KEY')}
    language={'en'}
    version='3.49'
    libraries={libraries}
    render={(status) => {
      switch (status) {
        case Status.LOADING: return <Loader />
        case Status.SUCCESS: return <Map {...props} />
        case Status.FAILURE: return <Loader states={[{
          isLoading: false,
          error: new Error($t({ defaultMessage: 'Failed to load Google Maps' }))
        }]} />
      }
    }}
  />
}

const Map: React.FC<Omit<MapProps, 'libraries'>> = ({
  children, ...options
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map>()

  useEffect(() => {
    if (!ref.current) return
    mapRef.current = new google.maps.Map(ref.current)
  }, [ref])

  useEffect(() => { mapRef.current?.setOptions(options) }, [mapRef, options])

  return (
    <>
      <UI.MapContainer ref={ref} />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // set the map prop on the child component
          // @ts-ignore
          return React.cloneElement(child, { map: mapRef.current })
        } else {
          return null
        }
      })}
    </>
  )
}

const NotEnabled = () => {
  const { $t } = useIntl()
  return <UI.MapContainer>
    <NoData text={$t({ defaultMessage: 'Map is not enabled' })} />
  </UI.MapContainer>
}

GoogleMap.NotEnabled = NotEnabled
GoogleMap.FormItem = UI.FormItem
