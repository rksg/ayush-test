import React, { useState, useEffect, useRef, ChangeEventHandler } from 'react'

import { Wrapper } from '@googlemaps/react-wrapper'
import {
  Form,
  Input,
  Row,
  Col,
  Typography
} from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import styled   from 'styled-components/macro'

import { PageHeader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { get }                                                 from '@acx-ui/config'
import { useSplitTreatment }                                   from '@acx-ui/feature-toggle'
import { Close, SearchOutlined }                               from '@acx-ui/icons'
import { useAddVenueMutation, useLazyVenuesListQuery }         from '@acx-ui/rc/services'
import { Address, VenueSaveData, checkObjectNotExists }        from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import VenueMap from './VenueMap'
// import ReactDOM            from 'react-dom'

export const CloseIcon = styled.svg`
  width: 10px;
  height: 10px;
  path {
    stroke: var(--acx-primary-black);
  }
`

export const Marker: React.FC<google.maps.MarkerOptions> = (options) => {
  const [marker, setMarker] = React.useState<google.maps.Marker>()

  useEffect(() => {
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

  useEffect(() => {
    if (marker) {
      marker.setOptions(options)
    }
  }, [marker, options])

  return null
}
interface AddressComponent {
  long_name?: string;
  short_name?: string;
  types?: Array<string>;
}

export const retrieveCityState = (address_components: Array<AddressComponent>, country: string) => {

  // array reverse applied since search should be done from general to specific, google provides from vice-versa
  const reversed_addr_components = address_components.reverse()

  /** Step 1. Looking for locality / sublocality_level_X / postal_town */
  let city_component = reversed_addr_components.find(el => {
    return el.types?.includes('locality')
      || el.types?.some((t: string) => /sublocality_level_[1-5]/.test(t))
      || el.types?.includes('postal_town')
  })

  /** Step 2. If nothing found, proceed with administrative_area_level_2-5 / neighborhood
   * administrative_area_level_1 excluded from search since considered as `political state`
   */
  if (!city_component) {
    city_component = reversed_addr_components.find(el => {
      return el.types?.includes('neighborhood')
        || el.types?.some((t: string) => /administrative_area_level_[2-5]/.test(t))
    })
  }

  const state_component = address_components
    .find(el => el.types?.includes('administrative_area_level_1'))


  // Address in some country doesn't have city and state component, we will use the country as the default value of the city.
  if (!city_component && !state_component) {
    city_component = { long_name: country }
  }

  return {
    city: city_component? city_component.long_name: '',
    state: state_component ? state_component.long_name : null
  }
}

export const addressParser = async (place: google.maps.places.PlaceResult) => {
  const address: Address = {}
  const lat = place.geometry?.location?.lat()
  const lng = place.geometry?.location?.lng()
  address.latitude = lat
  address.longitude = lng

  // eslint-disable-next-line max-len
  const timezoneResult = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${get('GOOGLE_MAPS_KEY')}`)
  const timezone = await timezoneResult.json()
  address.timezone = timezone.timeZoneId
  
  address.addressLine = place.formatted_address
  

  const latlng = new google.maps.LatLng({
    lat: Number(lat),
    lng: Number(lng)
  })

  const countryObj = place?.address_components?.find(
    el => el.types.includes('country')
  )
  const country = countryObj && countryObj.long_name || ''
  address.country = country

  if (place && place.address_components) {
    const city_obj = retrieveCityState(
      place.address_components,
      country
    )
    if (city_obj) {
      address.city = city_obj.state
        ? `${city_obj.city}, ${city_obj.state}` : city_obj.city
    }
  }
  return { latlng, address }
}

export function VenuesForm () {
  const isMapEnabled = useSplitTreatment('acx-ui-maps-api-toggle')
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance<VenueSaveData>>()
  const params = useParams()

  const linkToVenues = useTenantLink('/venues')
  const [addVenue] = useAddVenueMutation()
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0
  })
  const [markers, setMarkers] = React.useState<google.maps.LatLng>()

  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : {
    addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
    city: 'Sunnyvale, California',
    country: 'United States',
    latitude: 37.4112751,
    longitude: -122.0191908,
    timezone: 'America/Los_Angeles'
  })

  const render = (Status: string | null | undefined) => {
    return <h1>{Status}</h1>
  }

  const venuesListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }
  const [venuesList] = useLazyVenuesListQuery()

  const nameValidator = async (value: string) => {
    const payload = { ...venuesListPayload, searchString: value }
    const list = (await venuesList({ params, payload }, true)
      .unwrap()).data.map(n => ({ name: n.name }))
    return checkObjectNotExists(list, value, 'Venue')
  }

  const addressValidator = async () => {
    if(Object.keys(address).length === 0){
      return Promise.reject('Please select address from suggested list')
    }
    return Promise.resolve()
  }

  const addressOnChange: ChangeEventHandler<HTMLInputElement> =
  async (event: { target: HTMLInputElement }) => {

    updateAddress({})
    const autocomplete = new google.maps.places.Autocomplete(event.target)
    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace()
      
      formRef.current?.setFieldsValue({
        address: { addressLine: place.formatted_address }
      })

      const { latlng, address } = await addressParser(place)

      setMarkers(latlng)
      setCenter(latlng.toJSON())
      updateAddress(address)
      setZoom(16)
    })
  }

  const handleAddVenue = async (values: VenueSaveData) => {
    try {
      const formData = { ...values }
      formData.address = address
      await addVenue({ params, payload: formData }).unwrap()
      navigate(linkToVenues, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: 'An error occurred'
      })
    }
  }

  return (
    <>
      <PageHeader
        title='Add New Venue'
        breadcrumb={[
          { text: 'Venues', link: '/venues' }
        ]}
      />
      <StepsForm
        formRef={formRef}
        onFinish={handleAddVenue}
        onCancel={() => navigate(linkToVenues)}
      >
        <StepsForm.StepForm>
          <Form.Item
            name='name'
            label='Venue Name'
            rules={[{
              required: true
            },{
              validator: (_, value) => nameValidator(value),
              validateTrigger: 'onChange'
            }]}
            wrapperCol={{ span: 5 }}
            validateFirst
            hasFeedback
            children={<Input />} />
          <Form.Item
            name='description'
            label='Description'
            wrapperCol={{ span: 5 }}
            children={<TextArea rows={2} maxLength={180} />} />
          {/*
        <Form.Item
        name='tags'
        label='Tags:'
        children={<Input />} />
        */}
          <Row align='middle'>
            <Col span={2} style={{ textAlign: 'left' }}>
              <span className='ant-form-item-label'>
                <label className='ant-form-item-required'>Address</label>
              </span>
            </Col>
            <Col span={9} style={{ textAlign: 'left', paddingLeft: '2rem' }}>
              <span className='ant-form-item-label'>
                <label>Make sure to include a city and country in the address</label>
              </span>
            </Col>
          </Row>
          <div 
            style={{
              width: '470px',
              height: '260px',
              position: 'relative',
              marginBottom: '30px' 
            }}>
            <div className='addressContainer' 
              style={{ 
                position: 'absolute',
                zIndex: 10,
                width: '450px',
                margin: '12px' 
              }}>
              <Form.Item
                name={['address', 'addressLine']}
                rules={[{
                  required: isMapEnabled ? true : false
                },{
                  validator: () => addressValidator(),
                  validateTrigger: 'onChange'
                }]}
              >
                <Input
                  allowClear={{ clearIcon: 
                  <CloseIcon><Close width='10' height='10' /></CloseIcon>
                  }}
                  prefix={<SearchOutlined />}
                  onChange={addressOnChange}
                  data-testid='address-input'
                  defaultValue={!isMapEnabled ? '350 W Java Dr, Sunnyvale, CA 94089, USA' : ''}
                  disabled={!isMapEnabled}
                  value={address.addressLine}
                />
              </Form.Item>
            </div>
            {isMapEnabled ? 
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
              :
              <Typography.Title level={2}
                style={{ textAlign: 'center', paddingTop: '3em' }}
              >
              Map is not enabled
              </Typography.Title>
            }
          </div>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
