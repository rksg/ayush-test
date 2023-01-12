import { useState, useRef, ChangeEventHandler, useEffect } from 'react'

import {
  Col,
  DatePicker,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Space
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  GoogleMap,
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance,
  Subtitle
} from '@acx-ui/components'
import { SearchOutlined } from '@acx-ui/icons'
import {
  useAddCustomerMutation,
  useGetMspEcQuery
} from '@acx-ui/rc/services'
import {
  Address,
  dateDisplayText,
  DateSelectionEnum,
  emailRegExp,
  MspAdministrator,
  MspEc,
  MspEcData,
  roleDisplayText,
  RolesEnum,
  EntitlementUtil
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { ManageAdminsDrawer } from '../ManageAdminsDrawer'
// eslint-disable-next-line import/order
import { SelectIntegratorDrawer } from '../SelectIntegratorDrawer'

import * as UI from '../styledComponents'

import { CustomerSummary } from './CustomerSummary'

interface AddressComponent {
  long_name?: string;
  short_name?: string;
  types?: Array<string>;
}

interface EcExtended {
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
  address.addressLine = place.formatted_address
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
  return { address }
}

const defaultAddress: Address = {
  addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
  city: 'Sunnyvale, California',
  country: 'United States',
  latitude: 37.4112751,
  longitude: -122.0191908,
  timezone: 'America/Los_Angeles'
}

export function AddMspCustomer () {
  const intl = useIntl()
  const isMapEnabled = true//useIsSplitOn(Features.G_MAP)
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance<MspEcData>>()
  const { Option } = Select
  const [trialSelected, setTrialMode] = useState(true)
  const [mspAdmins, setAdministrator] = useState('--')
  const [mspIntegrator, setIntegrator] = useState('--')
  const [mspInstaller, setInstaller] = useState('--')
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [drawerInstallerVisible, setDrawerInstallerVisible] = useState(false)
  // const [tenantId, setTenantId] = useState('')

  const linkToCustomers = useTenantLink('/dashboard/mspcustomers', 'v')

  const [addCustomerr] = useAddCustomerMutation()

  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : defaultAddress)

  const { action, tenantId, mspEcTenantId } = useParams()
  const { data } = useGetMspEcQuery({ params: { mspEcTenantId } })

  useEffect(() => {
    if (data) {
      formRef.current?.setFieldsValue({
        name: data?.name
        // address: data?.address
      })
      // updateAddress(data?.address as Address)
      setAdministrator('--')
      setIntegrator('')
      setInstaller('')
    }

    if ( action !== 'edit') { // Add mode
      const initialAddress = isMapEnabled ? '' : defaultAddress.addressLine
      formRef.current?.setFieldValue(['address', 'addressLine'], initialAddress)
    }
  }, [data, isMapEnabled])

  const [sameCountry, setSameCountry] = useState(true)
  const addressValidator = async (value: string) => {
    const isEdit = action === 'edit'
    const isSameValue = value ===
      formRef.current?.getFieldsValue(['address', 'addressLine']).address?.addressLine

    if (isEdit && !_.isEmpty(value) && isSameValue && !sameCountry) {
      return Promise.reject(
        // `${intl.$t({ defaultMessage: 'Address must be in ' })} ${data?.address.country}`
      )
    }
    return Promise.resolve()
  }

  const addressOnChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    updateAddress({})
    const autocomplete = new google.maps.places.Autocomplete(event.target)
    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace()
      const { address } = await addressParser(place)
      const isSameCountry = true//(data && (data?.address.country === address.country)) || false
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

      updateAddress(address)
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
        await addCustomerr({ params: { tenantId: tenantId }, payload: customer }).unwrap()
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

    // try {
    //   const formData = { ...values }
    //   formData.address = address
    //   await addVenue({ params, payload: formData }).unwrap()
    //   navigate(linkToCustomers, { replace: true })
    // } catch {
    //   showToast({
    //     type: 'error',
    //     content: intl.$t({ defaultMessage: 'An error occurred' })
    //   })
    // }
  }

  const manageMspAdmins = () => {
    setDrawerAdminVisible(true)
  }
  const manageIntegrator = (type: string) => {
    type === 'MSP_INSTALLER' ? setDrawerInstallerVisible(true) : setDrawerIntegratorVisible(true)
  }

  const mspAdminSelected = (selected?: MspAdministrator[]) => {
    if (selected && selected.length > 0) {
      setAdministrator(selected[0].email)
    } else {
      setAdministrator('--')
    }
  }

  const integratorSelected = (tenantType: string, selected: MspEc[] ) => {
    if (selected && selected.length > 0) {
      (tenantType === 'MSP_INTEGRATOR')
        ? setIntegrator(selected[0].name) : setInstaller(selected[0].name)
    } else {
      (tenantType === 'MSP_INTEGRATOR') ? setIntegrator('--') : setInstaller('--')
    }
  }

  const onChange = (e: RadioChangeEvent) => {
    setTrialMode(e.target.value)
  }

  const AddCustomerSubscriptionForm = () => {
    return <>
      <h4>{intl.$t({ defaultMessage: 'Start service in' })}</h4>
      <Form.Item
        name='otpSelection'
        initialValue={true}
      >
        <Radio.Group onChange={onChange}>
          <Space direction='vertical'>
            <Radio
              value={true}
              disabled={false}>
              { intl.$t({ defaultMessage: 'Trial Mode' }) }
            </Radio>
            <Radio
              style={{ marginTop: '2px', marginBottom: '50px' }}
              value={false}
              disabled={false}>
              { intl.$t({ defaultMessage: 'Paid Subscription' }) }
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      {trialSelected && <Row gutter={20}>
        <Col span={8}>
          <Subtitle level={4}>
            { intl.$t({ defaultMessage: 'Trial Mode' }) }</Subtitle>
          <UI.FieldLabel2 width='275px' style={{ marginTop: '20px' }}>
            <label>{intl.$t({ defaultMessage: 'WiFi Subscription' })}</label>
            <label>{intl.$t({ defaultMessage: '25 devices' })}</label>
          </UI.FieldLabel2>
          <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
            <label>{intl.$t({ defaultMessage: 'Switch Subscription' })}</label>
            <label>{intl.$t({ defaultMessage: '25 devices' })}</label>
          </UI.FieldLabel2>

          <UI.FieldLabel2 width='275px' style={{ marginTop: '20px' }}>
            <label>{intl.$t({ defaultMessage: 'Trial Start Date' })}</label>
            <label>{EntitlementUtil.getServiceStartDate()}</label>
          </UI.FieldLabel2>
          <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
            <label>{intl.$t({ defaultMessage: '30 Day Trial Ends on' })}</label>
            <label>{intl.$t({ defaultMessage: '11/22/2022' })}</label>
          </UI.FieldLabel2>
        </Col>
      </Row>}

      {!trialSelected &&
        <Row gutter={20}>
          <Col span={8}>
            <Subtitle level={4}>
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
              <label>{EntitlementUtil.getServiceStartDate()}</label>
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
        // editMode={action === 'edit'}
        onFinish={handleAddCustomer}
        onCancel={() => navigate(linkToCustomers)}
        buttonLabel={{ submit: intl.$t({ defaultMessage: 'Add Customer' }) }}
      >

        {/* <StepsForm.StepForm name='accountDetail'
          title={intl.$t({ defaultMessage: 'Account Details' })}>
          <AddCustomerDetailForm />
        </StepsForm.StepForm> */}

        <StepsForm.StepForm name='accountDetail'
          title={intl.$t({ defaultMessage: 'Account Details' })}>
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
              {/* <GoogleAddress /> */}
              <Form.Item
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
              </Form.Item >
              <Form.Item hidden>
                <GoogleMap libraries={['places']} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={10}>
              <UI.FieldLabelAdmins width='275px' style={{ marginTop: '15px' }}>
                <label>{intl.$t({ defaultMessage: 'MSP Administrators' })}</label>
                <Form.Item children={<div>{mspAdmins}</div>} />
                <Form.Item
                  children={<UI.FieldTextLink onClick={() => manageMspAdmins()}>
                    {intl.$t({ defaultMessage: 'Manage' })}
                  </UI.FieldTextLink>
                  }
                />
                {drawerAdminVisible && <ManageAdminsDrawer
                  visible={drawerAdminVisible}
                  setVisible={setDrawerAdminVisible}
                  tenantId={''}
                  selected={mspAdminSelected}
                />}
              </UI.FieldLabelAdmins>
              <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-12px' }}>
                <label>{intl.$t({ defaultMessage: 'Integrator' })}</label>
                <Form.Item children={mspIntegrator} />
                <Form.Item
                  children={<UI.FieldTextLink onClick={() => manageIntegrator('MSP_INTEGRATOR')}>
                    {intl.$t({ defaultMessage: 'Manage' })}
                  </UI.FieldTextLink>}
                />
                {drawerIntegratorVisible && <SelectIntegratorDrawer
                  visible={drawerIntegratorVisible}
                  setVisible={setDrawerIntegratorVisible}
                  // tenantId={'tenantId'}
                  tenantType='MSP_INTEGRATOR'
                  setSelected={integratorSelected}
                />}
              </UI.FieldLabelAdmins>
              <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-16px' }}>
                <label>{intl.$t({ defaultMessage: 'Installer' })}</label>
                <Form.Item children={mspInstaller} />
                <Form.Item
                  children={<UI.FieldTextLink onClick={() => manageIntegrator('MSP_INSTALLER')}>
                    {intl.$t({ defaultMessage: 'Manage' })}
                  </UI.FieldTextLink>}
                />
                {drawerInstallerVisible && <SelectIntegratorDrawer
                  visible={drawerInstallerVisible}
                  setVisible={setDrawerInstallerVisible}
                  // tenantId={tenantId}
                  tenantType='MSP_INSTALLER'
                  setSelected={integratorSelected}
                />}
              </UI.FieldLabelAdmins>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={8}>
              <Subtitle level={3}>
                { intl.$t({ defaultMessage: 'Customer Administrator' }) }</Subtitle>
              <Form.Item
                name='admin_email'
                label={intl.$t({ defaultMessage: 'Email' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => emailRegExp(value) },
                  { message: intl.$t({ defaultMessage: 'Please enter a valid email address!' }) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name='admin_firstname'
                label={intl.$t({ defaultMessage: 'First Name' })}
                rules={[{ required: true }]}
                children={<Input />}
                style={{ display: 'inline-block', width: 'calc(50%)' , paddingRight: '20px' }}
              />
              <Form.Item
                name='admin_lastname'
                label={intl.$t({ defaultMessage: 'Last Name' })}
                rules={[ { required: true } ]}
                children={<Input />}
                style={{ display: 'inline-block', width: 'calc(50%)' }}
              />
              <Form.Item
                name='admin_role'
                label={intl.$t({ defaultMessage: 'Role' })}
                rules={[{ required: true }]}
                initialValue={RolesEnum.PRIME_ADMIN}
                children={
                  <Select>
                    {
                      Object.entries(RolesEnum).map(([label, value]) => (
                        <Option
                          key={label}
                          value={value}>{intl.$t(roleDisplayText[value])}
                        </Option>
                      ))
                    }
                  </Select>
                }
              />
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm name='subscriptions'
          title={intl.$t({ defaultMessage: 'Subscriptions' })}>
          <AddCustomerSubscriptionForm></AddCustomerSubscriptionForm>
        </StepsForm.StepForm>

        {(action !== 'edit') && <StepsForm.StepForm name='summary'
          title={intl.$t({ defaultMessage: 'Summary' })}>
          <CustomerSummary />
        </StepsForm.StepForm>}

      </StepsForm>
    </>
  )
}
