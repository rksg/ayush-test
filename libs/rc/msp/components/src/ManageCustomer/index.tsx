import { useState, useRef, useEffect } from 'react'

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
  PageHeader,
  showToast,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Subtitle
} from '@acx-ui/components'
import { useIsSplitOn, useIsTierAllowed, Features } from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                from '@acx-ui/formatter'
import { SearchOutlined }                           from '@acx-ui/icons'
import {
} from '@acx-ui/msp/services'
import {
  useAddCustomerMutation,
  useMspEcAdminListQuery,
  useUpdateCustomerMutation,
  useGetMspEcQuery,
  useGetMspEcDelegatedAdminsQuery,
  useGetMspEcSupportQuery,
  useEnableMspEcSupportMutation,
  useDisableMspEcSupportMutation,
  useMspAssignmentSummaryQuery,
  useMspAssignmentHistoryQuery,
  useMspAdminListQuery,
  useMspCustomerListQuery
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
  MspIntegratorDelegated,
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
import { AccountType }            from '@acx-ui/utils'

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
    admin_role: RolesEnum,
    wifiLicense: number,
    switchLicense: number
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
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const optionalAdminFF = useIsSplitOn(Features.MSPEC_OPTIONAL_ADMIN)
  const edgeEnabled = useIsTierAllowed(Features.EDGES)

  const navigate = useNavigate()
  const linkToCustomers = useTenantLink('/dashboard/mspcustomers', 'v')
  const formRef = useRef<StepsFormLegacyInstance<EcFormData>>()
  const { action, status, tenantId, mspEcTenantId } = useParams()

  const [isTrialMode, setTrialMode] = useState(false)
  const [isTrialActive, setTrialActive] = useState(false)
  const [trialSelected, setTrialSelected] = useState(true)
  const [ecSupportEnabled, setEcSupport] = useState(false)
  const [mspAdmins, setAdministrator] = useState([] as MspAdministrator[])
  const [mspIntegrator, setIntegrator] = useState([] as MspEc[])
  const [mspInstaller, setInstaller] = useState([] as MspEc[])
  const [mspEcAdmins, setMspEcAdmins] = useState([] as MspAdministrator[])
  const [availableWifiLicense, setAvailableWifiLicense] = useState(0)
  const [availableSwitchLicense, setAvailableSwitchLicense] = useState(0)
  const [assignedLicense, setAssignedLicense] = useState([] as MspAssignmentHistory[])
  const [assignedWifiLicense, setWifiLicense] = useState(0)
  const [assignedSwitchLicense, setSwitchLicense] = useState(0)
  const [customDate, setCustomeDate] = useState(true)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [drawerInstallerVisible, setDrawerInstallerVisible] = useState(false)
  const [startSubscriptionVisible, setStartSubscriptionVisible] = useState(false)
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<moment.Moment>()
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<moment.Moment>()
  const [subscriptionOrigEndDate, setSubscriptionOrigEndDate] = useState<moment.Moment>()
  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : defaultAddress)
  const [formData, setFormData] = useState({} as Partial<EcFormData>)
  const [optionalEcAdmin, setOptionalEcAdmin] = useState(false)
  const [addCustomer] = useAddCustomerMutation()
  const [updateCustomer] = useUpdateCustomerMutation()

  const { Option } = Select
  const { Paragraph } = Typography
  const isEditMode = action === 'edit'
  const isTrialEditMode = action === 'edit' && status === 'Trial'

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
  const { data: ecSupport } =
      useGetMspEcSupportQuery({ params: { mspEcTenantId } }, { skip: action !== 'edit' })
  const { data: techPartners } = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: {
      filters: { tenantType: [AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER] },
      fields: [
        'id',
        'name',
        'tenantType'
      ],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    },
    option: { skip: action !== 'edit' }
  })

  const [
    enableMspEcSupport
  ] = useEnableMspEcSupportMutation()

  const [
    disableMspEcSupport
  ] = useDisableMspEcSupportMutation()

  useEffect(() => {
    if (licenseSummary) {
      checkAvailableLicense(licenseSummary)

      if (isEditMode && data && licenseAssignment) {
        if (ecAdministrators) {
          setMspEcAdmins(ecAdministrators)
        }
        if (ecSupport && ecSupport.length > 0 ) {
          setEcSupport(true)
        }
        const assigned = licenseAssignment.filter(en => en.mspEcTenantId === mspEcTenantId)
        setAssignedLicense(assigned)
        const wifi = assigned.filter(en =>
          en.deviceType === EntitlementDeviceType.MSP_WIFI && en.status === 'VALID')
        const wLic = wifi.length > 0 ? wifi[0].quantity : 0
        const sw = assigned.filter(en =>
          en.deviceType === EntitlementDeviceType.MSP_SWITCH && en.status === 'VALID')
        const sLic = sw.length > 0 ? sw.reduce((acc, cur) => cur.quantity + acc, 0) : 0
        isTrialEditMode ? checkAvailableLicense(licenseSummary)
          : checkAvailableLicense(licenseSummary, wLic, sLic)

        formRef.current?.setFieldsValue({
          name: data?.name,
          service_effective_date: data?.service_effective_date,
          wifiLicense: wLic,
          switchLicense: sLic
        // service_expiration_date: data?.service_expiration_date
        })
        formRef.current?.setFieldValue(['address', 'addressLine'], data?.street_address)
        data?.is_active === 'true' ? setTrialActive(true) : setTrialActive(false)
        status === 'Trial' ? setTrialMode(true) : setTrialMode(false)

        setSubscriptionStartDate(moment(data?.service_effective_date))
        setSubscriptionEndDate(moment(data?.service_expiration_date))
        setSubscriptionOrigEndDate(moment(data?.service_expiration_date))
        setWifiLicense(wLic)
        setSwitchLicense(sLic)
      }
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
  }, [data, licenseSummary, licenseAssignment, ecSupport, userProfile, ecAdministrators])

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
    if (techPartners?.data && mspEcTenantId) {
      const assignedIntegrator = techPartners.data.filter(mspEc =>
        mspEc.assignedMspEcList?.includes(mspEcTenantId)
        && mspEc.tenantType === AccountType.MSP_INTEGRATOR)
      const assignedInstaller = techPartners.data.filter(mspEc =>
        mspEc.assignedMspEcList?.includes(mspEcTenantId)
        && mspEc.tenantType === AccountType.MSP_INSTALLER)
      setIntegrator(assignedIntegrator)
      setInstaller(assignedInstaller)
    }
  }, [techPartners])

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

  const ecSupportOnChange = (checked: boolean) => {
    if (checked) {
      enableMspEcSupport({ params: { mspEcTenantId: mspEcTenantId } })
        .then(() => {
          showToast({
            type: 'success',
            content: intl.$t({ defaultMessage: 'EC support enabled' })
          })
          setEcSupport(true)
        })
    } else {
      disableMspEcSupport({ params: { mspEcTenantId: mspEcTenantId } })
        .then(() => {
          showToast({
            type: 'success',
            content: intl.$t({ defaultMessage: 'EC support disabled' })
          })
          setEcSupport(false)
        })
    }
  }

  const ecCustomerAdminOnChange = (checked: boolean) => {
    setOptionalEcAdmin(checked)
  }

  const handleAddCustomer = async (values: EcFormData) => {
    try {
      const ecFormData = { ...values }
      const today = EntitlementUtil.getServiceStartDate()
      const expirationDate = EntitlementUtil.getServiceEndDate(subscriptionEndDate)
      const quantityWifi = _.isString(ecFormData.wifiLicense)
        ? parseInt(ecFormData.wifiLicense, 10) : ecFormData.wifiLicense
      const quantitySwitch = _.isString(ecFormData.switchLicense)
        ? parseInt(ecFormData.switchLicense, 10) : ecFormData.switchLicense
      const assignLicense = trialSelected
        ? { trialAction: AssignActionEnum.ACTIVATE }
        : { assignments: [{
          quantity: quantityWifi,
          action: AssignActionEnum.ADD,
          isTrial: false,
          deviceType: EntitlementDeviceType.MSP_WIFI
        },
        {
          quantity: quantitySwitch,
          action: AssignActionEnum.ADD,
          isTrial: false,
          deviceType: EntitlementDeviceType.MSP_SWITCH
        }] }
      const delegations= [] as MspEcDelegatedAdmins[]
      mspAdmins.forEach((admin: MspAdministrator) => {
        delegations.push({
          msp_admin_id: admin.id,
          msp_admin_role: admin.role
        })
      })
      const customer: MspEcData = {
        tenant_type: AccountType.MSP_EC,
        name: ecFormData.name,
        street_address: ecFormData.address.addressLine as string,
        city: address.city,
        country: address.country,
        service_effective_date: today,
        service_expiration_date: expirationDate,
        admin_delegations: delegations,
        licenses: assignLicense
      }
      if (ecFormData.admin_email) {
        customer.admin_email = ecFormData.admin_email
        customer.admin_firstname = ecFormData.admin_firstname
        customer.admin_lastname = ecFormData.admin_lastname
        customer.admin_role = ecFormData.admin_role
      }
      const ecDelegations=[] as MspIntegratorDelegated[]
      if (mspIntegrator.length > 0) {
        ecDelegations.push({
          delegation_type: AccountType.MSP_INTEGRATOR,
          delegation_id: mspIntegrator[0].id
        })
      }
      if (mspInstaller.length > 0) {
        ecDelegations.push({
          delegation_type: AccountType.MSP_INSTALLER,
          delegation_id: mspInstaller[0].id
        })
      }
      if (ecDelegations.length > 0) {
        customer.delegations = ecDelegations
      }

      const result =
      await addCustomer({ params: { tenantId: tenantId }, payload: customer }).unwrap()
      if (result) {
      // const ecTenantId = result.tenant_id
      }
      navigate(linkToCustomers, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleEditCustomer = async (values: EcFormData) => {
    try {
      const ecFormData = { ...values }
      const today = EntitlementUtil.getServiceStartDate()
      const expirationDate = EntitlementUtil.getServiceEndDate(subscriptionEndDate)
      const expirationDateOrig = EntitlementUtil.getServiceEndDate(subscriptionOrigEndDate)
      const needUpdateLicense = expirationDate !== expirationDateOrig

      const licAssignment = []
      if (isTrialEditMode) {
        const quantityWifi = _.isString(ecFormData.wifiLicense)
          ? parseInt(ecFormData.wifiLicense, 10) : ecFormData.wifiLicense
        licAssignment.push({
          quantity: quantityWifi,
          action: AssignActionEnum.ADD,
          isTrial: false,
          deviceType: EntitlementDeviceType.MSP_WIFI
        })
        const quantitySwitch = _.isString(ecFormData.switchLicense)
          ? parseInt(ecFormData.switchLicense, 10) : ecFormData.switchLicense
        licAssignment.push({
          quantity: quantitySwitch,
          action: AssignActionEnum.ADD,
          isTrial: false,
          deviceType: EntitlementDeviceType.MSP_SWITCH
        })
      } else {
        if (_.isString(ecFormData.wifiLicense) || needUpdateLicense) {
          const wifiAssignId = getAssignmentId(EntitlementDeviceType.MSP_WIFI)
          const quantityWifi = _.isString(ecFormData.wifiLicense)
            ? parseInt(ecFormData.wifiLicense, 10) : ecFormData.wifiLicense
          const actionWifi = wifiAssignId === 0 ? AssignActionEnum.ADD : AssignActionEnum.MODIFY
          licAssignment.push({
            quantity: quantityWifi,
            assignmentId: wifiAssignId,
            action: actionWifi,
            isTrial: false,
            deviceType: EntitlementDeviceType.MSP_WIFI
          })
        }
        if (_.isString(ecFormData.switchLicense) || needUpdateLicense) {
          const switchAssignId = getAssignmentId(EntitlementDeviceType.MSP_SWITCH)
          const quantitySwitch = _.isString(ecFormData.switchLicense)
            ? parseInt(ecFormData.switchLicense, 10) : ecFormData.switchLicense
          const actionSwitch = switchAssignId === 0 ? AssignActionEnum.ADD : AssignActionEnum.MODIFY
          licAssignment.push({
            quantity: quantitySwitch,
            assignmentId: switchAssignId,
            action: actionSwitch,
            deviceSubtype: EntitlementDeviceSubType.ICX,
            deviceType: EntitlementDeviceType.MSP_SWITCH
          })
        }
      }

      const customer: MspEcData = {
        tenant_type: AccountType.MSP_EC,
        name: ecFormData.name,
        street_address: ecFormData.address.addressLine as string,
        city: address.city,
        country: address.country,
        service_effective_date: today,
        service_expiration_date: expirationDate
      }
      if (!isTrialMode && licAssignment.length > 0) {
        let assignLicense = {
          subscription_start_date: today,
          subscription_end_date: expirationDate,
          assignments: licAssignment
        }
        customer.licenses = assignLicense
      }

      await updateCustomer({ params: { mspEcTenantId: mspEcTenantId }, payload: customer }).unwrap()
      navigate(linkToCustomers, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const selectedMspAdmins = (selected: MspAdministrator[]) => {
    setAdministrator(selected)
  }

  const selectedIntegrators = (tenantType: string, selected: MspEc[] ) => {
    (tenantType === AccountType.MSP_INTEGRATOR) ? setIntegrator(selected) : setInstaller(selected)
  }

  const displayMspAdmins = () => {
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
          {admin.email} {intl.$t(roleDisplayText[admin.role])}
        </UI.AdminList>
      )}
    </div>
  }

  const startSubscription = (startDate: Date) => {
    if (startDate) {
      setSubscriptionStartDate(moment(startDate))
      setTrialMode(false)
    }
  }

  const checkAvailableLicense =
  (entitlements: MspAssignmentSummary[], wLic?: number, swLic?: number) => {
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
  }

  const getAssignmentId = (deviceType: string) => {
    const license =
    assignedLicense.filter(en => en.deviceType === deviceType && en.status === 'VALID')
    return license.length > 0 ? license[0].id : 0
  }

  const MspAdminsForm = () => {
    return <>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '15px' }}>
        <label>{intl.$t({ defaultMessage: 'MSP Administrators' })}</label>
        <Form.Item children={<div>{displayMspAdmins()}</div>} />
        {!isEditMode && <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerAdminVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>
          }
        />}
      </UI.FieldLabelAdmins>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-12px' }}>
        <label>{intl.$t({ defaultMessage: 'Integrator' })}</label>
        <Form.Item children={displayIntegrator()} />
        {!isEditMode && <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerIntegratorVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>}
        />}
      </UI.FieldLabelAdmins>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-16px' }}>
        <label>{intl.$t({ defaultMessage: 'Installer' })}</label>
        <Form.Item children={displayInstaller()} />
        {!isEditMode && <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerInstallerVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>}
        />}
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
      return <>{optionalAdminFF &&
      <Switch style={{ marginTop: '-5px' }}
        defaultChecked={optionalEcAdmin}
        onChange={ecCustomerAdminOnChange}/>}
      <Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Customer Administrator' }) }</Subtitle>
      {(!optionalAdminFF || optionalEcAdmin) && <div>
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
                  !(value === RolesEnum.DPSK_ADMIN || value === RolesEnum.GUEST_MANAGER )
                  && <Option
                    key={label}
                    value={value}>{intl.$t(roleDisplayText[value])}
                  </Option>
                ))
              }
            </Select>
          }
        />
      </div>}
      </>
    }
  }

  const WifiSubscription = () => {
    return <div >
      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'Wi-Fi Subscription' })}</label>
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
        <label>devices out of {availableWifiLicense} available</label>
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
        <label>devices out of {availableSwitchLicense} available</label>
      </UI.FieldLabelSubs>
    </div>
  }

  const EnableSupportForm = () => {
    return <>
      <div>
        <h4 style={{ display: 'inline-block', marginTop: '38px', marginRight: '25px' }}>
          {intl.$t({ defaultMessage: 'Enable access to Ruckus Support' })}</h4>
        <Switch defaultChecked={ecSupportEnabled} onChange={ecSupportOnChange}/></div>
      <div><label>
        {intl.$t({ defaultMessage: 'If checked, Ruckus Support team is granted a temporary' +
  ' administrator-level access for 21 days.' })}</label>
      </div>
      <label>
        {intl.$t({ defaultMessage: 'Enable when requested by Ruckus Support team.' })}</label>
    </>
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

  const EditCustomerSubscriptionForm = () => {
    const trialSubscriptionSubtitle = isTrialActive
      ? intl.$t({ defaultMessage: 'Subscriptions (Trial Mode)' })
      : intl.$t({ defaultMessage: 'Inactive Subscriptions' })
    return <>
      {isTrialMode && <div>
        <Subtitle level={3} style={{ display: 'inline-block' }}>
          {trialSubscriptionSubtitle}</Subtitle>
        <Button
          type='primary'
          style={{ display: 'inline-block', marginLeft: '80px' }}
          onClick={() => setStartSubscriptionVisible(true)}
        >{intl.$t({ defaultMessage: 'Start Subscription' })}
        </Button>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '20px' }}>
          <label>{intl.$t({ defaultMessage: 'Wi-Fi Subscription' })}</label>
          <label>{assignedWifiLicense}</label>
        </UI.FieldLabel2>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: 'Switch Subscription' })}</label>
          <label>{assignedSwitchLicense}</label>
        </UI.FieldLabel2>

        <UI.FieldLabel2 width='275px' style={{ marginTop: '20px' }}>
          <label>{intl.$t({ defaultMessage: 'Trial Start Date' })}</label>
          <label>{formatter(DateFormatEnum.DateFormat)(subscriptionStartDate)}</label>
        </UI.FieldLabel2>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: '30 Day Trial Ends on' })}</label>
          <label>{formatter(DateFormatEnum.DateFormat)(subscriptionEndDate)}</label>
        </UI.FieldLabel2></div>
      }

      {!isTrialMode && <div>
        <Subtitle level={3}>
          { intl.$t({ defaultMessage: 'Paid Subscriptions' }) }</Subtitle>
        <WifiSubscription />
        <SwitchSubscription />

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
            children={
              <DatePicker
                format={formatter(DateFormatEnum.DateFormat)}
                disabled={!customDate}
                defaultValue={moment(formatter(DateFormatEnum.DateFormat)(subscriptionEndDate))}
                onChange={expirationDateOnChange}
                disabledDate={(current) => {
                  return current && current < moment().endOf('day')
                }}
                style={{ marginLeft: '4px' }}
              />
            }
          />
        </UI.FieldLabeServiceDate>
      </div>}
    </>
  }

  const CustomerSubscription = () => {
    return <>
      <Subtitle level={3}>{intl.$t({ defaultMessage: 'Start service in' })}</Subtitle>
      <Form.Item
        name='trialMode'
        initialValue={true}
      >
        <Radio.Group onChange={(e: RadioChangeEvent) => {
          if (e.target.value) {
            setSubscriptionStartDate(moment())
            setSubscriptionEndDate(moment().add(30,'days'))
          }
          setTrialSelected(e.target.value)
        }}>
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
          <label>{intl.$t({ defaultMessage: 'Wi-Fi Subscription' })}</label>
          <label>{intl.$t({ defaultMessage: '25 devices' })}</label>
        </UI.FieldLabel2>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: 'Switch Subscription' })}</label>
          <label>{intl.$t({ defaultMessage: '25 devices' })}</label>
        </UI.FieldLabel2>
        {edgeEnabled && <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: 'SmartEdge Subscription' })}</label>
          <label>{intl.$t({ defaultMessage: '25 devices' })}</label>
        </UI.FieldLabel2>}

        <UI.FieldLabel2 width='275px' style={{ marginTop: '20px' }}>
          <label>{intl.$t({ defaultMessage: 'Trial Start Date' })}</label>
          <label>{formatter(DateFormatEnum.DateFormat)(subscriptionStartDate)}</label>
        </UI.FieldLabel2>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: '30 Day Trial Ends on' })}</label>
          <label>{formatter(DateFormatEnum.DateFormat)(subscriptionEndDate)}</label>
        </UI.FieldLabel2></div>
      }

      {!trialSelected && <div>
        <Subtitle level={4}>
          { intl.$t({ defaultMessage: 'Paid Subscriptions' }) }</Subtitle>
        <WifiSubscription />
        <SwitchSubscription />
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
            children={
              <DatePicker
                format={formatter(DateFormatEnum.DateFormat)}
                disabled={!customDate}
                defaultValue={moment(formatter(DateFormatEnum.DateFormat)(subscriptionEndDate))}
                onChange={expirationDateOnChange}
                disabledDate={(current) => {
                  return current && current < moment().endOf('day')
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
    const wifiAssigned = trialSelected ? '25' : formData.wifiLicense
    const switchAssigned = trialSelected ? '25' : formData.switchLicense

    return (
      <>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Summary' })}</Subtitle>
        <Form.Item
          label={intl.$t({ defaultMessage: 'Customer Name' })}
        >
          <Paragraph>{formData?.name}</Paragraph>
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
          <Paragraph>{formData?.admin_firstname} {formData?.admin_lastname}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Email' })}
        >
          <Paragraph>{formData?.admin_email}</Paragraph>
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
          <Paragraph>{wifiAssigned}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Switch Subscriptions' })}
        >
          <Paragraph>{switchAssigned}</Paragraph>
        </Form.Item>
        {edgeEnabled && <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'SmartEdge Subscriptions' })}
        >
          <Paragraph>25</Paragraph>
        </Form.Item>}

        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Service Expiration Date' })}
        >
          <Paragraph>{formatter(DateFormatEnum.DateFormat)(subscriptionEndDate)}</Paragraph>
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
        <Button type='link'
          style={{ fontSize: 'var(--acx-body-4-font-size)',
            color: 'var(--acx-accents-orange-30)', float: 'left' }}
          onClick={() => setStartSubscriptionVisible(true)}
        >{intl.$t({ defaultMessage: 'Start Subscription' })}</Button>
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
          { text: intl.$t({ defaultMessage: 'My Customers' }) },
          {
            text: intl.$t({ defaultMessage: 'MSP Customers' }),
            link: '/dashboard/mspcustomers', tenantType: 'v'
          }
        ]}
      />
      <StepsFormLegacy
        formRef={formRef}
        onFinish={isEditMode ? handleEditCustomer : handleAddCustomer}
        onCancel={() => navigate(linkToCustomers)}
        buttonLabel={{ submit: isEditMode ?
          intl.$t({ defaultMessage: 'Save' }):
          intl.$t({ defaultMessage: 'Add Customer' }) }}
      >
        {isEditMode && <StepsFormLegacy.StepForm>
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
              data-testid='address-input'
              ref={placeInputRef}
              disabled={!isMapEnabled}
              value={address.addressLine}
            />
          </Form.Item >

          <MspAdminsForm></MspAdminsForm>
          <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Customer Administrator' }) }</Subtitle>
          <Form.Item children={displayCustomerAdmins()} />
          <EditCustomerSubscriptionForm></EditCustomerSubscriptionForm>
          <EnableSupportForm></EnableSupportForm>
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
                data-testid='address-input'
                ref={placeInputRef}
                disabled={!isMapEnabled}
                value={address.addressLine}
              />
            </Form.Item >
            <Form.Item hidden>
              <GoogleMapWithPreference libraries={['places']} />
            </Form.Item>

            <MspAdminsForm></MspAdminsForm>
            <CustomerAdminsForm></CustomerAdminsForm>
          </StepsFormLegacy.StepForm>

          <StepsFormLegacy.StepForm name='subscriptions'
            title={intl.$t({ defaultMessage: 'Subscriptions' })}
            onFinish={async (data) => {
              const subData = { ...formData, ...data }
              setFormData(subData)
              return true
            }}
          >
            <CustomerSubscription />
          </StepsFormLegacy.StepForm>

          <StepsFormLegacy.StepForm name='summary'
            title={intl.$t({ defaultMessage: 'Summary' })}>
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
      {drawerIntegratorVisible && <SelectIntegratorDrawer
        visible={drawerIntegratorVisible}
        tenantType={AccountType.MSP_INTEGRATOR}
        setVisible={setDrawerIntegratorVisible}
        setSelected={selectedIntegrators}
      />}
      {drawerInstallerVisible && <SelectIntegratorDrawer
        visible={drawerInstallerVisible}
        tenantType={AccountType.MSP_INSTALLER}
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
