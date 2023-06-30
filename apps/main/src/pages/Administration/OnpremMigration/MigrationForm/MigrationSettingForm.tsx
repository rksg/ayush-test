import React, { useState, useEffect, useContext } from 'react'

import {
  Col,
  Form,
  Input,
  Row,
  Typography
} from 'antd'
import {
  FormattedMessage,
  useIntl
} from 'react-intl'
import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

import {
  GoogleMap,
  GoogleMapMarker,
  StepsFormLegacy
} from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { SearchOutlined }         from '@acx-ui/icons'
import {
  GoogleMapWithPreference,
  usePlacesAutocomplete
} from '@acx-ui/rc/components'
import {
  useLazyVenuesListQuery,
  useGetVenueQuery
} from '@acx-ui/rc/services'
import {
  Address,
  MigrationActionTypes,
  checkObjectNotExists
} from '@acx-ui/rc/utils'

import MigrationContext from '../MigrationContext'

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

export const defaultAddress: Address = {
  addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
  city: 'Sunnyvale, California',
  country: 'United States',
  latitude: 37.4112751,
  longitude: -122.0191908,
  timezone: 'America/Los_Angeles'
}

type MigrationSettingFormProps = {
  className?: string,
  countryCode?: string
}

const MigrationSettingForm = styled((props: MigrationSettingFormProps) => {
  const { $t } = useIntl()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const { className, countryCode } = props
  const params = useParams()

  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0
  })
  const [marker, setMarker] = React.useState<google.maps.LatLng>()
  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : defaultAddress)

  const {
    state, dispatch
  } = useContext(MigrationContext)

  const form = Form.useFormInstance()

  const { tenantId, venueId } = useParams()
  const { data } = useGetVenueQuery({ params: { tenantId, venueId } }, { skip: !venueId })

  useEffect(() => {
    const initialAddress = isMapEnabled ? '' : defaultAddress.addressLine
    form.setFieldValue(['address', 'addressLine'], initialAddress)
    const initialAddressObj = isMapEnabled ? {} : defaultAddress
    dispatchAddress(initialAddressObj)
  }, [data, isMapEnabled])

  const venuesListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }
  const [venuesList] = useLazyVenuesListQuery()
  // const [sameCountry, setSameCountry] = useState(true)
  const nameValidator = async (value: string) => {
    const payload = { ...venuesListPayload, searchString: value }
    const list = (await venuesList({ params, payload }, true)
      .unwrap()).data.filter(n => n.id !== data?.id).map(n => ({ name: n.name }))
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Venue' }))
  }

  const addressValidator = async () => {
    if(Object.keys(address).length === 0){
      return Promise.reject(
        $t({ defaultMessage: 'Please select address from suggested list' })
      )
    }

    return Promise.resolve()
  }

  const addressOnChange = async (place: google.maps.places.PlaceResult) => {
    const { latlng, address } = await addressParser(place)

    form.setFieldValue(['address', 'addressLine'], place.formatted_address)

    setMarker(latlng)
    setCenter(latlng.toJSON())
    updateAddress(address)
    dispatchAddress(address)
    setZoom(16)
  }
  const { ref: placeInputRef } = usePlacesAutocomplete({
    onPlaceSelected: addressOnChange
  })

  const handleVenueName = (venueName: string) => {
    dispatch({
      type: MigrationActionTypes.VENUENAME,
      payload: {
        venueName: venueName
      }
    })
  }

  const handleDescription = (description: string) => {
    dispatch({
      type: MigrationActionTypes.DESCRIPTION,
      payload: {
        description: description
      }
    })
  }

  const dispatchAddress = (address: Address) => {
    dispatch({
      type: MigrationActionTypes.ADDRESS,
      payload: {
        address: address
      }
    })
  }

  return (
    <>
      <Row gutter={20} className={className}>
        <Col span={12}>
          <StepsFormLegacy.Title>{$t({ defaultMessage: 'Migration' })}</StepsFormLegacy.Title>
          <Typography.Text>
            {// eslint-disable-next-line max-len
              $t({ defaultMessage: 'Migration assistant will migrate ZoneDirector configuration from the selected backup file and create a new venue.' })}
          </Typography.Text>
          <Form.Item
            name='venueName'
            label={$t({ defaultMessage: 'New Venue Name' })}
            rules={[
              { type: 'string' },
              { min: 2 },
              { max: 32 },
              { // eslint-disable-next-line max-len
                pattern: /^\w+$/, message: $t({ defaultMessage: 'New Venue Name does not match the pattern [a-zA-Z0-9_]' }) },
              {
                validator: (_, value) => nameValidator(value)
              }
            ]}
            validateFirst
            hasFeedback
            initialValue={state.venueName}
            children={<Input
              data-testid='name'
              style={{ width: '380px' }}
              onChange={(event => {handleVenueName(event.target.value)})}
            />}
          />
          <Form.Item
            name='description'
            label={$t({ defaultMessage: 'Description' })}
            rules={[
              { max: 180 }
            ]}
            children={<Input.TextArea
              data-testid='test-description'
              rows={2}
              maxLength={180}
              style={{ width: '380px' }}
              onChange={(event => {handleDescription(event.target.value)})}
            />}
          />
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={12}>
          <Typography.Text>
            {countryCode ?
              <FormattedMessage
                defaultMessage={
                  'Wi-Fi country code will set to {countryCode} as ZD configuration.'}
                values={{
                  countryCode: <strong>{countryCode}</strong>
                }}
              />
              : $t({ defaultMessage: 'Wi-Fi country code will converted from selected address.' })
            }
          </Typography.Text>
        </Col>
        <Col span={14}>
          <GoogleMap.FormItem
            label={$t({ defaultMessage: 'Address' })}
            required
            extra={$t({
              defaultMessage: 'Make sure to include a city and country in the address'
            })}
          >
            <Form.Item
              noStyle
              label={$t({ defaultMessage: 'Address' })}
              name={['address', 'addressLine']}
              rules={[{
                required: isMapEnabled ? true : false
              }, {
                validator: () => addressValidator(),
                validateTrigger: 'onBlur'
              }
              ]}
            >
              <Input
                allowClear
                placeholder={$t({ defaultMessage: 'Set address here' })}
                prefix={<SearchOutlined />}
                data-testid='address-input'
                ref={placeInputRef}
                disabled={!isMapEnabled}
                value={address.addressLine}
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
      <Row gutter={20}>
        <Col span={10}>
          {false &&
            <Form.Item
              name='address'
              label={$t({ defaultMessage: 'Address' })}
              children={<Input
                data-testid='address'
                style={{ width: '380px' }}
                // onChange={(event => {handleAddress(event.target.value)})}
              />}
            />
          }
          <Typography.Text>
            {$t({ defaultMessage: 'Note: WLAN configuration won’t be migrated' })}
          </Typography.Text>
        </Col>
      </Row>
    </>
  )
})`${UI.styles}`

export { MigrationSettingForm }
