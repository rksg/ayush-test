import { useState, useRef, ChangeEventHandler, useEffect } from 'react'


import {
  DatePicker,
  Form,
  Input,
  Select,
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
  MspAdministrator,
  MspEc,
  MspEcData,
  roleDisplayText,
  EntitlementUtil,
  excludeExclamationRegExp,
  EntitlementDeviceSubType,
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
  const linkToCustomers = useTenantLink('/dashboard/mspcustomers', 'v')
  const formRef = useRef<StepsFormInstance<MspEcData>>()

  const { action, status, tenantId, mspEcTenantId } = useParams()

  const [isTrialMode, setTrialMode] = useState(true)
  const [isTrialActive, setTrialActive] = useState(true)
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

    if ( action !== 'edit') { // Add mode
      const initialAddress = isMapEnabled ? '' : defaultAddress.addressLine
      formRef.current?.setFieldValue(['address', 'addressLine'], initialAddress)
    }
  }, [data, licenseSummary, ecAdministrators, isMapEnabled])

  const [sameCountry, setSameCountry] = useState(true)
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
      const { address } = await addressParser(place)
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

  const manageMspAdmins = () => {
    setDrawerAdminVisible(true)
  }

  const manageIntegrator = (type: string) => {
    type === 'MSP_INSTALLER' ? setDrawerInstallerVisible(true) : setDrawerIntegratorVisible(true)
  }

  const onClickStartSubscription = () => {
    setStartSubscriptionVisible(true)
  }

  const startSubscription = (startDate: Date) => {
    if (startDate) {
      const dateString = moment(startDate).format('MM/DD/YYYY')
      setStartSubscriptionDate(dateString)
      setTrialMode(false)
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

  const checkAvailableLicense = (entitlements: MspAssignmentSummary[]) => {
    const availableLicense = entitlements.filter(p => p.remainingDevices > 0)
    setAvailableLicense(availableLicense)
  }

  const WifiSubscription = () => {
    const wifiLicenses = availableLicense.filter(p => p.deviceType === 'MSP_WIFI')

    return <>
      {wifiLicenses.map(license =>
        <div >
          <UI.FieldLabelSubs width='275px'>
            <label>{intl.$t({ defaultMessage: 'WiFi Subscription' })}</label>
            <Form.Item
              name='wifiLicense'
              label=''
              initialValue={0}
              rules={[
                { required: true },
                { min: 0 },
                { max: license.remainingDevices },
                { validator: (_, value) => excludeExclamationRegExp(value) }
              ]}
              children={<Input/>}
              style={{ paddingRight: '20px' }}
            />
            <label>devices out of {license.remainingDevices} available</label>
          </UI.FieldLabelSubs>
        </div> )}
    </>
  }

  const SwitchSubscription = () => {
    const switchLicenses = availableLicense.filter(p => p.deviceType === 'MSP_SWITCH')
    return <>
      {switchLicenses.map(license =>
        <div >
          <UI.FieldLabelSubs width='275px'>
            <label>
              {EntitlementUtil.deviceSubTypeToText(
                license.deviceSubType as EntitlementDeviceSubType)}
            </label>
            <Form.Item
              name={license.deviceSubType}
              label=''
              initialValue={0}
              rules={[
                { required: true },
                { min: 0 },
                { max: license.remainingDevices },
                { validator: (_, value) => excludeExclamationRegExp(value) }
              ]}
              children={<Input/>}
              style={{ paddingRight: '20px' }}
            />
            <label>devices out of {license.remainingDevices} available</label>
          </UI.FieldLabelSubs>
        </div> )}
    </>
  }

  const EditCustomerMspAdminsForm = () => {
    return <>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '15px' }}>
        <label>{intl.$t({ defaultMessage: 'MSP Administrators' })}</label>
        <Form.Item children={<div>{displayMspAdmins()}</div>} />
        <Form.Item
          children={<UI.FieldTextLink onClick={() => manageMspAdmins()}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>
          }
        />
      </UI.FieldLabelAdmins>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-12px' }}>
        <label>{intl.$t({ defaultMessage: 'Integrator' })}</label>
        <Form.Item children={displayIntegrator()} />
        <Form.Item
          children={<UI.FieldTextLink onClick={() => manageIntegrator('MSP_INTEGRATOR')}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>}
        />
      </UI.FieldLabelAdmins>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-16px' }}>
        <label>{intl.$t({ defaultMessage: 'Installer' })}</label>
        <Form.Item children={displayInstaller()} />
        <Form.Item
          children={<UI.FieldTextLink onClick={() => manageIntegrator('MSP_INSTALLER')}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>}
        />
      </UI.FieldLabelAdmins>
      <Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Customer Administrator' }) }</Subtitle>
      <Form.Item children={displayCustomerAdmins()} />
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
          onClick={() => onClickStartSubscription()}
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

          <EditCustomerMspAdminsForm></EditCustomerMspAdminsForm>
          <EditCustomerSubscriptionForm></EditCustomerSubscriptionForm>
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
        </StepsForm.StepForm>
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
        visible={startSubscriptionVisible}
        setVisible={setStartSubscriptionVisible}
        setStartDate={startSubscription}
      />}
    </>
  )
}
