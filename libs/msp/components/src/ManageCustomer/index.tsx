import { useState, useRef, ChangeEventHandler, useEffect } from 'react'


import {
  DatePicker,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Select,
  Space,
  Switch,
  Typography
} from 'antd'
import _           from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  Button,
  GoogleMap,
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance,
  Subtitle
} from '@acx-ui/components'
import { SearchOutlined }        from '@acx-ui/icons'
import {
  useAddCustomerMutation,
  useMspEcAdminListQuery,
  useUpdateCustomerMutation,
  useGetMspEcQuery,
  // useGetMspEcDelegatedAdminsQuery,
  useMspAssignmentSummaryQuery
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
  EntitlementUtil,
  excludeExclamationRegExp,
  MspAssignmentSummary
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { ManageAdminsDrawer } from '../ManageAdminsDrawer'
// eslint-disable-next-line import/order
import { SelectIntegratorDrawer } from '../SelectIntegratorDrawer'
import { StartSubscriptionModal } from '../StartSubscriptionModal'
import * as UI                    from '../styledComponents'

interface AddressComponent {
  long_name?: string;
  short_name?: string;
  types?: Array<string>;
}

interface EcFormData {
    name: string,
    address: Address,
    service_effective_date: string,
    service_expiration_date: string,
    admin_email: string,
    admin_firstname: string,
    admin_lastname: string,
    admin_role: string,
    wifiLicense: number,
    switchLicense: number
  }

interface EcExtended {
    id?: string;
    name: string,
    tenant_type: string,
    address?: Address,
    street_address: string;
    state?: string,
    country: string,
    postal_code: string,
    city: string,
    service_effective_date: string,
    service_expiration_date: string,
    admin_email: string,
    admin_firstname: string,
    admin_lastname: string,
    admin_role: string,
    license: {},
    ec_delegations?: [],
    admin_delegations?: []
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

export function ManageCustomer () {
  const intl = useIntl()
  const isMapEnabled = true//useIsSplitOn(Features.G_MAP)

  const navigate = useNavigate()
  const linkToCustomers = useTenantLink('/dashboard/mspcustomers', 'v')
  const formRef = useRef<StepsFormInstance<MspEcData>>()

  const { action, status, tenantId, mspEcTenantId } = useParams()

  const [isTrialMode, setTrialMode] = useState(false)
  const [isTrialActive, setTrialActive] = useState(false)
  const [trialSelected, setTrialSelected] = useState(true)
  const [mspAdmins, setAdministrator] = useState([] as MspAdministrator[])
  const [mspIntegrator, setIntegrator] = useState([] as MspEc[])
  const [mspInstaller, setInstaller] = useState([] as MspEc[])
  const [mspEcAdmins, setMspEcAdmins] = useState([] as MspAdministrator[])
  const [availableLicense, setAvailableLicense] = useState([] as MspAssignmentSummary[])
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [drawerInstallerVisible, setDrawerInstallerVisible] = useState(false)
  const [startSubscriptionVisible, setStartSubscriptionVisible] = useState(false)
  const [subscriptionStartDate, setStartSubscriptionDate] = useState('')
  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : defaultAddress)

  const [addCustomer] = useAddCustomerMutation()
  const [updateCustomer] = useUpdateCustomerMutation()

  const { Option } = Select
  const { Paragraph } = Typography
  const isEditMode = action === 'edit'

  const { data } = useGetMspEcQuery({ params: { mspEcTenantId } })
  // const { data: delegatedAdmins } = useGetMspEcDelegatedAdminsQuery({ params: { mspEcTenantId } })
  const { data: ecAdministrators } = useMspEcAdminListQuery({ params: { mspEcTenantId } })
  const { data: licenseSummary } = useMspAssignmentSummaryQuery({ params: useParams() })

  useEffect(() => {
    if (licenseSummary) {
      checkAvailableLicense(licenseSummary)
    }
    // if (delegatedAdmins) {
    //   setDelegateAdmins(delegatedAdmins)
    // }
    if (ecAdministrators) {
      setMspEcAdmins(ecAdministrators)
    }
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
      data?.is_active === 'true' ? setTrialActive(true) : setTrialActive(false)
      status === 'active' ? setTrialMode(false) : setTrialMode(true)
      // updateAddress(data?.street_address as Address)
    }
    if (!isEditMode) { // Add mode
      const initialAddress = isMapEnabled ? '' : defaultAddress.addressLine
      formRef.current?.setFieldValue(['address', 'addressLine'], initialAddress)
    }
  }, [data, licenseSummary, ecAdministrators, isMapEnabled])
  const [sameCountry, setSameCountry] = useState(true)
  const addressValidator = async (value: string) => {
    const isSameValue = value ===
      formRef.current?.getFieldsValue(['address', 'addressLine']).address?.addressLine
    if (isEditMode && !_.isEmpty(value) && isSameValue && !sameCountry) {
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
      const { address } = await addressParser(place)
      const isSameCountry = true//data && (data?.address.country === address.country) || false
      setSameCountry(isSameCountry)
      let errorList = []
      if (isEditMode && !isSameCountry) {
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

  const handleAddCustomer = async (values: EcFormData) => {
    try {
      const ecFormData = { ...values }
      const today = EntitlementUtil.getServiceStartDate()
      const expirationDate = EntitlementUtil.getServiceEndDate(ecFormData.service_expiration_date)
      const assignLicense = trialSelected
        ? {
          trialAction: 'ACTIVATE',
          assignmentStartDate: today,
          assignmentEndDate: expirationDate
        } :
        {
          assignmentStartDate: today,
          assignmentEndDate: expirationDate,
          assignments: [{
            quantity: ecFormData.wifiLicense,
            action: 'ADD',
            deviceType: 'MSP_WIFI'
          },
          {
            quantity: ecFormData.switchLicense,
            action: 'ADD',
            deviceType: 'MSP_SWITCH'
          }
          ]
        }

      const customer: EcExtended = {
        tenant_type: 'MSP_EC',
        name: ecFormData.name,
        street_address: ecFormData.address.addressLine as string,
        city: ecFormData.address.city as string,
        postal_code: '',
        country: ecFormData.address.country as string,
        service_effective_date: today,
        service_expiration_date: expirationDate,
        admin_email: ecFormData.admin_email,
        admin_firstname: ecFormData.admin_firstname,
        admin_lastname: ecFormData.admin_lastname,
        admin_role: ecFormData.admin_role,
        license: assignLicense
      }
      // if (mspAdmins.length > 0) {
      //   customer.admin_delegations = [
      //     {
      //       msp_admin_id: mspAdmins[0].id,
      //       msp_admin_role: 'PRIME_ADMIN'
      //     }
      //   ]
      // }
      // if (mspIntegrator.length > 0) {
      //   customer.ec_delegations?.push(
      //     {
      //       delegation_type: 'MSP_INTEGRATOR',
      //       delegation_id: '78b7fb27069c498d8e7bb4f526f4356'
      //     })
      // }
      // if (mspInstaller.length > 0) {

      // }
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

  const handleEditCustomer = async (values: EcFormData) => {
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

  const selectedMspAdmins = (selected: MspAdministrator[]) => {
    setAdministrator(selected)
  }

  const selectedIntegrators = (tenantType: string, selected: MspEc[] ) => {
    (tenantType === 'MSP_INTEGRATOR') ? setIntegrator(selected) : setInstaller(selected)
  }

  const displayMspAdmins = () => {
    if (!mspAdmins || mspAdmins.length === 0)
      return '--'
    return <>
      {mspAdmins.map(admin =>
        <UI.AdminList>
          {admin.email} ({intl.$t(roleDisplayText[admin.role])})
        </UI.AdminList>
      )}
    </>
  }

  const displayIntegrator = () => {
    const value = !mspIntegrator || mspIntegrator.length === 0 ? '--' : mspIntegrator[0].name
    return value
  }

  const displayInstaller = () => {
    const value = !mspInstaller || mspInstaller.length === 0 ? '--' : mspInstaller[0].name
    return value
  }

  const displayCustomerAdmins = () => {
    if (mspEcAdmins.length === 1) {
      return <>
        <Form.Item
          label={intl.$t({ defaultMessage: 'Name' })}
        >
          <Paragraph>{mspEcAdmins[0].name}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Email' })}
        >
          <Paragraph>{mspEcAdmins[0].email}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Role' })}
        >
          <Paragraph>{intl.$t(roleDisplayText[mspEcAdmins[0].role])}</Paragraph>
        </Form.Item>
      </>
    }
    return <div style={{ marginTop: '5px', marginBottom: '30px' }}>
      {mspEcAdmins.map(admin =>
        <UI.AdminList>
          {admin.email} ({intl.$t(roleDisplayText[admin.role])}
        </UI.AdminList>
      )}
    </div>
  }

  const startSubscription = (startDate: Date) => {
    if (startDate) {
      const dateString = moment(startDate).format('MM/DD/YYYY')
      setStartSubscriptionDate(dateString)
      setTrialMode(false)
    }
  }

  const checkAvailableLicense = (entitlements: MspAssignmentSummary[]) => {
    const availableLicense = entitlements.filter(p => p.remainingDevices > 0)
    setAvailableLicense(availableLicense)
  }

  const MspAdminsForm = () => {
    return <>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '15px' }}>
        <label>{intl.$t({ defaultMessage: 'MSP Administrators' })}</label>
        <Form.Item children={<div>{displayMspAdmins()}</div>} />
        <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerAdminVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>
          }
        />
      </UI.FieldLabelAdmins>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-12px' }}>
        <label>{intl.$t({ defaultMessage: 'Integrator' })}</label>
        <Form.Item children={displayIntegrator()} />
        <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerIntegratorVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>}
        />
      </UI.FieldLabelAdmins>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-16px' }}>
        <label>{intl.$t({ defaultMessage: 'Installer' })}</label>
        <Form.Item children={displayInstaller()} />
        <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerInstallerVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>}
        />
      </UI.FieldLabelAdmins>
    </>
  }

  const CustomerAdminsForm = () => {
    if (isEditMode) {
      return <><Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Customer Administrator' }) }</Subtitle>
      <Form.Item children={displayCustomerAdmins()} />
      </>
    } else {
      return <><Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Customer Administrator' }) }</Subtitle>
      <Form.Item
        name='admin_email'
        label={intl.$t({ defaultMessage: 'Email' })}
        style={{ width: '300px' }}
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
        style={{ display: 'inline-block', width: '150px' ,paddingRight: '10px' }}
      />
      <Form.Item
        name='admin_lastname'
        label={intl.$t({ defaultMessage: 'Last Name' })}
        rules={[ { required: true } ]}
        children={<Input />}
        style={{ display: 'inline-block', width: '150px',paddingLeft: '10px' }}
      />
      <Form.Item
        name='admin_role'
        label={intl.$t({ defaultMessage: 'Role' })}
        style={{ width: '300px' }}
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
      </>
    }
  }

  const WifiSubscription = () => {
    const wifiLicenses = availableLicense.filter(p => p.deviceType === 'MSP_WIFI')
    let remainingDevices = 0
    wifiLicenses.forEach( (lic: MspAssignmentSummary) => {
      remainingDevices += lic.remainingDevices
    })
    return <div >
      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'WiFi Subscription' })}</label>
        <Form.Item
          name='wifiLicense'
          label=''
          initialValue={0}
          rules={[
            { required: true },
            { validator: (_, value) => excludeExclamationRegExp(value) }
          ]}
          children={<Input/>}
          style={{ paddingRight: '20px' }}
        />
        <label>devices out of {remainingDevices} available</label>
      </UI.FieldLabelSubs>
    </div>
  }

  const SwitchSubscription = () => {
    const switchLicenses = availableLicense.filter(p => p.deviceType === 'MSP_SWITCH')
    let remainingDevices = 0
    switchLicenses.forEach( (lic: MspAssignmentSummary) => {
      remainingDevices += lic.remainingDevices
    })
    return <div >
      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'Switch Subscription' })}</label>
        <Form.Item
          name='switchLicense'
          label=''
          initialValue={0}
          rules={[
            { required: true },
            { validator: (_, value) => excludeExclamationRegExp(value) }
          ]}
          children={<Input/>}
          style={{ paddingRight: '20px' }}
        />
        <label>devices out of {remainingDevices} available</label>
      </UI.FieldLabelSubs>
    </div>
  }

  const EnableSupportForm = () => {
    return <>
      <div>
        <h4 style={{ display: 'inline-block', marginTop: '38px', marginRight: '25px' }}>
          {intl.$t({ defaultMessage: 'Enable access to RUCKUS One support' })}</h4>
        <Switch /></div>
      <div><label>
        {intl.$t({ defaultMessage: 'If checked, Ruckus support team is granted a temporary' +
  ' administrator-level access for 21 days.' })}</label>
      </div>
      <label>
        {intl.$t({ defaultMessage: 'Enable when requested by Ruckus support team.' })}</label>
    </>
  }

  const getTrialSubscriptionSubtitle = () => {
    if (isTrialActive)
      return intl.$t({ defaultMessage: 'Subscriptions (Trial Mode)' })
    else
      return intl.$t({ defaultMessage: 'Inactive Subscriptions' })
  }

  const getTrailSubscriptionDevice = () => {
    if (isTrialActive)
      return intl.$t({ defaultMessage: '25 devices' })
    else
      return intl.$t({ defaultMessage: '0 devices' })
  }

  const EditCustomerSubscriptionForm = () => {
    return <>
      {isTrialMode && <div>
        <Subtitle level={3} style={{ display: 'inline-block' }}>
          { getTrialSubscriptionSubtitle() }</Subtitle>
        <Button
          type='primary'
          style={{ display: 'inline-block', marginLeft: '80px' }}
          onClick={() => setStartSubscriptionVisible(true)}
        >{intl.$t({ defaultMessage: 'Start Subscription' })}
        </Button>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '20px' }}>
          <label>{intl.$t({ defaultMessage: 'WiFi Subscription' })}</label>
          <label>{getTrailSubscriptionDevice()}</label>
        </UI.FieldLabel2>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: 'Switch Subscription' })}</label>
          <label>{getTrailSubscriptionDevice()}</label>
        </UI.FieldLabel2>

        <UI.FieldLabel2 width='275px' style={{ marginTop: '20px' }}>
          <label>{intl.$t({ defaultMessage: 'Trial Start Date' })}</label>
          <label>{EntitlementUtil.getServiceStartDate()}</label>
        </UI.FieldLabel2>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: '30 Day Trial Ends on' })}</label>
          <label>{intl.$t({ defaultMessage: '11/22/2022' })}</label>
        </UI.FieldLabel2></div>
      }

      {!isTrialMode && <div>
        <Subtitle level={3}>
          { intl.$t({ defaultMessage: 'Paid Subscriptions' }) }</Subtitle>
        <WifiSubscription />
        <SwitchSubscription />

        <UI.FieldLabel2 width='275px' style={{ marginTop: '18px' }}>
          <label>{intl.$t({ defaultMessage: 'Service Start Date' })}</label>
          <label>{subscriptionStartDate}</label>
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
                format='MM/DD/YYYY'
                style={{ marginLeft: '4px' }}
              />
            }
          />
        </UI.FieldLabeServiceDate>
      </div>}
    </>
  }

  const CustomerSubscription = () => {
    const today = EntitlementUtil.getServiceStartDate()

    return <>
      <h4>{intl.$t({ defaultMessage: 'Start service in' })}</h4>
      <Form.Item
        name='trialMode'
        initialValue={true}
      >
        <Radio.Group onChange={(e: RadioChangeEvent) => {setTrialSelected(e.target.value)}}>
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

      {trialSelected && <div>
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
          <label>{today}</label>
        </UI.FieldLabel2>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: '30 Day Trial Ends on' })}</label>
          <label>{intl.$t({ defaultMessage: '11/22/2022' })}</label>
        </UI.FieldLabel2></div>
      }

      {!trialSelected && <div>
        <Subtitle level={4}>
          { intl.$t({ defaultMessage: 'Paid Subscriptions' }) }</Subtitle>
        <WifiSubscription />
        <SwitchSubscription />
        <UI.FieldLabel2 width='275px' style={{ marginTop: '18px' }}>
          <label>{intl.$t({ defaultMessage: 'Service Start Date' })}</label>
          <label>{today}</label>
        </UI.FieldLabel2>

        <UI.FieldLabeServiceDate width='275px' style={{ marginTop: '10px' }}>
          <label>{intl.$t({ defaultMessage: 'Service Expiration Date' })}</label>
          <Form.Item
            name='expirationDateSelection'
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
                format='MM/DD/YYYY'
                disabledDate={(current) => {
                  return moment().add(-1, 'days') >= current
                }}
                style={{ marginLeft: '4px' }}
              />
            }
          />
        </UI.FieldLabeServiceDate></div>}
    </>
  }

  const CustomerSummary = () => {
    const intl = useIntl()
    const { Paragraph } = Typography
    return (
      <>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Summary' })}</Subtitle>
        <Form.Item
          label={intl.$t({ defaultMessage: 'Customer Name' })}
        >
          <Paragraph>{'name'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Address' })}
        >
          <Paragraph>{address.addressLine}</Paragraph>
        </Form.Item>

        <Form.Item
          label={intl.$t({ defaultMessage: 'MSP Administrators' })}
        >
          <Paragraph>{displayMspAdmins()}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Integrator' })}
        >
          <Paragraph>{displayIntegrator()}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Installer' })}
        >
          <Paragraph>{displayInstaller()}</Paragraph>
        </Form.Item>

        <Form.Item
          label={intl.$t({ defaultMessage: 'Customer Administrator Name' })}
        >
          <Paragraph>{'adminFirstname'} {'adminLastname'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Email' })}
        >
          <Paragraph>{'adminEmail'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Role' })}
        >
          <Paragraph>{'adminRole'}</Paragraph>
        </Form.Item>

        <Form.Item
          label={intl.$t({ defaultMessage: 'Wi-Fi Subscriptions' })}
        >
          <Paragraph>{'wifiLicense'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Switch Subscriptions' })}
        >
          <Paragraph>{'25'}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Service Expiration Date' })}
        >
          <Paragraph>{'12/22/2023'}</Paragraph>
        </Form.Item></>
    )
  }
  const TrialBanner = () => {
    const title = isTrialActive ? 'The account is in Trial Mode'
      : 'This account is in an Inactive State.'
    return (isTrialMode ?
      <UI.OtpLabel
        style={{
          fontSize: 'var(--acx-body-4-font-size)',
          color: 'var(--acx-primary-white)',
          backgroundColor: 'var(--acx-primary-black)'
        }}>
        {intl.$t({
          defaultMessage: `
            {title}`
        }, { title })}
        {intl.$t({ defaultMessage: 'Start Subscription' })}
      </UI.OtpLabel>
      : <h4>
      </h4>)
  }

  return (
    <>
      <PageHeader
        title={!isEditMode ?
          intl.$t({ defaultMessage: 'Add Customer Account' }) :
          intl.$t({ defaultMessage: 'Customer Account' })
        }
        titleExtra={<TrialBanner></TrialBanner>}
        breadcrumb={[
          { text: intl.$t({ defaultMessage: ' Customers' }),
            link: '/dashboard/mspcustomers', tenantType: 'v' }
        ]}
      />
      <StepsForm
        formRef={formRef}
        onFinish={isEditMode ? handleEditCustomer : handleAddCustomer}
        onCancel={() => navigate(linkToCustomers)}
        buttonLabel={{ submit: isEditMode ?
          intl.$t({ defaultMessage: 'Save' }):
          intl.$t({ defaultMessage: 'Add' }) }}
      >
        {isEditMode && <StepsForm.StepForm>
          <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Account Details' }) }</Subtitle>
          <Form.Item
            name='name'
            label={intl.$t({ defaultMessage: 'Customer Name' })}
            style={{ width: '300px' }}
            rules={[{ required: true }]}
            validateFirst
            hasFeedback
            children={<Input />}
          />
          <Form.Item
            label={intl.$t({ defaultMessage: 'Address' })}
            name={['address', 'addressLine']}
            style={{ width: '300px' }}
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

          <MspAdminsForm></MspAdminsForm>
          <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Customer Administrator' }) }</Subtitle>
          <Form.Item children={displayCustomerAdmins()} />
          <EditCustomerSubscriptionForm></EditCustomerSubscriptionForm>
          <EnableSupportForm></EnableSupportForm>
        </StepsForm.StepForm>}

        {!isEditMode && <StepsForm.StepForm name='accountDetail'
          title={intl.$t({ defaultMessage: 'Account Details' })}>
          <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Account Details' }) }</Subtitle>
          <Form.Item
            name='name'
            label={intl.$t({ defaultMessage: 'Customer Name' })}
            style={{ width: '300px' }}
            rules={[{ required: true }]}
            validateFirst
            hasFeedback
            children={<Input />}
          />
          <Form.Item
            label={intl.$t({ defaultMessage: 'Address' })}
            name={['address', 'addressLine']}
            style={{ width: '300px' }}
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

          <MspAdminsForm></MspAdminsForm>
          <CustomerAdminsForm></CustomerAdminsForm>
        </StepsForm.StepForm>}

        {!isEditMode && <StepsForm.StepForm name='subscriptions'
          title={intl.$t({ defaultMessage: 'Subscriptions' })}>
          <CustomerSubscription />
        </StepsForm.StepForm>}

        {!isEditMode && <StepsForm.StepForm name='summary'
          title={intl.$t({ defaultMessage: 'Summary' })}>
          <CustomerSummary />
        </StepsForm.StepForm>}

      </StepsForm>

      {drawerAdminVisible && <ManageAdminsDrawer
        visible={drawerAdminVisible}
        setVisible={setDrawerAdminVisible}
        setSelected={selectedMspAdmins}
      />}
      {drawerIntegratorVisible && <SelectIntegratorDrawer
        visible={drawerIntegratorVisible}
        tenantType='MSP_INTEGRATOR'
        setVisible={setDrawerIntegratorVisible}
        setSelected={selectedIntegrators}
      />}
      {drawerInstallerVisible && <SelectIntegratorDrawer
        visible={drawerInstallerVisible}
        tenantType='MSP_INSTALLER'
        setVisible={setDrawerInstallerVisible}
        setSelected={selectedIntegrators}
      />}
      {startSubscriptionVisible && <StartSubscriptionModal
        isActive={isTrialActive}
        visible={startSubscriptionVisible}
        setVisible={setStartSubscriptionVisible}
        setStartDate={startSubscription}
      />}
    </>
  )
}
