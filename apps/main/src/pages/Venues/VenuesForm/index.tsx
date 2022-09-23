import React, { useState, useRef, ChangeEventHandler, useEffect } from 'react'

import { Row, Col, Form, Input, Typography } from 'antd'
import { useIntl }                           from 'react-intl'

import {
  GoogleMap,
  GoogleMapMarker,
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { get }               from '@acx-ui/config'
import { useSplitTreatment } from '@acx-ui/feature-toggle'
import { SearchOutlined }    from '@acx-ui/icons'
import {
  useAddVenueMutation,
  useLazyVenuesListQuery,
  useGetVenueQuery,
  useUpdateVenueMutation
} from '@acx-ui/rc/services'
import { Address, VenueSaveData, checkObjectNotExists } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

interface AddressComponent {
  long_name?: string;
  short_name?: string;
  types?: Array<string>;
}

export const retrieveCityState = (addressComponents: Array<AddressComponent>, country: string) => {

  // array reverse applied since search should be done from general to specific, google provides from vice-versa
  const reversedAddrComponents = addressComponents.reverse()

  /** Step 1. Looking for locality / sublocality_level_X / postal_town */
  let cityComponent = reversedAddrComponents.find(el => {
    return el.types?.includes('locality')
      || el.types?.some((t: string) => /sublocality_level_[1-5]/.test(t))
      || el.types?.includes('postal_town')
  })

  /** Step 2. If nothing found, proceed with administrative_area_level_2-5 / neighborhood
   * administrative_area_level_1 excluded from search since considered as `political state`
   */
  if (!cityComponent) {
    cityComponent = reversedAddrComponents.find(el => {
      return el.types?.includes('neighborhood')
        || el.types?.some((t: string) => /administrative_area_level_[2-5]/.test(t))
    })
  }

  const stateComponent = addressComponents
    .find(el => el.types?.includes('administrative_area_level_1'))


  // Address in some country doesn't have city and state component, we will use the country as the default value of the city.
  if (!cityComponent && !stateComponent) {
    cityComponent = { long_name: country }
  }

  return {
    city: cityComponent? cityComponent.long_name: '',
    state: stateComponent ? stateComponent.long_name : null
  }
}

export const addressParser = async (place: google.maps.places.PlaceResult) => {
  const address: Address = {}
  const lat = place.geometry?.location?.lat()
  const lng = place.geometry?.location?.lng()
  address.latitude = lat
  address.longitude = lng

  // eslint-disable-next-line max-len
  const timezone = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${get('GOOGLE_MAPS_KEY')}`)
    .then(res => res.json())
  address.timezone = timezone.timeZoneId
  address.addressLine = place.formatted_address

  const latlng = new google.maps.LatLng({
    lat: Number(lat),
    lng: Number(lng)
  })

  const countryObj = place?.address_components?.find(
    el => el.types.includes('country')
  )
  const country = countryObj?.long_name ?? ''
  address.country = country

  if (place && place.address_components) {
    const cityObj = retrieveCityState(
      place.address_components,
      country
    )
    if (cityObj) {
      address.city = cityObj.state
        ? `${cityObj.city}, ${cityObj.state}` : cityObj.city
    }
  }
  return { latlng, address }
}

const defaultAddress: Address = {
  addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
  city: 'Sunnyvale, California',
  country: 'United States',
  latitude: 37.4112751,
  longitude: -122.0191908,
  timezone: 'America/Los_Angeles'
}

export function VenuesForm () {
  const intl = useIntl()
  const isMapEnabled = useSplitTreatment('acx-ui-maps-api-toggle')
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance<VenueSaveData>>()
  const params = useParams()

  const linkToVenues = useTenantLink('/venues')
  const [addVenue] = useAddVenueMutation()
  const [updateVenue] = useUpdateVenueMutation()
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0
  })
  const [marker, setMarker] = React.useState<google.maps.LatLng>()
  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : defaultAddress)

  const { tenantId, venueId, action } = useParams()
  const { data } = useGetVenueQuery({ params: { tenantId, venueId } })

  useEffect(() => {
    if(data){
      formRef.current?.setFieldsValue({
        name: data?.name,
        description: data?.description,
        address: data?.address
      })
      updateAddress(data?.address as Address)

      if(isMapEnabled){
        const latlng = new google.maps.LatLng({
          lat: Number(data?.address?.latitude),
          lng: Number(data?.address?.longitude)
        })
        setMarker(latlng)
        setCenter(latlng.toJSON())
        setZoom(16)
      }
    }
  }, [data])

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
      .unwrap()).data.filter(n => n.id !== data?.id).map(n => ({ name: n.name }))
    return checkObjectNotExists(intl, list, { name: value } , intl.$t({ defaultMessage: 'Venue' }))
  }

  const addressValidator = async () => {
    if(Object.keys(address).length === 0){
      return Promise.reject(
        intl.$t({ defaultMessage: 'Please select address from suggested list' })
      )
    }
    return Promise.resolve()
  }

  const addressOnChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    updateAddress({})
    const autocomplete = new google.maps.places.Autocomplete(event.target)
    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace()

      formRef.current?.setFieldsValue({
        address: { addressLine: place.formatted_address }
      })

      const { latlng, address } = await addressParser(place)

      setMarker(latlng)
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
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleEditVenue = async (values: VenueSaveData) => {
    try {
      const formData = { ...values }
      formData.address = address
      await updateVenue({ params, payload: formData }).unwrap()
      navigate(linkToVenues, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={action === 'edit' ?
          intl.$t({ defaultMessage: 'Edit New Venue' }):
          intl.$t({ defaultMessage: 'Add New Venue' })}
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'Venues' }), link: '/venues' }
        ]}
      />
      <StepsForm
        formRef={formRef}
        onFinish={action === 'edit' ? handleEditVenue : handleAddVenue}
        onCancel={() => navigate(linkToVenues)}
        buttonLabel={{ submit: action === 'edit' ?
          intl.$t({ defaultMessage: 'Save' }):
          intl.$t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item
                name='name'
                label={intl.$t({ defaultMessage: 'Venue Name' })}
                rules={[{
                  required: true
                },{
                  validator: (_, value) => nameValidator(value)
                }]}
                validateFirst
                hasFeedback
                children={<Input />}
              />
              <Form.Item
                name='description'
                label={intl.$t({ defaultMessage: 'Description' })}
                children={<Input.TextArea rows={2} maxLength={180} />}
              />
              {/*
              <Form.Item
              name='tags'
              label='Tags:'
              children={<Input />} />
              */}
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={10}>
              <UI.AddressFormItem
                label={intl.$t({ defaultMessage: 'Address' })}
                required
                extra={intl.$t({
                  defaultMessage: 'Make sure to include a city and country in the address'
                })}
              >
                <Form.Item
                  noStyle
                  label={intl.$t({ defaultMessage: 'Address' })}
                  name={['address', 'addressLine']}
                  rules={[{
                    required: isMapEnabled ? true : false
                  },{
                    validator: () => addressValidator(),
                    validateTrigger: 'onChange'
                  }]}
                  initialValue={!isMapEnabled ? defaultAddress.addressLine : ''}
                >
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    onChange={addressOnChange}
                    data-testid='address-input'
                    disabled={!isMapEnabled}
                    value={address.addressLine}
                  />
                </Form.Item>
                <UI.AddressMap>
                  {isMapEnabled ?
                    <GoogleMap
                      libraries={['places']}
                      mapTypeControl={false}
                      streetViewControl={false}
                      fullscreenControl={false}
                      zoom={zoom}
                      center={center}
                    >
                      {marker && <GoogleMapMarker position={marker} />}
                    </GoogleMap>
                    :
                    <Typography.Title level={3}>
                      {intl.$t({ defaultMessage: 'Map is not enabled' })}
                    </Typography.Title>
                  }
                </UI.AddressMap>
              </UI.AddressFormItem>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
