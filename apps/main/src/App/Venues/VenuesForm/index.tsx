import React, { useState, useEffect, useRef } from 'react'

import { Wrapper }     from '@googlemaps/react-wrapper'
import { Form, Input } from 'antd'
import TextArea        from 'antd/lib/input/TextArea'
// import ReactDOM            from 'react-dom'

import { PageHeader } from '@acx-ui/components'
import { get }        from '@acx-ui/config'
// import { useLazyNetworkListQuery } from '@acx-ui/rc/services'
// import { useParams }               from '@acx-ui/react-router-dom'

import VenueMap from './VenueMap'


const Marker: React.FC<google.maps.MarkerOptions> = (options) => {
  const [marker, setMarker] = React.useState<google.maps.Marker>()

  React.useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker())
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null)
      }
    }
  }, [marker])

  React.useEffect(() => {
    if (marker) {
      marker.setOptions(options)
    }
  }, [marker, options])

  return null
}

export function VenuesForm () {
  const [form] = Form.useForm()
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<any>({
    lat: 0,
    lng: 0
  })
  const [markers, setMarkers] = React.useState<google.maps.LatLng>()

  const ref = useRef<any>(null)

  const render = (Status: string | null | undefined) => {
    return <h1>{Status}</h1>
  }

  useEffect(() => {
    // here I have to use this if clause to avoid the crash
  }, [])

  return (
    <>
      <PageHeader
        title='Add New Venue'
        breadcrumb={[
          { text: 'Venues', link: '/venues' }
        ]}
      />
      <Form
        layout='vertical'
        wrapperCol={{ span: 6 }}
        form={form}
      >
        <Form.Item
          name='name'
          label='Venue Name'
          rules={[{ required: true }]}
          children={<Input />} />
        <Form.Item
          name='description'
          label='Description'
          children={<TextArea rows={2} maxLength={64} />} />
        {/*
        <Form.Item
        name='tags'
        label='Tags:'
        children={<Input />} />
        */}
        <Form.Item
          name='address'
          label='Address'
          rules={[{ required: true }]}
        ><Input
            id='address-input'
            ref={ref}
            onChange={(event) => {
              const autocomplete = new google.maps.places.Autocomplete(event.target)
              autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace()
                console.log(place)
                const lat = place.geometry?.location?.lat()
                const lnt = place.geometry?.location?.lng()
                form.setFieldsValue({
                  address: place.formatted_address
                })
                if (!place.geometry || !place.geometry.location) {
                  // User entered the name of a Place that was not suggested and
                  // pressed the Enter key, or the Place Details request failed.
                  window.alert('No details available for input: ' + place.name )
                  return
                }
                const latlng = new google.maps.LatLng({
                  lat: Number(lat), 
                  lng: Number(lnt)
                })
                setMarkers(latlng)
                setCenter(latlng)
                setZoom(16)
              })
            }
            }
          />
        </Form.Item>
        <Wrapper
          apiKey={get('GOOGLE_MAPS_KEY')}
          libraries={['places']}
          render={render}
        >
          
          <VenueMap 
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            zoom={zoom}
            center={center}
          >
            <Marker key={0} position={markers} />
          </VenueMap>
        </Wrapper>
      </Form>
    </>
  )
}
