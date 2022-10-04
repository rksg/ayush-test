import React, { useState, useRef, ChangeEventHandler } from 'react'

import { Row, Col, Form, Input, Select } from 'antd'
import { useIntl }                           from 'react-intl'

import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { get }                                          from '@acx-ui/config'
import { useSplitTreatment }                            from '@acx-ui/feature-toggle'
import { SearchOutlined }                               from '@acx-ui/icons'
import { useAddVenueMutation, useLazyVenuesListQuery }  from '@acx-ui/rc/services'
import { Address, VenueSaveData, checkObjectNotExists } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'


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

export function EdgesForm () {
  const intl = useIntl()
  const isMapEnabled = useSplitTreatment('acx-ui-maps-api-toggle')
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance<VenueSaveData>>()
  const params = useParams()

  const linkToVenues = useTenantLink('/devices')
  const [addVenue] = useAddVenueMutation()
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0
  })
  const [marker, setMarker] = React.useState<google.maps.LatLng>()
  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : defaultAddress)

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
    return checkObjectNotExists(list, { name: value } , intl.$t({ defaultMessage: 'Venue' }))
  }

  const addressValidator = async () => {
    if(Object.keys(address).length === 0){
      return Promise.reject(
        intl.$t({ defaultMessage: 'Please select address from suggested list' })
      )
    }
    return Promise.resolve()
  }

  const handleAddEdge = async (values: VenueSaveData) => {
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

  return (
    <>
      <PageHeader
        title={intl.$t({ defaultMessage: 'Add SmartEdge' })}
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'Edges' }), link: '/devices' }
        ]}
      />
      <StepsForm
        formRef={formRef}
        onFinish={handleAddEdge}
        onCancel={() => navigate(linkToVenues)}
        buttonLabel={{ submit: intl.$t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
            <Form.Item 
              name='venue' 
              label='Venue' 
              rules={[{
                  required: true
                }]}>
              <Select>
                <Select.Option value='option1'>Option 1</Select.Option>
                <Select.Option value='option2'>Option 2</Select.Option>
                <Select.Option value='option3'>Option 3</Select.Option>
              </Select>
            </Form.Item>
              <Form.Item
                name='name'
                label={intl.$t({ defaultMessage: 'SmartEdge Name ' })}
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
              <Form.Item
              name='tags'
              label='Tags:'
              children={<Input />} />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
