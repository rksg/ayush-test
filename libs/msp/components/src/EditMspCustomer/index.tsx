import React, { useState, useRef, ChangeEventHandler, useEffect } from 'react'


import {
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Typography
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  GoogleMap,
  GoogleMapMarker,
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance,
  Subtitle
} from '@acx-ui/components'
import { get } from '@acx-ui/config'
// import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { SearchOutlined } from '@acx-ui/icons'
import {
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useGetMspEcQuery
} from '@acx-ui/rc/services'
import {
  Address,
  dateDisplayText,
  DateSelectionEnum,
  EntitlementUtil,
  MspEcData
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import * as UI from '../styledComponents'

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

export interface EcExtended {
  id: string;
  name: string,
  tenant_type: string,
  address: Address,
  street_address: string;
  state: string,
  country: string,
  postal_code: string,
  city: string,
  service_effective_date: string,
  service_expiration_date: string,
  admin_email: string,
  admin_firstname: string,
  admin_lastname: string,
  admin_role: string
}

export function EditMspCustomer () {
  const intl = useIntl()
  const isMapEnabled = true//useIsSplitOn(Features.G_MAP)
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance<MspEcData>>()
  const { Option } = Select
  // const params = useParams()
  const { Paragraph } = Typography

  const linkToCustomers = useTenantLink('/dashboard/mspcustomers', 'v')

  const [addCustomer] = useAddCustomerMutation()

  const [updateCustomer] = useUpdateCustomerMutation()
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0
  })
  const [marker, setMarker] = React.useState<google.maps.LatLng>()
  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : defaultAddress)

  const { action, tenantId, mspEcTenantId } = useParams()
  const { data } = useGetMspEcQuery({ params: { mspEcTenantId } })

  useEffect(() => {
    if (data) {

      // form.setFieldsValue({
      //   name: data?.name,
      //   street_address: data?.street_address,
      //   service_effective_date: data?.service_effective_date,
      //   service_expiration_date: data?.service_expiration_date
      // })

      formRef.current?.setFieldsValue({
        name: data?.name,
        service_effective_date: data?.service_effective_date
        // service_expiration_date: data?.service_expiration_date
      })
      formRef.current?.setFieldValue(['address', 'addressLine'], data?.street_address)

      // updateAddress(data?.street_address as Address)

      // if (isMapEnabled && window.google) {
      //   // const latlng = new google.maps.LatLng({
      //   //   lat: Number(data?.address?.latitude),
      //   //   lng: Number(data?.address?.longitude)
      //   // })
      //   // setMarker(latlng)
      //   // setCenter(latlng.toJSON())
      //   // setZoom(16)
      // }
    }

    if ( action !== 'edit') { // Add mode
      const initialAddress = isMapEnabled ? '' : defaultAddress.addressLine
      formRef.current?.setFieldValue(['address', 'addressLine'], initialAddress)
    }
  }, [data, isMapEnabled, window.google])

  // const venuesListPayload = {
  //   searchString: '',
  //   fields: ['name', 'id'],
  //   searchTargetFields: ['name'],
  //   filters: {},
  //   pageSize: 10000
  // }
  // const [venuesList] = useLazyVenuesListQuery()
  const [sameCountry, setSameCountry] = useState(true)
  // const nameValidator = async (value: string) => {
  //   const payload = { ...venuesListPayload, searchString: value }
  //   const list = (await venuesList({ params, payload }, true)
  //     .unwrap()).data.filter(n => n.id !== data?.id).map(n => ({ name: n.name }))
  //   return checkObjectNotExists(list, { name: value } , intl.$t({ defaultMessage: 'Venue' }))
  // }
  const addressValidator = async (value: string) => {
    const isEdit = action === 'edit'
    const isSameValue = value ===
      formRef.current?.getFieldsValue(['address', 'addressLine']).address?.addressLine

    if (isEdit && !_.isEmpty(value) && isSameValue && !sameCountry) {
      return Promise.reject(
        `${intl.$t({ defaultMessage: 'Address must be in ' })} `
      )
    }
    return Promise.resolve()
  }

  const addressOnChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    updateAddress({})
    const autocomplete = new google.maps.places.Autocomplete(event.target)
    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace()
      const { latlng, address } = await addressParser(place)
      const isSameCountry = true//data && (data?.address.country === address.country) || false
      setSameCountry(isSameCountry)
      let errorList = []

      if (action === 'edit' && !isSameCountry) {
        errorList.push(
          `${intl.$t({ defaultMessage: 'Address must be in ' })} `)
      }

      formRef.current?.setFields([{
        name: ['address', 'addressLine'],
        value: place.formatted_address,
        errors: errorList
      }])

      setMarker(latlng)
      setCenter(latlng.toJSON())
      updateAddress(address)
      setZoom(16)
    })
  }

  const handleAddCustomer = async (values: EcExtended) => {
    try {
      let formData = { ...values }
      const customer = {
        name: formData.name,
        tenant_type: 'MSP_EC',
        street_address: address.addressLine,
        city: address.city,
        postal_code: '',
        country: address.country,
        service_effective_date:
          EntitlementUtil.getServiceStartDate(),
        service_expiration_date:
          EntitlementUtil.getServiceEndDate(formData.service_expiration_date),
        admin_email: formData.admin_email,
        admin_firstname: formData.admin_firstname,
        admin_lastname: formData.admin_lastname,
        admin_role: formData.admin_role
      }

      const result =
        await addCustomer({ params: { tenantId: tenantId }, payload: customer }).unwrap()
      if (result) {
      // const ecTenantId = result.tenant_id
      }
      navigate(linkToCustomers, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleEditCustomer = async (values: EcExtended) => {
    try {
      let formData = { ...values }
      // formData.address = address
      const customer = {
        name: formData.name,
        tenant_type: 'MSP_EC',
        street_address: formData.address.addressLine,
        city: formData.address.city,
        postal_code: '',
        country: formData.address.country,
        service_effective_date: formData.service_effective_date,
        service_expiration_date: formData.service_expiration_date
      }

      await updateCustomer({ params: { mspEcTenantId: mspEcTenantId }, payload: customer }).unwrap()
      navigate(linkToCustomers, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const EditCustomerMspAdminsForm = () => {
    return <>
      <Row gutter={10}>
        <Col span={10}>
          <UI.FieldLabelAdmins width='275px' style={{ marginTop: '15px' }}>
            <label>{intl.$t({ defaultMessage: 'MSP Administrators' })}</label>
            <Form.Item
              children={
                <><div>{'eleu168@yahoo.com'}</div>
                  <div>{'gssjssjhs@yahoo.com'}</div></>
              }
            />
            <Form.Item
              children={<UI.FieldTextLink >
                {intl.$t({ defaultMessage: 'Manage' })}
              </UI.FieldTextLink>
              }
            />
          </UI.FieldLabelAdmins>
          <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-12px' }}>
            <label>{intl.$t({ defaultMessage: 'Integrator' })}</label>
            <Form.Item
              children={'eleu168@yahoo.com'}
            />
            <Form.Item
              children={<UI.FieldTextLink >
                {intl.$t({ defaultMessage: 'Manage' })}
              </UI.FieldTextLink>}
            />
          </UI.FieldLabelAdmins>
          <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-16px' }}>
            <label>{intl.$t({ defaultMessage: 'Installer' })}</label>
            <Form.Item
              children={'hssasjjsks@yahoo.com'}
            />
            <Form.Item
              children={<UI.FieldTextLink >
                {intl.$t({ defaultMessage: 'Manage' })}
              </UI.FieldTextLink>}
            />
          </UI.FieldLabelAdmins>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={8}>
          <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Customer Administrator' }) }</Subtitle>
          <Form.Item
            label={intl.$t({ defaultMessage: 'Name' })}
          >
            <Paragraph>{'Eric Leu'}</Paragraph>
          </Form.Item>
          <Form.Item style={{ marginTop: '-22px' }}
            label={intl.$t({ defaultMessage: 'Email' })}
          >
            <Paragraph>{'eleu1658@yahoo.com'}</Paragraph>
          </Form.Item>
          <Form.Item style={{ marginTop: '-22px' }}
            label={intl.$t({ defaultMessage: 'Role' })}
          >
            <Paragraph>{'Prime Administrator'}</Paragraph>
          </Form.Item>
        </Col>
      </Row>
    </>
  }

  const EditCustomerSubscriptionForm = () => {
    const isTrial = true
    const isActive = true
    return <>
      {isTrial && <Row gutter={20}>
        <Col span={8}>
          {isActive && <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Subscriptions (Trial Mode)' }) }</Subtitle>}
          {!isActive && <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Inactive Subscriptions' }) }</Subtitle>}
          <UI.FieldLabel2 width='275px' style={{ marginTop: '20px' }}>
            <label>{intl.$t({ defaultMessage: 'WiFi Subscription' })}</label>
            {isActive && <label>{intl.$t({ defaultMessage: '25 devices' })}</label>}
            {!isActive && <label>{intl.$t({ defaultMessage: '0 devices' })}</label>}
          </UI.FieldLabel2>
          <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
            <label>{intl.$t({ defaultMessage: 'Switch Subscription' })}</label>
            {isActive && <label>{intl.$t({ defaultMessage: '25 devices' })}</label>}
            {!isActive && <label>{intl.$t({ defaultMessage: '0 devices' })}</label>}
          </UI.FieldLabel2>

          <UI.FieldLabel2 width='275px' style={{ marginTop: '20px' }}>
            <label>{intl.$t({ defaultMessage: 'Trial Start Date' })}</label>
            <label>{intl.$t({ defaultMessage: '10/22/2022' })}</label>
          </UI.FieldLabel2>
          <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
            <label>{intl.$t({ defaultMessage: '30 Day Trial Ends on' })}</label>
            <label>{intl.$t({ defaultMessage: '11/22/2022' })}</label>
          </UI.FieldLabel2>
        </Col>
      </Row>}

      {!isTrial &&
        <Row gutter={20}>
          <Col span={8}>
            <Subtitle level={3}>
              { intl.$t({ defaultMessage: 'Paid Subscriptions' }) }</Subtitle>
            <UI.FieldLabelSubs width='275px'>
              <label>{intl.$t({ defaultMessage: 'WiFi Subscription' })}</label>
              <Form.Item
                name='wifiLicense'
                label=''
                initialValue={0}
                children={<Input/>}
                style={{ paddingRight: '20px' }}
              />
              <label>{intl.$t({ defaultMessage: 'devices out of 100 available' })}</label>
            </UI.FieldLabelSubs>

            <UI.FieldLabelSubs width='275px'>
              <label>{intl.$t({ defaultMessage: 'Switch Subscription' })}</label>
              <Form.Item
                name='SwitchLicense'
                label=''
                initialValue={0}
                children={<Input/>}
                style={{ paddingRight: '20px' }}
              />
              <label>{intl.$t({ defaultMessage: 'devices out of 4 available' })}</label>
            </UI.FieldLabelSubs>

            <UI.FieldLabel2 width='275px' style={{ marginTop: '18px' }}>
              <label>{intl.$t({ defaultMessage: 'Service Start Date' })}</label>
              <label>{intl.$t({ defaultMessage: '10/22/2022' })}</label>
            </UI.FieldLabel2>

            <UI.FieldLabeServiceDate width='275px' style={{ marginTop: '10px' }}>
              <label>{intl.$t({ defaultMessage: 'Service Expiration Date' })}</label>
              <Form.Item
                name='expirationDate1'
                label=''
                rules={[{ required: true } ]}
                initialValue={DateSelectionEnum.CUSTOME_DATE}
                children={
                  <Select>
                    {
                      Object.entries(DateSelectionEnum).map(([label, value]) => (
                        <Option key={label} value={value}>{intl.$t(dateDisplayText[value])}</Option>
                      ))
                    }
                  </Select>
                }
              />
              <Form.Item
                name='service_expiration_date'
                label=''
                children={
                  <DatePicker
                    style={{ marginLeft: '4px' }}
                  />
                }
              />
            </UI.FieldLabeServiceDate>
          </Col>
        </Row>}
    </>
  }

  return (
    <>
      <PageHeader
        title={action !== 'edit' ?
          intl.$t({ defaultMessage: 'Add Customer Account' }) :
          intl.$t({ defaultMessage: 'Customer Account' })
        }
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'MSP Customers' }),
            link: '/dashboard/mspcustomers', tenantType: 'v' }
        ]}
      />

      <StepsForm
        formRef={formRef}
        onFinish={action === 'edit' ? handleEditCustomer : handleAddCustomer}
        onCancel={() => navigate(linkToCustomers)}
        buttonLabel={{ submit: action === 'edit' ?
          intl.$t({ defaultMessage: 'Save' }):
          intl.$t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <Subtitle level={3}>
                { intl.$t({ defaultMessage: 'Account Details' }) }</Subtitle>
              <Form.Item
                name='name'
                label={intl.$t({ defaultMessage: 'Customer Name' })}
                rules={[{ required: true }]}
                validateFirst
                hasFeedback
                children={<Input />}
              />
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
                    onChange={addressOnChange}
                    data-testid='address-input'
                    disabled={!isMapEnabled}
                    value={address.addressLine}
                  />
                </Form.Item>
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
                  <GoogleMap.NotEnabled />
                }
              </GoogleMap.FormItem>
            </Col>
          </Row>

          <EditCustomerMspAdminsForm></EditCustomerMspAdminsForm>
          <EditCustomerSubscriptionForm></EditCustomerSubscriptionForm>

        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
