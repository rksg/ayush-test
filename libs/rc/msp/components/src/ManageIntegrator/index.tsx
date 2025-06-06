import { useState, useRef, useEffect } from 'react'

import {
  Col,
  Divider,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Space,
  Select,
  Typography,
  Switch
} from 'antd'
import _           from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  DatePicker,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Subtitle
} from '@acx-ui/components'
import { useIsSplitOn, Features, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import { formatter, DateFormatEnum }                              from '@acx-ui/formatter'
import { SearchOutlined }                                         from '@acx-ui/icons'
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
import { GoogleMapWithPreference, usePlacesAutocomplete }         from '@acx-ui/rc/components'
import { useGetPrivacySettingsQuery, useGetPrivilegeGroupsQuery } from '@acx-ui/rc/services'
import {
  Address,
  emailRegExp,
  roleDisplayText,
  EntitlementUtil,
  useTableQuery,
  EntitlementDeviceType,
  EntitlementDeviceSubType,
  whitespaceOnlyRegExp,
  PrivilegeGroup,
  PrivacyFeatureName
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { RolesEnum }                   from '@acx-ui/types'
import { useUserProfileContext }       from '@acx-ui/user'
import { AccountType, noDataDisplay  } from '@acx-ui/utils'

import { AssignEcDrawer }            from '../AssignEcDrawer'
import { ManageAdminsDrawer }        from '../ManageAdminsDrawer'
import { ManageDelegateAdminDrawer } from '../ManageDelegateAdminDrawer'
// eslint-disable-next-line import/order
import { ManageMspDelegationDrawer } from '../ManageMspDelegations'
import * as UI                       from '../styledComponents'

interface AddressComponent {
  long_name?: string;
  short_name?: string;
  types?: Array<string>;
}

interface EcFormData {
    name: string,
    address: Address,
    service_effective_date: moment.Moment,
    service_expiration_date: moment.Moment,
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
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const isRbacEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
  const isRbacPhase2Enabled = useIsSplitOn(Features.RBAC_PHASE2_TOGGLE)
  const isAppMonitoringEnabled = useIsSplitOn(Features.MSP_APP_MONITORING)
  const isViewmodleAPIsMigrateEnabled = useIsSplitOn(Features.VIEWMODEL_APIS_MIGRATE_MSP_TOGGLE)

  const navigate = useNavigate()
  const linkToIntegrators = useTenantLink('/integrators', 'v')
  const formRef = useRef<StepsFormLegacyInstance<EcFormData>>()
  const { action, type, tenantId, mspEcTenantId } = useParams()

  const [mspAdmins, setAdministrator] = useState([] as MspAdministrator[])
  const [mspEcAdmins, setMspEcAdmins] = useState([] as MspAdministrator[])
  const [privilegeGroups, setPrivilegeGroups] = useState([] as PrivilegeGroup[])
  const [availableWifiLicense, setAvailableWifiLicense] = useState(0)
  const [availableSwitchLicense, setAvailableSwitchLicense] = useState(0)
  const [availableApswLicense, setAvailableApswLicense] = useState(0)
  const [assignedLicense, setAssignedLicense] = useState([] as MspAssignmentHistory[])
  const [customDate, setCustomeDate] = useState(true)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerAssignedEcVisible, setDrawerAssignedEcVisible] = useState(false)
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<moment.Moment>()
  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : defaultAddress)

  const [formData, setFormData] = useState({} as Partial<EcFormData>)
  const [selectedEcs, setSelectedEcs] = useState([] as MspEc[])
  const [autoAssignEcAdmin, setAssignAdmin] = useState(false)

  const [unlimitSelected, setUnlimitSelected] = useState(true)
  const [arcEnabled, setArcEnabled] = useState(false)

  const [addIntegrator] = useAddCustomerMutation()
  const [updateIntegrator] = useUpdateCustomerMutation()

  const { Option } = Select
  const { Paragraph } = Typography
  const isEditMode = action === 'edit'
  const tenantType = type

  const { data: userProfile } = useUserProfileContext()
  const { data: licenseSummary } = useMspAssignmentSummaryQuery({ params: useParams() })
  const { data: licenseAssignment } = useMspAssignmentHistoryQuery({ params: useParams() })
  const { data } =
      useGetMspEcQuery({ params: { mspEcTenantId }, enableRbac: isRbacEnabled },
        { skip: action !== 'edit' })
  const { data: Administrators } =
      useMspAdminListQuery({ params: useParams() }, { skip: action !== 'edit' })
  const { data: delegatedAdmins } =
      useGetMspEcDelegatedAdminsQuery({ params: { mspEcTenantId }, enableRbac: isRbacEnabled },
        { skip: action !== 'edit' })
  const { data: ecAdministrators } =
      useMspEcAdminListQuery({ params: { mspEcTenantId }, enableRbac: isRbacEnabled },
        { skip: action !== 'edit' })
  const ecList = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: {
      searchString: '',
      filters: { tenantType: [AccountType.MSP_EC] },
      fields: [ 'id', 'name' ]
    },
    option: { skip: action !== 'edit' },
    enableRbac: isViewmodleAPIsMigrateEnabled
  })
  const assignedEcs =
  useGetAssignedMspEcToIntegratorQuery(
    { params: { mspIntegratorId: mspEcTenantId, mspIntegratorType: tenantType },
      enable: isRbacEnabled }, { skip: action !== 'edit' })
  const adminRoles = [RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]
  const isSystemAdmin = userProfile?.roles?.some(role => adminRoles.includes(role as RolesEnum))
  const { data: privilegeGroupList } = useGetPrivilegeGroupsQuery({ params: useParams() },
    { skip: !isRbacPhase2Enabled || isEditMode || isSystemAdmin })

  const { data: privacySettingsData } =
   useGetPrivacySettingsQuery({ params: useParams() },
     { skip: isEditMode || !isAppMonitoringEnabled })

  useEffect(() => {
    if (privacySettingsData) {
      const privacyMonitoringSetting =
         privacySettingsData.filter(item => item.featureName === PrivacyFeatureName.ARC)[0]
      setArcEnabled(privacyMonitoringSetting.isEnabled)
    }
  }, [privacySettingsData])

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
        apswLicense: apswLic,
        service_expiration_date: moment(data?.service_expiration_date)
      })
      formRef.current?.setFieldValue(['address', 'addressLine'], data?.street_address)

      setSubscriptionStartDate(moment(data?.service_effective_date))
      if (isAppMonitoringEnabled) {
        setArcEnabled(data.privacyFeatures?.find(f =>
          f.featureName === 'ARC')?.isEnabled ? true : false)
      }
    }

    if (!isEditMode) { // Add mode
      const initialAddress = isMapEnabled ? '' : defaultAddress.addressLine
      formRef.current?.setFieldValue(['address', 'addressLine'], initialAddress)
      if (userProfile) {
        if (isSystemAdmin) {
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
        } else {
          const pg = privilegeGroupList?.find(pg => pg.name === userProfile?.role)
          if (pg) {
            const pgList = [] as PrivilegeGroup[]
            pgList.push({ id: pg.id, name: userProfile.role as RolesEnum })
            setPrivilegeGroups(pgList)
          }
        }
      }
      setSubscriptionStartDate(moment())
    }
  }, [data, licenseSummary, licenseAssignment, userProfile, ecAdministrators, privilegeGroupList])

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
        intl.$t({ defaultMessage: 'Number should be between 0 and {value}' },
          { value: remainingDevices })
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
      const expirationDate = EntitlementUtil.getServiceEndDate(ecFormData.service_expiration_date)

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
        admin_delegations: delegations,
        privacyFeatures: isAppMonitoringEnabled
          ? [{ featureName: 'ARC', status: arcEnabled ? 'enabled' : 'disabled' }]
          : undefined
      }
      if (autoAssignEcAdmin) {
        customer.isManageAllEcs = autoAssignEcAdmin
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
      if (isDeviceAgnosticEnabled) {
        if (_.isString(ecFormData.apswLicense)) {
          const quantityApsw = parseInt(ecFormData.apswLicense, 10)
          licAssignment.push({
            quantity: quantityApsw,
            action: AssignActionEnum.ADD,
            isTrial: false,
            deviceType: EntitlementDeviceType.MSP_APSW
          })
        }
      }
      if (licAssignment.length > 0) {
        customer.licenses = { assignments: licAssignment }
      }

      if (isRbacPhase2Enabled && privilegeGroups.length > 0) {
        const pgIds = privilegeGroups?.map((pg: PrivilegeGroup)=> pg.id)
        customer.privilege_group_ids = pgIds
      }

      const result =
      await addIntegrator({ params: { tenantId: tenantId },
        payload: isRbacEnabled ? { data: [customer] }: customer,
        enableRbac: isRbacEnabled }).unwrap()
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
      const expirationDate = EntitlementUtil.getServiceEndDate(ecFormData.service_expiration_date)

      const customer: MspEcData = {
        tenant_type: tenantType,
        name: ecFormData.name,
        street_address: ecFormData.address.addressLine as string,
        city: address.city,
        country: address.country,
        service_effective_date: today,
        service_expiration_date: expirationDate,
        privacyFeatures: isAppMonitoringEnabled
          ? [{ featureName: 'ARC', status: arcEnabled ? 'enabled' : 'disabled' }]
          : undefined
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
      if (isDeviceAgnosticEnabled) {
        if (_.isString(ecFormData.apswLicense)) {
          const apswAssignId = getAssignmentId(EntitlementDeviceType.MSP_APSW)
          const quantityApsw = parseInt(ecFormData.apswLicense, 10)
          const actionApsw = apswAssignId === 0 ? AssignActionEnum.ADD : AssignActionEnum.MODIFY
          licAssignment.push({
            quantity: quantityApsw,
            assignmentId: apswAssignId,
            action: actionApsw,
            deviceType: EntitlementDeviceType.MSP_APSW
          })
        }
      }
      if (licAssignment.length > 0) {
        let assignLicense = {
          subscription_start_date: today,
          subscription_end_date: expirationDate,
          assignments: licAssignment
        }
        customer.licenses = assignLicense
      }
      await updateIntegrator({
        params: { mspEcTenantId: mspEcTenantId },
        payload: customer, enableRbac: isRbacEnabled }).unwrap()
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

  const selectedAssignEc = (selected: MspEc[], assignEcAdmin?: boolean) => {
    setSelectedEcs(selected)
    setAssignAdmin(assignEcAdmin ?? false)
  }

  const displayMspAdmins = ( ) => {
    if (!mspAdmins || mspAdmins.length === 0)
      return noDataDisplay
    return <>
      {mspAdmins.map(admin =>
        <UI.AdminList key={admin.id}>
          {admin.email} ({roleDisplayText[admin.role]
            ? intl.$t(roleDisplayText[admin.role]) : admin.role})
        </UI.AdminList>
      )}
    </>
  }

  const displayPrivilegeGroups = () => {
    if (!privilegeGroups || privilegeGroups.length === 0)
      return noDataDisplay
    return <>
      {privilegeGroups.map(pg =>
        <UI.AdminList key={pg.id}>
          {pg.name}
        </UI.AdminList>
      )}
    </>
  }

  const displayAssignedEc = () => {
    if (!selectedEcs || selectedEcs.length === 0)
      return noDataDisplay
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
    return noDataDisplay
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
          label={isAbacToggleEnabled
            ? intl.$t({ defaultMessage: 'Privilege Group' })
            : intl.$t({ defaultMessage: 'Role' })}
        >
          <Paragraph>
            {roleDisplayText[mspEcAdmins[0].role]
              ? intl.$t(roleDisplayText[mspEcAdmins[0].role]) : mspEcAdmins[0].role}
          </Paragraph>
        </Form.Item>
      </>
    }
    return <div style={{ marginTop: '5px', marginBottom: '30px' }}>
      {mspEcAdmins.map(admin =>
        <UI.AdminList>
          {admin.email} {roleDisplayText[admin.role]
            ? intl.$t(roleDisplayText[admin.role]) : admin.role}
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

    const apswLicenses = entitlements.filter(p => p.remainingDevices > 0 &&
      p.deviceType === EntitlementDeviceType.MSP_APSW && p.trial === false)
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
    return (isAbacToggleEnabled && isRbacPhase2Enabled && !isEditMode)
      ? <div>
        <UI.FieldLabelAdmins2 width='275px' style={{ marginTop: '15px' }}>
          <label>{intl.$t({ defaultMessage: 'MSP Delegations' })}</label>
          <Form.Item
            children={<UI.FieldTextLink onClick={() => setDrawerAdminVisible(true)}>
              {intl.$t({ defaultMessage: 'Manage' })}
            </UI.FieldTextLink>
            }
          />
        </UI.FieldLabelAdmins2>
        <UI.FieldLabelDelegations width='260px'
          style={{ marginLeft: '15px', marginTop: '5px', marginBottom: '20px' }}>
          <label>{intl.$t({ defaultMessage: 'Users' })}</label>
          <Form.Item children={<div>{displayMspAdmins()}</div>} />
          <label>{intl.$t({ defaultMessage: 'Privilege Groups' })}</label>
          <Form.Item children={<div>{displayPrivilegeGroups()}</div>} />
        </UI.FieldLabelDelegations>
      </div>
      : <UI.FieldLabelAdmins width='275px' style={{ marginTop: '15px' }}>
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
          { max: 255 },
          { validator: (_, value) => emailRegExp(value) },
          { message: intl.$t({ defaultMessage: 'Please enter a valid email address!' }) }
        ]}
        children={<Input />}
      />
      <Form.Item
        name='admin_firstname'
        label={intl.$t({ defaultMessage: 'First Name' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 64 },
          { validator: (_, value) => whitespaceOnlyRegExp(value) }
        ]}
        children={<Input />}
        style={{ display: 'inline-block', width: '150px' ,paddingRight: '10px' }}
      />
      <Form.Item
        name='admin_lastname'
        label={intl.$t({ defaultMessage: 'Last Name' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 64 },
          { validator: (_, value) => whitespaceOnlyRegExp(value) }
        ]}
        children={<Input />}
        style={{ display: 'inline-block', width: '150px',paddingLeft: '10px' }}
      />
      <Form.Item
        name='admin_role'
        label={isAbacToggleEnabled
          ? intl.$t({ defaultMessage: 'Privilege Group' })
          : intl.$t({ defaultMessage: 'Role' })}
        style={{ width: '300px' }}
        rules={[{ required: true }]}
        initialValue={RolesEnum.PRIME_ADMIN}
        children={
          <Select disabled>
            {
              Object.entries(RolesEnum).map(([label, value]) => (
                <Option
                  key={label}
                  value={value}>
                  {roleDisplayText[value] ? intl.$t(roleDisplayText[value]) : value}
                </Option>
              ))
            }
          </Select>
        }
      />
      </>
    }
  }

  const EnableArcForm = () => {
    return <>
      <div>
        <h4 style={{ display: 'inline-block', marginTop: '10px', marginRight: '25px' }}>
          {intl.$t({ defaultMessage: 'Enable application-recognition and control' })}</h4>
        <Switch defaultChecked={arcEnabled} onChange={setArcEnabled}/></div>
      <UI.SwitchDescription style={{ width: '500px' }}><label>
        {intl.$t({ defaultMessage: 'This setting determines the default behavior for new MSP ' +
          'customers. It specifies whether Application Recognition and Control (ARC) is enabled ' +
          'or disabled by default for the WLAN networks of newly added MSP customers.' })}</label>
      </UI.SwitchDescription>
    </>
  }

  const onSelectChange = (value: string) => {
    if (value === DateSelectionEnum.CUSTOME_DATE) {
      setCustomeDate(true)
    } else {
      let expirationDate = moment().add(30,'days')
      if (value === DateSelectionEnum.THIRTY_DAYS) {
        expirationDate = moment().add(30,'days')
      } else if (value === DateSelectionEnum.SIXTY_DAYS) {
        expirationDate = moment().add(60,'days')
      } else if (value === DateSelectionEnum.NINETY_DAYS) {
        expirationDate = moment().add(90,'days')
      } else if (value === DateSelectionEnum.ONE_YEAR) {
        expirationDate = moment().add(1,'years')
      } else if (value === DateSelectionEnum.THREE_YEARS) {
        expirationDate = moment().add(3,'years')
      } else if (value === DateSelectionEnum.FIVE_YEARS) {
        expirationDate = moment().add(5,'years')
      }
      formRef.current?.setFieldsValue({
        service_expiration_date: expirationDate
      })
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
      <Subtitle level={4}>{intl.$t({ defaultMessage: 'Access Period' })}</Subtitle>
      <Form.Item
        name='type'
        initialValue={true}
        style={{ marginTop: '20px' }}
      >
        <Radio.Group onChange={onChange}>
          <Space direction='vertical'>
            <Radio value={true} disabled={false}>
              { intl.$t({ defaultMessage: 'Not Limited (Integrator)' }) }
            </Radio>
            <UI.FieldLabelAccessPeriod width='275px'>
              <Radio style={{ marginTop: '5px' }} value={false} disabled={false}>
                { intl.$t({ defaultMessage: 'Limited To' }) }
              </Radio>
              <Form.Item
                name='number_of_days'
                initialValue={'7'}
                rules={[
                  { required: !unlimitSelected,
                    message: intl.$t({ defaultMessage: 'Please enter number of days' })
                  },
                  { validator: (_, value) =>
                  {
                    if(parseInt(value, 10) > 60 || parseInt(value, 10) < 1) {
                      return Promise.reject(
                        `${intl.$t({ defaultMessage: 'Value must be between 1 and 60 days' })} `
                      )
                    }
                    return Promise.resolve()
                  }
                  }]}
                children={<Input disabled={unlimitSelected} type='number' min={1} max={60}/>}
                style={{ paddingRight: '20px' }}
              />
              <label>{intl.$t({ defaultMessage: 'Day(s) (Installer)' })}</label>
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
          initialValue={moment().add(30,'days')}
          children={
            <DatePicker
              allowClear={false}
              disabled={!customDate}
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
        <label>{isvSmartEdgeEnabled
          ? intl.$t({ defaultMessage: 'Device Networking' })
          : intl.$t({ defaultMessage: 'Device Subscription' })
        }</label>
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
          {isvSmartEdgeEnabled
            ? intl.$t({ defaultMessage: 'licenses out of {availableApswLicense} available' }, {
              availableApswLicense: availableApswLicense })
            : intl.$t({ defaultMessage: 'devices out of {availableApswLicense} available' }, {
              availableApswLicense: availableApswLicense })
          }
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

        {!isRbacPhase2Enabled && <Form.Item
          label={intl.$t({ defaultMessage: 'MSP Administrators' })}
        >
          <Paragraph>{displayMspAdmins()}</Paragraph>
        </Form.Item>}

        {isRbacPhase2Enabled && <div>
          <Form.Item style={{ height: '20px', margin: '0' }}
            label={intl.$t({ defaultMessage: 'MSP Delegations' })}
          />
          <Form.Item style={{ margin: '0' }}
            label={intl.$t({ defaultMessage: 'Users' })}
          >
            <Paragraph>{displayMspAdmins()}</Paragraph>
          </Form.Item>
          <Form.Item
            label={intl.$t({ defaultMessage: 'Privilege Groups' })}
          >
            <Paragraph>{displayPrivilegeGroups()}</Paragraph>
          </Form.Item></div>}

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
          label={isAbacToggleEnabled
            ? intl.$t({ defaultMessage: 'Privilege Group' })
            : intl.$t({ defaultMessage: 'Role' })}
        >
          {formData?.admin_role &&
          <Paragraph>
            {roleDisplayText[formData.admin_role]
              ? intl.$t(roleDisplayText[formData.admin_role]) : formData.admin_role}
          </Paragraph>}
        </Form.Item>

        {!isDeviceAgnosticEnabled && <div>
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
        </div>}
        {isDeviceAgnosticEnabled && <Form.Item
          label={isvSmartEdgeEnabled ? intl.$t({ defaultMessage: 'Device Networking' })
            : intl.$t({ defaultMessage: 'Device Subscriptions' })}
        >
          <Paragraph>{formData.apswLicense}</Paragraph>
        </Form.Item>}

        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Service Expiration Date' })}
        >
          <Paragraph>
            {formatter(DateFormatEnum.DateFormat)(formData.service_expiration_date)}
          </Paragraph>
        </Form.Item>
        {isAppMonitoringEnabled && <Form.Item
          label={intl.$t({ defaultMessage:
            'Application-recognition and control, application-monitoring' })}
        >
          <Paragraph>{arcEnabled ? 'Enabled' : 'Disabled'}</Paragraph>
        </Form.Item>}
      </>
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
            rules={[
              { required: true },
              { min: 2 },
              { max: 255 },
              { validator: (_, value) => whitespaceOnlyRegExp(value) }
            ]}
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
          {isAppMonitoringEnabled && <div style={{ marginTop: '38px' }}><EnableArcForm /></div>}
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
              rules={[
                { required: true },
                { min: 2 },
                { max: 255 },
                { validator: (_, value) => whitespaceOnlyRegExp(value) }
              ]}
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

          {isAppMonitoringEnabled && <StepsFormLegacy.StepForm name='privacy'
            title={intl.$t({ defaultMessage: 'Privacy' })}>
            <Subtitle level={3}>{intl.$t({ defaultMessage: 'Privacy' })}</Subtitle>
            <EnableArcForm />
          </StepsFormLegacy.StepForm>}

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

      {drawerAdminVisible && (isAbacToggleEnabled
        ? (isRbacPhase2Enabled
          ? <ManageMspDelegationDrawer
            visible={drawerAdminVisible}
            setVisible={setDrawerAdminVisible}
            setSelectedUsers={selectedMspAdmins}
            selectedUsers={mspAdmins}
            setSelectedPrivilegeGroups={setPrivilegeGroups}
            selectedPrivilegeGroups={privilegeGroups}
            tenantIds={mspEcTenantId ? [mspEcTenantId] : undefined}/>
          : <ManageDelegateAdminDrawer
            visible={drawerAdminVisible}
            setVisible={setDrawerAdminVisible}
            setSelected={selectedMspAdmins}
            tenantId={mspEcTenantId}/>)
        : <ManageAdminsDrawer
          visible={drawerAdminVisible}
          setVisible={setDrawerAdminVisible}
          setSelected={selectedMspAdmins}
          tenantId={mspEcTenantId}/>
      )}
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
