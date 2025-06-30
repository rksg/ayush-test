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
import { Features, useIsSplitOn }                  from '@acx-ui/feature-toggle'
import { SearchOutlined }                          from '@acx-ui/icons'
import { addressParserWithLatLng, defaultAddress } from '@acx-ui/msp/utils'
import {
  GoogleMapWithPreference,
  usePlacesAutocomplete
} from '@acx-ui/rc/generic-features/components'
import {
  useLazyVenuesListQuery,
  useGetVenueQuery,
  useLazyGetTimezoneQuery
} from '@acx-ui/rc/services'
import {
  Address,
  MigrationActionTypes,
  checkObjectNotExists
} from '@acx-ui/rc/utils'

import MigrationContext from '../MigrationContext'

import * as UI from './styledComponents'

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
  const [getTimezone] = useLazyGetTimezoneQuery()

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
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: '<VenueSingular></VenueSingular>' }))
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
    const { latlng, address } = await addressParserWithLatLng(place, getTimezone)

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
              $t({ defaultMessage: 'Migration assistant will migrate ZoneDirector configuration from the selected backup file and create a new <venueSingular></venueSingular>.' })}
          </Typography.Text>
          <Form.Item
            name='venueName'
            label={$t({ defaultMessage: 'New <VenueSingular></VenueSingular> Name' })}
            rules={[
              { type: 'string' },
              { min: 2 },
              { max: 32 },
              { // eslint-disable-next-line max-len
                pattern: /\s*\S+\s*\S+.*/, message: $t({ defaultMessage: '<VenueSingular></VenueSingular> name must contain at least two non-whitespace characters.' }) },
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
