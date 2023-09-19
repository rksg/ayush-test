import React, { useState, useRef, useEffect, useContext } from 'react'

import { Row, Col, Form, Input, Select } from 'antd'
import _                                 from 'lodash'
import { useIntl }                       from 'react-intl'

import {
  GoogleMap,
  GoogleMapMarker,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { SearchOutlined }         from '@acx-ui/icons'
import {
  wifiCountryCodes,
  GoogleMapWithPreference,
  usePlacesAutocomplete
} from '@acx-ui/rc/components'
import {
  useAddVenueMutation,
  useLazyVenuesListQuery,
  useGetVenueQuery,
  useUpdateVenueMutation
} from '@acx-ui/rc/services'
import {
  Address,
  VenueExtended,
  checkObjectNotExists,
  redirectPreviousPage,
  whitespaceOnlyRegExp
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { validationMessages } from '@acx-ui/utils'

import { MessageMapping }   from '../../Administration/AccountSettings/MessageMapping'
import { VenueEditContext } from '../VenueEdit'

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
  const isMapEnabled = useIsSplitOn(Features.G_MAP)

  const navigate = useNavigate()
  const formRef = useRef<StepsFormLegacyInstance<VenueExtended>>()
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
  const [countryCode, setCountryCode] = useState('')

  const { tenantId, venueId, action } = useParams()
  const { data } = useGetVenueQuery({ params: { tenantId, venueId } }, { skip: !venueId })
  const { previousPath } = useContext(VenueEditContext)

  useEffect(() => {
    if (data) {
      const defaultCountryCode = data.address?.countryCode
      ?? wifiCountryCodes.find(code => code.label === data.address.country)?.value
      ?? ''
      setCountryCode(defaultCountryCode)

      formRef.current?.setFieldsValue({
        name: data?.name,
        description: data?.description,
        address: { ...data?.address, countryCode: defaultCountryCode }
      })
      updateAddress(data?.address as Address)


      if (isMapEnabled && window.google) {
        const latlng = new google.maps.LatLng({
          lat: Number(data?.address?.latitude),
          lng: Number(data?.address?.longitude)
        })
        setMarker(latlng)
        setCenter(latlng.toJSON())
        setZoom(16)
      }
    }

    if ( action !== 'edit') { // Add mode
      const initialAddress = isMapEnabled ? '' : defaultAddress.addressLine
      formRef.current?.setFieldValue(['address', 'addressLine'], initialAddress)
    }
  }, [data, isMapEnabled, window.google])

  useEffect(() => {
    if (action === 'edit' && address.country && data ) {
      const isSameCountry = (data.address.country === address.country) || false
      let errors = []
      if (!isSameCountry) {
        errors.push(intl.$t(
          { defaultMessage: 'Address must be in {country}' },
          { country: data.address.country }
        ))
      }
      formRef.current?.setFields([{
        name: ['address', 'addressLine'],
        errors
      }])
    }
  }, [data, address, action])

  const venuesListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }
  const [venuesList] = useLazyVenuesListQuery()
  const nameValidator = async (value: string) => {
    if ([...value].length !== JSON.stringify(value).normalize().slice(1, -1).length) {
      return Promise.reject(intl.$t(validationMessages.name))
    }
    const payload = { ...venuesListPayload, searchString: value }
    const list = (await venuesList({ params, payload }, true)
      .unwrap()).data.filter(n => n.id !== data?.id).map(n => ({ name: n.name }))
    return checkObjectNotExists(list, { name: value } , intl.$t({ defaultMessage: 'Venue' }))
  }

  const addressValidator = async (value: string) => {
    const isEdit = action === 'edit'
    const isSameValue = value === formRef.current?.getFieldValue('address')?.addressLine
    const isSameCountry = (data && (data?.address.country === address?.country)) || false

    if(!address.addressLine){
      return Promise.reject(
        intl.$t({ defaultMessage: 'Please select address from suggested list' })
      )
    }

    if (address.country === address.city && address.city === address.addressLine) {
      return Promise.reject(
        intl.$t(
          { defaultMessage: 'Make sure to include a city and country in the address' }
        )
      )
    }

    if (isEdit && !_.isEmpty(value) && isSameValue && !isSameCountry) {
      return Promise.reject(
        intl.$t(
          { defaultMessage: 'Address must be in {country}' },
          { country: data?.address.country }
        )
      )
    }
    return Promise.resolve()
  }

  const addressOnChange = async (place: google.maps.places.PlaceResult) => {
    const { latlng, address } = await addressParser(place)
    formRef.current?.setFieldValue('address',
      action === 'edit' ? { ...address, countryCode } : address) // Keep countryCode for edit mode
    setMarker(latlng)
    setCenter(latlng.toJSON())
    updateAddress(address)
    setZoom(16)
  }
  const { ref: placeInputRef } = usePlacesAutocomplete({
    onPlaceSelected: addressOnChange
  })

  const handleAddVenue = async (values: VenueExtended) => {
    try {
      const formData = { ...values }
      formData.address = countryCode ? { ...address, countryCode } : address
      await addVenue({ params, payload: formData }).unwrap()

      navigate(linkToVenues, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleEditVenue = async (values: VenueExtended) => {
    try {
      const formData = { ...values }
      formData.address = countryCode ? { ...address, countryCode } : address
      await updateVenue({ params, payload: formData }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      {action !== 'edit' && <PageHeader
        title={intl.$t({ defaultMessage: 'Add New Venue' })}
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'Venues' }), link: '/venues' }
        ]}
      />}
      <StepsFormLegacy
        formRef={formRef}
        onFinish={action === 'edit' ? handleEditVenue : handleAddVenue}
        onCancel={() =>
          redirectPreviousPage(navigate, previousPath, linkToVenues)
        }
        buttonLabel={{ submit: action === 'edit' ?
          intl.$t({ defaultMessage: 'Save' }):
          intl.$t({ defaultMessage: 'Add' }) }}
      >
        <StepsFormLegacy.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item
                name='name'
                label={intl.$t({ defaultMessage: 'Venue Name' })}
                rules={[
                  { type: 'string', required: true },
                  { min: 2, transform: (value) => value.trim() },
                  { max: 32, transform: (value) => value.trim() },
                  { validator: (_, value) => whitespaceOnlyRegExp(value) },
                  {
                    validator: (_, value) => nameValidator(value)
                  }
                ]}
                validateFirst
                hasFeedback
                children={<Input />}
                validateTrigger={'onBlur'}
              />
              <Form.Item
                name='description'
                label={intl.$t({ defaultMessage: 'Description' })}
                children={<Input.TextArea rows={2} maxLength={180} />}
              />
              {/* // TODO: Waiting for TAG feature support
              <Form.Item
              name='tags'
              label='Tags:'
              children={<Input />} />
              */}
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={10}>
              <GoogleMap.FormItem
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
                  }, {
                    validator: (_, value) => addressValidator(value),
                    validateTrigger: 'onBlur'
                  }
                  ]}
                >
                  <Input
                    allowClear
                    placeholder={intl.$t({ defaultMessage: 'Set address here' })}
                    prefix={<SearchOutlined />}
                    data-testid='address-input'
                    ref={placeInputRef}
                    disabled={!isMapEnabled}
                  />
                </Form.Item>
                {isMapEnabled ?
                  <GoogleMapWithPreference
                    libraries={['places']}
                    mapTypeControl={false}
                    streetViewControl={false}
                    fullscreenControl={false}
                    zoom={zoom}
                    center={center}
                  >
                    {marker && <GoogleMapMarker position={marker} />}
                  </GoogleMapWithPreference>
                  :
                  <GoogleMap.NotEnabled />
                }
              </GoogleMap.FormItem>
            </Col>
          </Row>
          {isMapEnabled &&
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item
                label={intl.$t({ defaultMessage: 'Wi-Fi Country Code' })}
                tooltip={intl.$t( MessageMapping.wifi_country_code_tooltip )}
                name={['address', 'countryCode']}
              >
                <Select
                  options={wifiCountryCodes}
                  onChange={(countryCode: string) => setCountryCode(countryCode)}
                  showSearch
                  allowClear
                  optionFilterProp='label'
                  placeholder='Please select a country'
                  disabled={action === 'edit'}
                />
              </Form.Item>
            </Col>
          </Row>
          }
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
