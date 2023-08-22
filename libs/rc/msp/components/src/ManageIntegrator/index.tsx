import { useState, useRef, useEffect } from 'react'

import {
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Space,
  Select,
  Typography
} from 'antd'
import _           from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Subtitle
} from '@acx-ui/components'
import { useIsSplitOn, Features }        from '@acx-ui/feature-toggle'
import { formatter, DateFormatEnum }     from '@acx-ui/formatter'
import { SearchOutlined }                from '@acx-ui/icons'
import {
  useAddCustomerMutation,
  useMspEcAdminListQuery,
  useUpdateCustomerMutation,
  useGetMspEcQuery,
  useMspAssignmentSummaryQuery,
  useMspAssignmentHistoryQuery,
  useMspAdminListQuery,
  useGetMspEcDelegatedAdminsQuery,
  useMspCustomerListQuery,
  useGetAssignedMspEcToIntegratorQuery
} from '@acx-ui/msp/services'
import {
  dateDisplayText,
  DateSelectionEnum,
  MspAdministrator,
  MspEc,
  MspEcData,
  MspAssignmentHistory,
  MspAssignmentSummary,
  MspEcDelegatedAdmins,
  AssignActionEnum
} from '@acx-ui/msp/utils'
import { GoogleMapWithPreference, usePlacesAutocomplete } from '@acx-ui/rc/components'
import {
  Address,
  emailRegExp,
  roleDisplayText,
  EntitlementUtil,
  useTableQuery,
  EntitlementDeviceType,
  EntitlementDeviceSubType
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { RolesEnum }              from '@acx-ui/types'
import { useGetUserProfileQuery } from '@acx-ui/user'
import { AccountType  }           from '@acx-ui/utils'

import { AssignEcDrawer }     from '../AssignEcDrawer'
import { ManageAdminsDrawer } from '../ManageAdminsDrawer'
// eslint-disable-next-line import/order
import * as UI from '../styledComponents'

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
    admin_role: RolesEnum,
    wifiLicense: number,
    switchLicense: number,
    apswLicense: number,
    ecCustomers: MspEc[],
    number_of_days: string
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

export function ManageIntegrator () {
  const intl = useIntl()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const isDeviceAgnosticEnabled = useIsSplitOn(Features.DEVICE_AGNOSTIC)

  const navigate = useNavigate()
  const linkToIntegrators = useTenantLink('/integrators', 'v')
  const formRef = useRef<StepsFormLegacyInstance<EcFormData>>()
  const { action, type, tenantId, mspEcTenantId } = useParams()

  const [mspAdmins, setAdministrator] = useState([] as MspAdministrator[])
  const [mspEcAdmins, setMspEcAdmins] = useState([] as MspAdministrator[])
  const [availableWifiLicense, setAvailableWifiLicense] = useState(0)
  const [availableSwitchLicense, setAvailableSwitchLicense] = useState(0)
  const [availableApswLicense, setAvailableApswLicense] = useState(0)
  const [assignedLicense, setAssignedLicense] = useState([] as MspAssignmentHistory[])
  const [customDate, setCustomeDate] = useState(true)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerAssignedEcVisible, setDrawerAssignedEcVisible] = useState(false)
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<moment.Moment>()
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<moment.Moment>()
  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : defaultAddress)

  const [formData, setFormData] = useState({} as Partial<EcFormData>)
  const [selectedEcs, setSelectedEcs] = useState([] as MspEc[])
  const [unlimitSelected, setUnlimitSelected] = useState(true)

  const [addIntegrator] = useAddCustomerMutation()
  const [updateIntegrator] = useUpdateCustomerMutation()

  const { Option } = Select
  const { Paragraph } = Typography
  const isEditMode = action === 'edit'
  const tenantType = type

  const { data: userProfile } = useGetUserProfileQuery({ params: useParams() })
  const { data: licenseSummary } = useMspAssignmentSummaryQuery({ params: useParams() })
  const { data: licenseAssignment } = useMspAssignmentHistoryQuery({ params: useParams() })
  const { data } =
      useGetMspEcQuery({ params: { mspEcTenantId } }, { skip: action !== 'edit' })
  const { data: Administrators } =
      useMspAdminListQuery({ params: useParams() }, { skip: action !== 'edit' })
  const { data: delegatedAdmins } =
      useGetMspEcDelegatedAdminsQuery({ params: { mspEcTenantId } }, { skip: action !== 'edit' })
  const { data: ecAdministrators } =
      useMspEcAdminListQuery({ params: { mspEcTenantId } }, { skip: action !== 'edit' })
  const ecList = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: {
      searchString: '',
      filters: { tenantType: [AccountType.MSP_EC] },
      fields: [ 'id', 'name' ]
    },
    option: { skip: action !== 'edit' }
  })
  const assignedEcs =
  useGetAssignedMspEcToIntegratorQuery(
    { params: { mspIntegratorId: mspEcTenantId, mspIntegratorType: tenantType } },
    { skip: action !== 'edit' })

  useEffect(() => {
    if (licenseSummary) {
      checkAvailableLicense(licenseSummary)
    }

    if (licenseSummary && isEditMode && data && licenseAssignment) {
      if (ecAdministrators) {
        setMspEcAdmins(ecAdministrators)
      }

      const assigned = licenseAssignment.filter(en => en.mspEcTenantId === mspEcTenantId)
      setAssignedLicense(assigned)
      const wifi = assigned.filter(en =>
        en.deviceType === EntitlementDeviceType.MSP_WIFI && en.status === 'VALID')
      const wLic = wifi.length > 0 ? wifi[0].quantity : 0
      const sw = assigned.filter(en =>
        en.deviceType === EntitlementDeviceType.MSP_SWITCH && en.status === 'VALID')
      const sLic = sw.length > 0 ? sw.reduce((acc, cur) => cur.quantity + acc, 0) : 0
      const apsw = assigned.filter(en =>
        en.deviceType === EntitlementDeviceType.MSP_APSW && en.status === 'VALID')
      const apswLic = apsw.length > 0 ? apsw.reduce((acc, cur) => cur.quantity + acc, 0) : 0
      checkAvailableLicense(licenseSummary, wLic, sLic, apswLic)

      formRef.current?.setFieldsValue({
        name: data?.name,
        service_effective_date: data?.service_effective_date,
        wifiLicense: wLic,
        switchLicense: sLic,
        apswLicense: apswLic
        // service_expiration_date: data?.service_expiration_date
      })
      formRef.current?.setFieldValue(['address', 'addressLine'], data?.street_address)

      setSubscriptionStartDate(moment(data?.service_effective_date))
      setSubscriptionEndDate(moment(data?.service_expiration_date))
    }

    if (!isEditMode) { // Add mode
      const initialAddress = isMapEnabled ? '' : defaultAddress.addressLine
      formRef.current?.setFieldValue(['address', 'addressLine'], initialAddress)
      if (userProfile) {
        const administrator = [] as MspAdministrator[]
        administrator.push ({
          id: userProfile.adminId,
          lastName: userProfile.lastName,
          name: userProfile.firstName,
          email: userProfile.email,
          role: userProfile.role as RolesEnum,
          detailLevel: userProfile.detailLevel
        })
        setAdministrator(administrator)
      }
      setSubscriptionStartDate(moment())
      setSubscriptionEndDate(moment().add(30,'days'))
    }
  }, [data, licenseSummary, licenseAssignment, userProfile, ecAdministrators])

  useEffect(() => {
    if (delegatedAdmins && Administrators) {
      let selDelegateAdmins: MspAdministrator[] = []
      const admins = delegatedAdmins?.map((admin: MspEcDelegatedAdmins)=> admin.msp_admin_id)
      const selAdmins = Administrators.filter(rec => admins.includes(rec.id))
      selAdmins.forEach((element:MspAdministrator) => {
        const role =
        delegatedAdmins.find(row => row.msp_admin_id=== element.id)?.msp_admin_role ?? element.role
        const rec = { ...element }
        rec.role = role as RolesEnum
        selDelegateAdmins.push(rec)
      })
      setAdministrator(selDelegateAdmins)
    }
  }, [delegatedAdmins, Administrators])

  useEffect(() => {
    if (ecList.data?.data && isEditMode) {
      setSelectedEcs(tenantType === AccountType.MSP_INTEGRATOR
        ? ecList.data.data.filter(mspEc => mspEc.integrator === mspEcTenantId)
        : ecList.data.data.filter(mspEc => mspEc.installer === mspEcTenantId))
    }
  }, [ecList.data])

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

  const fieldValidator = async (value: string, remainingDevices: number) => {
    if(parseInt(value, 10) > remainingDevices || parseInt(value, 10) < 0) {
      return Promise.reject(
        `${intl.$t({ defaultMessage: 'Invalid number' })} `
      )
    }
    return Promise.resolve()
  }

  const addressOnChange = async (place: google.maps.places.PlaceResult) => {
    updateAddress({})
    const { address } = await addressParser(place)
    const isSameCountry = true
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
  }

  const { ref: placeInputRef } = usePlacesAutocomplete({
    onPlaceSelected: addressOnChange
  })

  const handleAddIntegrator = async (values: EcFormData) => {
    try {
      const ecFormData = { ...values }
      const today = EntitlementUtil.getServiceStartDate()
      const expirationDate = EntitlementUtil.getServiceEndDate(subscriptionEndDate)

      const delegations= [] as MspEcDelegatedAdmins[]
      mspAdmins.forEach((admin: MspAdministrator) => {
        delegations.push({
          msp_admin_id: admin.id,
          msp_admin_role: admin.role
        })
      })

      const type = unlimitSelected ? AccountType.MSP_INTEGRATOR : AccountType.MSP_INSTALLER
      const numOfDays = unlimitSelected ? '' : ecFormData.number_of_days

      const customer: MspEcData = {
        tenant_type: type,
        name: ecFormData.name,
        street_address: ecFormData.address.addressLine as string,
        city: address.city,
        country: address.country,
        service_effective_date: today,
        service_expiration_date: expirationDate,
        admin_email: ecFormData.admin_email,
        admin_firstname: ecFormData.admin_firstname,
        admin_lastname: ecFormData.admin_lastname,
        admin_role: ecFormData.admin_role,
        admin_delegations: delegations

      }
      if (selectedEcs?.length > 0) {
        const ecs = selectedEcs.map(ec => ec.id)
        customer.delegations = [
          {
            mspec_list: ecs,
            delegation_type: type,
            number_of_days: numOfDays
          }
        ]
      }
      const licAssignment = []
      if (_.isString(ecFormData.wifiLicense)) {
        const quantityWifi = parseInt(ecFormData.wifiLicense, 10)
        licAssignment.push({
          quantity: quantityWifi,
          action: AssignActionEnum.ADD,
          isTrial: false,
          deviceType: EntitlementDeviceType.MSP_WIFI
        })
      }
      if (_.isString(ecFormData.switchLicense)) {
        const quantitySwitch = parseInt(ecFormData.switchLicense, 10)
        licAssignment.push({
          quantity: quantitySwitch,
          action: AssignActionEnum.ADD,
          isTrial: false,
          deviceType: EntitlementDeviceType.MSP_SWITCH
        })
      }
      if (licAssignment.length > 0) {
        customer.licenses = { assignments: licAssignment }
      }

      const result =
      await addIntegrator({ params: { tenantId: tenantId }, payload: customer }).unwrap()
      if (result) {
      // const ecTenantId = result.tenant_id
      }
      navigate(linkToIntegrators, { replace: true })
      return true
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      return false
    }
  }

  const handleEditIntegrator = async (values: EcFormData) => {
    try {
      const ecFormData = { ...values }
      const today = EntitlementUtil.getServiceStartDate()
      const expirationDate = EntitlementUtil.getServiceEndDate(subscriptionEndDate)

      const customer: MspEcData = {
        tenant_type: tenantType,
        name: ecFormData.name,
        street_address: ecFormData.address.addressLine as string,
        city: address.city,
        country: address.country,
        service_effective_date: today,
        service_expiration_date: expirationDate
      }
      // handle license assignments
      const licAssignment = []
      if (_.isString(ecFormData.wifiLicense)) {
        const wifiAssignId = getAssignmentId(EntitlementDeviceType.MSP_WIFI)
        const quantityWifi = parseInt(ecFormData.wifiLicense, 10)
        const actionWifi = wifiAssignId === 0 ? AssignActionEnum.ADD : AssignActionEnum.MODIFY
        licAssignment.push({
          quantity: quantityWifi,
          assignmentId: wifiAssignId,
          action: actionWifi,
          isTrial: false,
          deviceType: EntitlementDeviceType.MSP_WIFI
        })
      }
      if (_.isString(ecFormData.switchLicense)) {
        const switchAssignId = getAssignmentId(EntitlementDeviceType.MSP_SWITCH)
        const quantitySwitch = parseInt(ecFormData.switchLicense, 10)
        const actionSwitch = switchAssignId === 0 ? AssignActionEnum.ADD : AssignActionEnum.MODIFY
        licAssignment.push({
          quantity: quantitySwitch,
          assignmentId: switchAssignId,
          action: actionSwitch,
          deviceSubtype: EntitlementDeviceSubType.ICX,
          deviceType: EntitlementDeviceType.MSP_SWITCH
        })
      }

      if (licAssignment.length > 0) {
        let assignLicense = {
          subscription_start_date: today,
          subscription_end_date: expirationDate,
          assignments: licAssignment
        }
        customer.licenses = assignLicense
      }
      await updateIntegrator({ params: { mspEcTenantId: mspEcTenantId },
        payload: customer }).unwrap()
      navigate(linkToIntegrators, { replace: true })
      return true
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      return false
    }
  }

  const selectedMspAdmins = (selected: MspAdministrator[]) => {
    setAdministrator(selected)
  }

  const selectedAssignEc = (selected: MspEc[]) => {
    setSelectedEcs(selected)
  }

  const displayMspAdmins = ( ) => {
    if (!mspAdmins || mspAdmins.length === 0)
      return '--'
    return <>
      {mspAdmins.map(admin =>
        <UI.AdminList key={admin.id}>
          {admin.email} ({intl.$t(roleDisplayText[admin.role])})
        </UI.AdminList>
      )}
    </>
  }

  const displayAssignedEc = () => {
    if (!selectedEcs || selectedEcs.length === 0)
      return '--'
    return <>
      {selectedEcs.map(ec =>
        <UI.AdminList key={ec.id}>
          {ec.name}
        </UI.AdminList>
      )}
    </>
  }

  const displayAccessPeriod = () => {
    if(assignedEcs?.data?.expiry_date) {
      const numOfDays = moment(assignedEcs.data.expiry_date).diff(moment(Date()), 'days')
      return intl.$t(
        { defaultMessage:
          '{accessPeriod} {accessPeriod, plural, one {Day} other {Days}}' },
        { accessPeriod: numOfDays }
      )
    } else if (assignedEcs?.data?.delegation_type) {
      return intl.$t({ defaultMessage: 'Unlimited' })
    }
    return '--'
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

  const checkAvailableLicense =
  (entitlements: MspAssignmentSummary[], wLic?: number, swLic?: number, apswLic?: number) => {
    const wifiLicenses = entitlements.filter(p =>
      p.remainingDevices > 0 && p.deviceType === EntitlementDeviceType.MSP_WIFI)
    let remainingWifi = 0
    wifiLicenses.forEach( (lic: MspAssignmentSummary) => {
      remainingWifi += lic.remainingDevices
    })
    wLic ? setAvailableWifiLicense(remainingWifi+wLic) : setAvailableWifiLicense(remainingWifi)

    const switchLicenses = entitlements.filter(p =>
      p.remainingDevices > 0 && p.deviceType === EntitlementDeviceType.MSP_SWITCH)
    let remainingSwitch = 0
    switchLicenses.forEach( (lic: MspAssignmentSummary) => {
      remainingSwitch += lic.remainingDevices
    })
    swLic ? setAvailableSwitchLicense(remainingSwitch+swLic)
      : setAvailableSwitchLicense(remainingSwitch)

    const apswLicenses = entitlements.filter(p =>
      p.remainingDevices > 0 && p.deviceType === EntitlementDeviceType.MSP_APSW)
    let remainingApsw = 0
    apswLicenses.forEach( (lic: MspAssignmentSummary) => {
      remainingApsw += lic.remainingDevices
    })
    apswLic ? setAvailableApswLicense(remainingApsw+apswLic)
      : setAvailableApswLicense(remainingApsw)
  }

  const getAssignmentId = (deviceType: string) => {
    const license =
    assignedLicense.filter(en => en.deviceType === deviceType && en.status === 'VALID')
    return license.length > 0 ? license[0].id : 0
  }

  const MspAdminsForm = () => {
    return <UI.FieldLabelAdmins width='275px' style={{ marginTop: '15px' }}>
      <label>{intl.$t({ defaultMessage: 'MSP Administrators' })}</label>
      <Form.Item children={<div>{displayMspAdmins()}</div>} />
      {!isEditMode && <Form.Item
        children={<UI.FieldTextLink onClick={() => setDrawerAdminVisible(true)}>
          {intl.$t({ defaultMessage: 'Manage' })}
        </UI.FieldTextLink>
        }
      />}
    </UI.FieldLabelAdmins>
  }

  const ManageAssignedEcForm = () => {
    return <>
      <UI.FieldLabelAdmins width='275px'>
        <label>{intl.$t({ defaultMessage: 'Assigned Customers' })}</label>
        <Form.Item children={<div>{displayAssignedEc()}</div>} />
      </UI.FieldLabelAdmins>
      <UI.FieldLabelAdmins width='275px'>
        <label>{intl.$t({ defaultMessage: 'Access Period' })}</label>
        <Form.Item children={<div>{displayAccessPeriod()}</div>} />
      </UI.FieldLabelAdmins>
    </>
  }

  const CustomerAdminsForm = () => {
    if (isEditMode) {
      return <><Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Account Administrator' }) }</Subtitle>
      <Form.Item children={displayCustomerAdmins()} />
      </>
    } else {
      return <><Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Account Administrator' }) }</Subtitle>
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
          <Select disabled>
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

  function expirationDateOnChange (props: unknown, expirationDate: string) {
    setSubscriptionEndDate(moment(expirationDate))
  }

  const onSelectChange = (value: string) => {
    if (value === DateSelectionEnum.CUSTOME_DATE) {
      // setSubscriptionEndDate('')
      setCustomeDate(true)
    } else {
      if (value === DateSelectionEnum.THIRTY_DAYS) {
        setSubscriptionEndDate(moment().add(30,'days'))
      } else if (value === DateSelectionEnum.SIXTY_DAYS) {
        setSubscriptionEndDate(moment().add(60,'days'))
      } else if (value === DateSelectionEnum.NINETY_DAYS) {
        setSubscriptionEndDate(moment().add(90,'days'))
      } else if (value === DateSelectionEnum.ONE_YEAR) {
        setSubscriptionEndDate(moment().add(1,'years'))
      } else if (value === DateSelectionEnum.THREE_YEARS) {
        setSubscriptionEndDate(moment().add(3,'years'))
      } else if (value === DateSelectionEnum.FIVE_YEARS) {
        setSubscriptionEndDate(moment().add(5,'years'))
      }
      setCustomeDate(false)
    }
  }

  const AssignEcForm = () => {
    const onChange = (e: RadioChangeEvent) => {
      setUnlimitSelected(e.target.value)
      if (e.target.value) {
        selectedAssignEc([])
      }
    }

    const content =
    <>
      <Subtitle level={4}>{intl.$t({ defaultMessage: 'Access Periods' })}</Subtitle>
      <Form.Item
        name='type'
        initialValue={true}
        style={{ marginTop: '20px' }}
      >
        <Radio.Group onChange={onChange}>
          <Space direction='vertical'>
            <Radio value={true} disabled={false}>
              { intl.$t({ defaultMessage: 'Not Limited' }) }
            </Radio>
            <UI.FieldLabelAccessPeriod width='275px'>
              <Radio style={{ marginTop: '5px' }} value={false} disabled={false}>
                { intl.$t({ defaultMessage: 'Limited To' }) }
              </Radio>
              <Form.Item
                name='number_of_days'
                initialValue={'7'}
                rules={[{ validator: (_, value) =>
                {
                  if(parseInt(value, 10) > 60 || parseInt(value, 10) < 1) {
                    return Promise.reject(
                      `${intl.$t({ defaultMessage: 'Value must be between 1 and 60 days' })} `
                    )
                  }
                  return Promise.resolve()
                }
                }]}
                children={<Input disabled={unlimitSelected} type='number'/>}
                style={{ paddingRight: '20px' }}
              />
              <label>Day(s)</label>
            </UI.FieldLabelAccessPeriod>
          </Space>
        </Radio.Group>
      </Form.Item>

      <UI.FieldLabelAdmins width='275px'>
        <label>{intl.$t({ defaultMessage: 'Assigned Customers' })}</label>
        <Form.Item children={<div>{displayAssignedEc()}</div>} />
        <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerAssignedEcVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>
          }
        />
      </UI.FieldLabelAdmins>
    </>
    return (
      <div>{content}</div>
    )
  }

  const CustomerSubscriptionForm = () => {
    return <div>
      {!isDeviceAgnosticEnabled && <div>
        <WifiSubscription />
        <SwitchSubscription />
      </div>}
      {isDeviceAgnosticEnabled && <ApswSubscription />}
      <UI.FieldLabel2 width='275px' style={{ marginTop: '18px' }}>
        <label>{intl.$t({ defaultMessage: 'Service Start Date' })}</label>
        <label>{formatter(DateFormatEnum.DateFormat)(subscriptionStartDate)}</label>
      </UI.FieldLabel2>

      <UI.FieldLabeServiceDate width='275px' style={{ marginTop: '10px' }}>
        <label>{intl.$t({ defaultMessage: 'Service Expiration Date' })}</label>
        <Form.Item
          name='expirationDateSelection'
          label=''
          rules={[{ required: true } ]}
          initialValue={DateSelectionEnum.CUSTOME_DATE}
          children={
            <Select onChange={onSelectChange}>
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
          initialValue={moment(formatter(DateFormatEnum.DateFormat)(subscriptionEndDate))}
          children={
            <DatePicker
              format={formatter(DateFormatEnum.DateFormat)}
              disabled={!customDate}
              // defaultValue={moment(formatter(DateFormatEnum.DateFormat)(subscriptionEndDate))}
              onChange={expirationDateOnChange}
              disabledDate={(current) => {
                return current && current < moment().endOf('day')
              }}
              style={{ marginLeft: '4px' }}
            />
          }
        />
      </UI.FieldLabeServiceDate></div>
  }

  const WifiSubscription = () => {
    return <div >
      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'WiFi Subscription' })}</label>
        <Form.Item
          name='wifiLicense'
          label=''
          initialValue={0}
          rules={[
            { required: true },
            { validator: (_, value) => fieldValidator(value, availableWifiLicense) }
          ]}
          children={<Input type='number'/>}
          style={{ paddingRight: '20px' }}
        />
        <label>
          {intl.$t({ defaultMessage: 'devices out of {availableWifiLicense} available' }, {
            availableWifiLicense: availableWifiLicense })}
        </label>
      </UI.FieldLabelSubs>
    </div>
  }

  const SwitchSubscription = () => {
    return <div >
      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'Switch Subscription' })}</label>
        <Form.Item
          name='switchLicense'
          label=''
          initialValue={0}
          rules={[
            { required: true },
            { validator: (_, value) => fieldValidator(value, availableSwitchLicense) }
          ]}
          children={<Input type='number'/>}
          style={{ paddingRight: '20px' }}
        />
        <label>
          {intl.$t({ defaultMessage: 'devices out of {availableSwitchLicense} available' }, {
            availableSwitchLicense: availableSwitchLicense })}
        </label>
      </UI.FieldLabelSubs>
    </div>
  }

  const ApswSubscription = () => {
    return <div >
      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'Device Subscription' })}</label>
        <Form.Item
          name='apswLicense'
          label=''
          initialValue={0}
          rules={[
            { required: true },
            { validator: (_, value) => fieldValidator(value, availableApswLicense) }
          ]}
          children={<Input type='number'/>}
          style={{ paddingRight: '20px' }}
        />
        <label>
          {intl.$t({ defaultMessage: 'devices out of {availableApswLicense} available' }, {
            availableApswLicense: availableApswLicense })}
        </label>
      </UI.FieldLabelSubs>
    </div>
  }

  const CustomerSummary = () => {
    const intl = useIntl()
    const { Paragraph } = Typography
    return (
      <>
        <Form.Item
          label={intl.$t({ defaultMessage: 'Account Name' })}
        >
          <Paragraph>{formData.name}</Paragraph>
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
          label={intl.$t({ defaultMessage: 'Assigned Customers' })}
        >
          <Paragraph>{displayAssignedEc()}</Paragraph>
        </Form.Item>

        <Form.Item
          label={intl.$t({ defaultMessage: 'Customer Administrator Name' })}
        >
          <Paragraph>{formData.admin_firstname} {formData.admin_lastname}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Email' })}
        >
          <Paragraph>{formData.admin_email}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Role' })}
        >
          {formData?.admin_role &&
          <Paragraph>{intl.$t(roleDisplayText[formData.admin_role as RolesEnum])}</Paragraph>}
        </Form.Item>

        <Form.Item
          label={intl.$t({ defaultMessage: 'Wi-Fi Subscriptions' })}
        >
          <Paragraph>{formData.wifiLicense}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Switch Subscriptions' })}
        >
          <Paragraph>{formData.switchLicense}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Service Expiration Date' })}
        >
          <Paragraph>{formatter(DateFormatEnum.DateFormat)(subscriptionEndDate)}</Paragraph>
        </Form.Item></>
    )
  }

  return (
    <>
      <PageHeader
        title={!isEditMode ?
          intl.$t({ defaultMessage: 'Add Tech Partner' }) :
          intl.$t({ defaultMessage: 'Tech Partner Account' })
        }
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'Tech Partners' }),
            link: '/integrators', tenantType: 'v' }
        ]}
      />
      <StepsFormLegacy
        formRef={formRef}
        onFinish={isEditMode ? handleEditIntegrator : handleAddIntegrator}
        onCancel={() => navigate(linkToIntegrators)}
        buttonLabel={{ submit: isEditMode ?
          intl.$t({ defaultMessage: 'Save' }):
          intl.$t({ defaultMessage: 'Add Tech Partner' }) }}
        onCurrentChange={() => {
          setDrawerAdminVisible(false)
          setDrawerAssignedEcVisible(false)
        }}
      >
        {isEditMode && <StepsFormLegacy.StepForm>
          <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Account Details' }) }</Subtitle>
          <Form.Item
            name='name'
            label={intl.$t({ defaultMessage: 'Account Name' })}
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
              data-testid='address-input'
              ref={placeInputRef}
              disabled={!isMapEnabled}
              value={address.addressLine}
            />
          </Form.Item >

          <MspAdminsForm />
          <ManageAssignedEcForm />
          <CustomerAdminsForm />
          <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Subscriptions' }) }</Subtitle>
          <CustomerSubscriptionForm />
        </StepsFormLegacy.StepForm>}

        {!isEditMode && <>
          <StepsFormLegacy.StepForm
            name='accountDetail'
            title={intl.$t({ defaultMessage: 'Account Details' })}
            onFinish={async (data) => {
              const accDetail = { ...data }
              setFormData(accDetail)
              return true
            }}
          >
            <Subtitle level={3}>
              { intl.$t({ defaultMessage: 'Account Details' }) }</Subtitle>
            <Divider/>
            <Form.Item
              name='name'
              label={intl.$t({ defaultMessage: 'Account Name' })}
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
                data-testid='address-input'
                ref={placeInputRef}
                disabled={!isMapEnabled}
                value={address.addressLine}
              />
            </Form.Item >
            <Form.Item hidden>
              <GoogleMapWithPreference libraries={['places']} />
            </Form.Item>
            <MspAdminsForm />
            <CustomerAdminsForm />
          </StepsFormLegacy.StepForm>

          <StepsFormLegacy.StepForm
            name='customers'
            title={intl.$t({ defaultMessage: 'Customers' })}
            onFinish={async (data) => {
              const ecData = { ...formData, ...data }
              setFormData(ecData)
              return true
            }}
          >
            <Col span={15}>
              <Subtitle level={3}>
                { intl.$t({ defaultMessage: 'Customers' }) }</Subtitle>
              <Divider/>
              <AssignEcForm/>
            </Col>
          </StepsFormLegacy.StepForm>

          <StepsFormLegacy.StepForm
            name='subscriptions'
            title={intl.$t({ defaultMessage: 'Subscriptions' })}
            onFinish={async (data) => {
              const subData = { ...formData, ...data }
              setFormData(subData)
              return true
            }}
          >
            <Subtitle level={3}>
              { intl.$t({ defaultMessage: 'Subscriptions' }) }</Subtitle>
            <Divider/>
            <CustomerSubscriptionForm />
          </StepsFormLegacy.StepForm>

          <StepsFormLegacy.StepForm
            name='summary'
            title={intl.$t({ defaultMessage: 'Summary' })}
          >
            <Subtitle level={3}>
              {intl.$t({ defaultMessage: 'Summary' })}</Subtitle>
            <Divider/>
            <CustomerSummary />
          </StepsFormLegacy.StepForm>
        </>}

      </StepsFormLegacy>

      {drawerAdminVisible && <ManageAdminsDrawer
        visible={drawerAdminVisible}
        setVisible={setDrawerAdminVisible}
        setSelected={selectedMspAdmins}
        tenantId={mspEcTenantId}
      />}
      {drawerAssignedEcVisible && <AssignEcDrawer
        visible={drawerAssignedEcVisible}
        setVisible={setDrawerAssignedEcVisible}
        setSelected={selectedAssignEc}
        tenantId={mspEcTenantId}
        tenantType={unlimitSelected ? AccountType.MSP_INTEGRATOR : AccountType.MSP_INSTALLER}
      />}
    </>
  )
}
