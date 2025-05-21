import { useState, useRef, useEffect } from 'react'

import {
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
  DatePicker,
  PageHeader,
  showActionModal,
  showToast,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Subtitle
} from '@acx-ui/components'
import { useIsSplitOn, Features, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                              from '@acx-ui/formatter'
import { SearchOutlined }                                         from '@acx-ui/icons'
import {
  useAddCustomerMutation,
  useMspEcAdminListQuery,
  useUpdateCustomerMutation,
  useGetMspEcQuery,
  useGetMspEcDelegatedAdminsQuery,
  useGetMspEcSupportQuery,
  useEnableMspEcSupportMutation,
  useDisableMspEcSupportMutation,
  useMspAdminListQuery,
  useMspCustomerListQuery,
  usePatchCustomerMutation,
  useMspRbacEcAssignmentHistoryQuery
} from '@acx-ui/msp/services'
import {
  dateDisplayText,
  DateSelectionEnum,
  MspAdministrator,
  MspEc,
  MspEcData,
  MspAssignmentHistory,
  MspEcDelegatedAdmins,
  MspIntegratorDelegated,
  AssignActionEnum,
  MspEcTierEnum,
  MspEcTierPayload
} from '@acx-ui/msp/utils'
import { GoogleMapWithPreference, usePlacesAutocomplete }                                                                   from '@acx-ui/rc/components'
import { useGetPrivacySettingsQuery, useGetPrivilegeGroupsQuery, useGetTenantDetailsQuery, useRbacEntitlementSummaryQuery } from '@acx-ui/rc/services'
import {
  Address,
  emailRegExp,
  roleDisplayText,
  EntitlementUtil,
  useTableQuery,
  EntitlementDeviceType,
  whitespaceOnlyRegExp,
  PrivilegeGroup,
  PrivacyFeatureName,
  EntitlementSummaries
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { RolesEnum }                                                       from '@acx-ui/types'
import { useUserProfileContext }                                           from '@acx-ui/user'
import { AccountType, AccountVertical, getJwtTokenPayload, noDataDisplay } from '@acx-ui/utils'

import { ManageAdminsDrawer }        from '../ManageAdminsDrawer'
import { ManageDelegateAdminDrawer } from '../ManageDelegateAdminDrawer'
// eslint-disable-next-line import/order
import { ManageMspDelegationDrawer } from '../ManageMspDelegations'
import { SelectIntegratorDrawer }    from '../SelectIntegratorDrawer'
import { StartSubscriptionModal }    from '../StartSubscriptionModal'
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
    apswLicense: number,
    apswTrialLicense: number,
    tier: MspEcTierEnum,
    subscriptionMode: string,
    solutionTokenLicense: number,
    solutionTokenTrialLicense: number
}

enum ServiceType {
  TRIAL = 'TRIAL',
  EXTENDED_TRIAL = 'EXTENDED_TRIAL',
  PAID = 'PAID'
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

export function NewManageCustomer () {
  const intl = useIntl()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const optionalAdminFF = useIsSplitOn(Features.MSPEC_OPTIONAL_ADMIN)
  const createEcWithTierEnabled = useIsSplitOn(Features.MSP_EC_CREATE_WITH_TIER)
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const isPatchTierEnabled = useIsSplitOn(Features.MSP_PATCH_TIER)
  const isEntitlementRbacApiEnabled = useIsSplitOn(Features.ENTITLEMENT_RBAC_API)
  const isRbacEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const isExtendedTrialToggleEnabled = useIsSplitOn(Features.ENTITLEMENT_EXTENDED_TRIAL_TOGGLE)
  const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
  const isRbacPhase2Enabled = useIsSplitOn(Features.RBAC_PHASE2_TOGGLE)
  const isAppMonitoringEnabled = useIsSplitOn(Features.MSP_APP_MONITORING)
  const isViewmodleAPIsMigrateEnabled = useIsSplitOn(Features.VIEWMODEL_APIS_MIGRATE_MSP_TOGGLE)

  const navigate = useNavigate()
  const linkToCustomers = useTenantLink('/dashboard/mspcustomers', 'v')
  const formRef = useRef<StepsFormLegacyInstance<EcFormData>>()
  const { action, status, tenantId, mspEcTenantId } = useParams()

  const [isTrialMode, setTrialMode] = useState(false)
  const [isTrialActive, setTrialActive] = useState(false)
  const [serviceTypeSelected, setServiceType] = useState(ServiceType.PAID)
  const [trialSelected, setTrialSelected] = useState(true)
  const [ecSupportEnabled, setEcSupport] = useState(false)
  const [arcEnabled, setArcEnabled] = useState(false)
  const [mspAdmins, setAdministrator] = useState([] as MspAdministrator[])
  const [privilegeGroups, setPrivilegeGroups] = useState([] as PrivilegeGroup[])
  const [mspIntegrator, setIntegrator] = useState([] as MspEc[])
  const [mspInstaller, setInstaller] = useState([] as MspEc[])
  const [mspEcAdmins, setMspEcAdmins] = useState([] as MspAdministrator[])
  const [availableApswLicense, setAvailableApswLicense] = useState(0)
  const [availableApswTrialLicense, setAvailableApswTrialLicense] = useState(0)
  const [availableSolutionTokenLicense, setAvailableSolutionTokenLicense] = useState(0)
  const [availableSolutionTokenTrialLicense, setAvailableSolutionTokenTrialLicense] = useState(0)
  const [assignedLicense, setAssignedLicense] = useState([] as MspAssignmentHistory[])
  const [assignedApswTrialLicense, setApswTrialLicense] = useState(0)
  const [assignedSolutionTokenTrialLicense, setSolutionTokenTrialLicense] = useState(0)
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
  const [originalTier, setOriginalTier] = useState('')
  const [addCustomer] = useAddCustomerMutation()
  const [updateCustomer] = useUpdateCustomerMutation()
  const [patchCustomer] = usePatchCustomerMutation()
  const params = useParams()

  const { Option } = Select
  const { Paragraph } = Typography
  const isEditMode = action === 'edit'
  const isTrialEditMode = action === 'edit' && status === 'Trial'
  const isExtendedTrialEditMode = action === 'edit' && status === 'ExtendedTrial'
  const { acx_account_vertical } = getJwtTokenPayload()

  const isHospitality = acx_account_vertical === AccountVertical.HOSPITALITY
  const isMDU = acx_account_vertical === AccountVertical.MDU

  const entitlementSummaryPayload = {
    filters: {
      licenseType: ['APSW', 'SLTN_TOKEN'],
      usageType: 'ASSIGNED'
    }
  }

  const { data: userProfile } = useUserProfileContext()
  const { data: tenantDetailsData } = useGetTenantDetailsQuery({ params })
  const { data: licenseSummaryResults } = useRbacEntitlementSummaryQuery(
    { params: useParams(), payload: entitlementSummaryPayload })
  const { data: rbacAssignment } = useTableQuery({
    useQuery: useMspRbacEcAssignmentHistoryQuery,
    apiParams: { tenantId: mspEcTenantId as string },
    defaultPayload: {},
    pagination: {
      pageSize: 10000
    },
    option: {
      skip: !isEntitlementRbacApiEnabled || action !== 'edit'
    }
  })
  const licenseAssignment = rbacAssignment?.data
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
  const { data: ecSupport } =
      useGetMspEcSupportQuery({
        params: { mspEcTenantId }, enableRbac: isRbacEnabled }, { skip: action !== 'edit' })
  const { data: techPartners } = useTableQuery({
    useQuery: useMspCustomerListQuery,
    pagination: {
      pageSize: 10000
    },
    defaultPayload: {
      filters: { tenantType: [AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER] },
      fields: [
        'id',
        'name',
        'tenantType'
      ],
      sortField: 'name',
      sortOrder: 'ASC'
    },
    option: { skip: action !== 'edit' },
    enableRbac: isViewmodleAPIsMigrateEnabled
  })
  const adminRoles = [RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]
  const isSystemAdmin = userProfile?.roles?.some(role => adminRoles.includes(role as RolesEnum))
  const { data: privilegeGroupList } = useGetPrivilegeGroupsQuery({ params },
    { skip: !isRbacPhase2Enabled || isEditMode || isSystemAdmin })

  const showExtendedTrial = tenantDetailsData?.extendedTrial && isExtendedTrialToggleEnabled
  const [
    enableMspEcSupport
  ] = useEnableMspEcSupportMutation()

  const [
    disableMspEcSupport
  ] = useDisableMspEcSupportMutation()

  const { data: privacySettingsData } =
   useGetPrivacySettingsQuery({ params }, { skip: isEditMode || !isAppMonitoringEnabled })

  useEffect(() => {
    if (privacySettingsData) {
      const privacyMonitoringSetting =
         privacySettingsData.filter(item => item.featureName === PrivacyFeatureName.ARC)[0]
      setArcEnabled(privacyMonitoringSetting.isEnabled)
    }
  }, [privacySettingsData])

  useEffect(() => {
    if (ecSupport && ecSupport.length > 0 ) {
      setEcSupport(true)
    }
  }, [ecSupport])

  useEffect(() => {
    if (licenseSummaryResults) {
      checkAvailableLicense(licenseSummaryResults)

      if (isEditMode && data && licenseAssignment) {
        if (ecAdministrators) {
          setMspEcAdmins(ecAdministrators)
        }

        setAssignedLicense(licenseAssignment)
        const apsw = licenseAssignment.filter(en => en.status === 'VALID' && en.isTrial === false
            && en.licenseType === EntitlementDeviceType.APSW
        )
        const apswLic = apsw.length > 0 ? apsw.reduce((acc, cur) => cur.quantity + acc, 0) : 0
        const apswTrial = licenseAssignment.filter(en => en.status === 'VALID'
            && en.isTrial === true
            && en.licenseType === EntitlementDeviceType.APSW
        )
        const apswTrialLic = apswTrial.length > 0 ?
          apswTrial.reduce((acc, cur) => cur.quantity + acc, 0) : 0

        const solutionToken = licenseAssignment.filter(en => en.status === 'VALID'
          && en.isTrial === false
              && en.licenseType === EntitlementDeviceType.SLTN_TOKEN
        )

        const solutionTokenLic = solutionToken.length > 0
          ? solutionToken.reduce((acc, cur) => cur.quantity + acc, 0) : 0
        const solutionTokenTrial = licenseAssignment.filter(en => en.status === 'VALID'
            && en.isTrial === true
              && en.licenseType === EntitlementDeviceType.SLTN_TOKEN
        )
        const solutionTokenTrialLic = solutionTokenTrial.length > 0 ?
          solutionTokenTrial.reduce((acc, cur) => cur.quantity + acc, 0) : 0
        isTrialEditMode ? checkAvailableLicense(licenseSummaryResults)
          : checkAvailableLicense(licenseSummaryResults, apswLic,
            apswTrialLic, solutionTokenLic, solutionTokenTrialLic)

        setSolutionTokenTrialLicense(solutionTokenTrialLic)
        formRef.current?.setFieldValue('solutionTokenTrialLicense', solutionTokenTrialLic)

        formRef.current?.setFieldsValue({
          name: data?.name,
          service_effective_date: moment(data?.service_effective_date),
          apswLicense: apswLic,
          apswTrialLicense: apswTrialLic,
          solutionTokenLicense: solutionTokenLic,
          solutionTokenTrialLicense: solutionTokenTrialLic,
          service_expiration_date: moment(data?.service_expiration_date),
          tier: setServiceTier(data?.tier as MspEcTierEnum) ?? MspEcTierEnum.Professional,
          subscriptionMode: isExtendedTrialEditMode ? ServiceType.EXTENDED_TRIAL
            : ServiceType.PAID
        })
        setOriginalTier(data?.tier ?? '')
        formRef.current?.setFieldValue(['address', 'addressLine'], data?.street_address)
        data?.is_active === 'true' ? setTrialActive(true) : setTrialActive(false)
        status === 'Trial' ? setTrialMode(true) : setTrialMode(false)

        setSubscriptionStartDate(moment(data?.service_effective_date))
        setSubscriptionEndDate(moment(data?.service_expiration_date))
        setSubscriptionOrigEndDate(moment(data?.service_expiration_date))

        setApswTrialLicense(apswTrialLic)

        setServiceType(isExtendedTrialEditMode ? ServiceType.EXTENDED_TRIAL : ServiceType.PAID)
        if (isAppMonitoringEnabled) {
          setArcEnabled(data.privacyFeatures?.find(f =>
            f.featureName === 'ARC')?.isEnabled ? true : false)
        }
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
      setSubscriptionEndDate(moment().add(30,'days'))
    }
  }, [data, licenseSummaryResults,
    licenseAssignment, userProfile, ecAdministrators, privilegeGroupList])

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

  const setServiceTier = (serviceTier: MspEcTierEnum) => {
    return isMDU ? MspEcTierEnum.Core
      : (isHospitality ? MspEcTierEnum.Professional : serviceTier)
  }

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

  const ecSupportOnChange = (checked: boolean) => {
    if (checked) {
      enableMspEcSupport({ params: { mspEcTenantId: mspEcTenantId }, enableRbac: isRbacEnabled })
        .then(() => {
          showToast({
            type: 'success',
            content: intl.$t({ defaultMessage: 'EC support enabled' })
          })
          setEcSupport(true)
        })
    } else {
      disableMspEcSupport({ params: { mspEcTenantId: mspEcTenantId }, enableRbac: isRbacEnabled })
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

  function createLicenseObject (ecFormData: EcFormData, deviceType: EntitlementDeviceType) {

    let quantity
    let quantityTrial
    if (deviceType === EntitlementDeviceType.MSP_APSW) {
      quantity = _.isString(ecFormData.apswLicense)
        ? parseInt(ecFormData.apswLicense, 10) : ecFormData.apswLicense
      quantityTrial = _.isString(ecFormData.apswTrialLicense)
        ? parseInt(ecFormData.apswTrialLicense, 10) : ecFormData.apswTrialLicense
    } else if (deviceType === EntitlementDeviceType.MSP_SLTN_TOKEN) {
      quantity = _.isString(ecFormData.solutionTokenLicense)
        ? parseInt(ecFormData.solutionTokenLicense, 10) : ecFormData.solutionTokenLicense
      quantityTrial = _.isString(ecFormData.solutionTokenTrialLicense)
        ? parseInt(ecFormData.solutionTokenTrialLicense, 10)
        : ecFormData.solutionTokenTrialLicense
    }

    return {
      quantity: serviceTypeSelected === ServiceType.EXTENDED_TRIAL
        ? quantityTrial as number : quantity as number,
      action: AssignActionEnum.ADD,
      isTrial: serviceTypeSelected === ServiceType.EXTENDED_TRIAL,
      deviceType
    }
  }

  function editLicenseObject (ecFormData: EcFormData, deviceType: EntitlementDeviceType) {
    // deviceType passed here shoudl be appended with 'MSP' to support in current customer add / Edit

    const expirationDate = EntitlementUtil.getServiceEndDate(ecFormData.service_expiration_date)
    const expirationDateOrig = EntitlementUtil.getServiceEndDate(subscriptionOrigEndDate)
    const needUpdateLicense = expirationDate !== expirationDateOrig

    const isTrial = serviceTypeSelected !== ServiceType.PAID

    const assignId = deviceType === EntitlementDeviceType.MSP_APSW
      ? getDeviceAssignmentId(EntitlementDeviceType.APSW, isTrial)
      : getDeviceAssignmentId(EntitlementDeviceType.SLTN_TOKEN, isTrial)

    const paidValue = deviceType === EntitlementDeviceType.MSP_APSW
      ? ecFormData.apswLicense
      : ecFormData.solutionTokenLicense

    const trialValue = deviceType === EntitlementDeviceType.MSP_APSW
      ? ecFormData.apswTrialLicense
      : ecFormData.solutionTokenTrialLicense

    const quantityValue = isTrial ? trialValue : paidValue

    if (_.isString(quantityValue) || needUpdateLicense) {
      const quantity = _.isString(quantityValue)
        ? parseInt(quantityValue, 10) : quantityValue

      const action = (assignId === 0) ? AssignActionEnum.ADD : AssignActionEnum.MODIFY

      const _obj = {
        quantity,
        assignmentId: assignId,
        action,
        deviceType
      }

      const obj = isTrial ? { ..._obj, isTrial: action === AssignActionEnum.ADD ? true : undefined }
        : _obj

      return obj
    } else {
      return null
    }

  }

  const handleAddCustomer = async (values: EcFormData) => {
    try {
      const ecFormData = { ...values }
      const today = EntitlementUtil.getServiceStartDate()
      const expirationDate =
        EntitlementUtil.getServiceEndDate(ecFormData.service_expiration_date ?? subscriptionEndDate)
      const assignLicense = trialSelected
        ? { trialAction: AssignActionEnum.ACTIVATE }
        : { assignments: [createLicenseObject(ecFormData, EntitlementDeviceType.MSP_APSW),
          createLicenseObject(ecFormData, EntitlementDeviceType.MSP_SLTN_TOKEN)
        ] }

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
        licenses: assignLicense,
        tier: createEcWithTierEnabled ? ecFormData.tier : undefined,
        privacyFeatures: isAppMonitoringEnabled
          ? [{ featureName: 'ARC', status: arcEnabled ? 'enabled' : 'disabled' }]
          : undefined
      }
      if (ecFormData.admin_email) {
        customer.admin_email = ecFormData.admin_email
        customer.admin_firstname = ecFormData.admin_firstname
        customer.admin_lastname = ecFormData.admin_lastname
        customer.admin_role = ecFormData.admin_role
      }
      const ecDelegations=[] as MspIntegratorDelegated[]
      mspIntegrator.forEach((integrator: MspEc) => {
        ecDelegations.push({
          delegation_type: AccountType.MSP_INTEGRATOR,
          delegation_id: integrator.id
        })
      })
      mspInstaller.forEach((installer: MspEc) => {
        ecDelegations.push({
          delegation_type: AccountType.MSP_INSTALLER,
          delegation_id: installer.id
        })
      })
      if (ecDelegations.length > 0) {
        customer.delegations = ecDelegations
      }
      if (isRbacPhase2Enabled && privilegeGroups.length > 0) {
        const pgIds = privilegeGroups?.map((pg: PrivilegeGroup)=> pg.id)
        customer.privilege_group_ids = pgIds
      }

      const result =
      await addCustomer({ params: { tenantId: tenantId },
        payload: isRbacEnabled ? { data: [customer] } : customer,
        enableRbac: isRbacEnabled }).unwrap()
      if (result) {
      // const ecTenantId = result.tenant_id
      }
      navigate(linkToCustomers, { replace: true })
      return true
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      return false
    }
  }

  const handleEditCustomer = async (values: EcFormData) => {
    try {
      const ecFormData = { ...values }
      const today = EntitlementUtil.getServiceStartDate()
      const expirationDate = EntitlementUtil.getServiceEndDate(ecFormData.service_expiration_date)

      const licAssignment = []
      if (isTrialEditMode) {
        licAssignment.push(createLicenseObject(ecFormData, EntitlementDeviceType.MSP_APSW))
        licAssignment.push(createLicenseObject(ecFormData, EntitlementDeviceType.MSP_SLTN_TOKEN))
      } else {
        const apswObj = editLicenseObject(ecFormData, EntitlementDeviceType.MSP_APSW)
        const sltnObj = editLicenseObject(ecFormData, EntitlementDeviceType.MSP_SLTN_TOKEN)

        if (apswObj)
          licAssignment.push(apswObj)

        if(sltnObj)
          licAssignment.push(sltnObj)
      }

      const customer: MspEcData = {
        tenant_type: AccountType.MSP_EC,
        name: ecFormData.name,
        street_address: ecFormData.address.addressLine as string,
        city: address.city,
        country: address.country,
        service_effective_date: today,
        service_expiration_date: expirationDate,
        tier: (createEcWithTierEnabled && !isPatchTierEnabled) ? ecFormData.tier : undefined,
        privacyFeatures: isAppMonitoringEnabled
          ? [{ featureName: 'ARC', status: arcEnabled ? 'enabled' : 'disabled' }]
          : undefined
      }
      if (!isTrialMode && licAssignment.length > 0) {
        let assignLicense = {
          subscription_start_date: today,
          subscription_end_date: expirationDate,
          assignments: licAssignment
        }
        customer.licenses = assignLicense
      }
      await updateCustomer({
        params: { mspEcTenantId: mspEcTenantId }, payload: customer,
        enableRbac: isRbacEnabled }).unwrap()

      if (isPatchTierEnabled && originalTier !== ecFormData.tier) {
        const patchTier: MspEcTierPayload = {
          type: 'serviceTierStatus',
          serviceTierStatus: ecFormData.tier
        }
        await patchCustomer({ params: { tenantId: mspEcTenantId }, payload: patchTier }).unwrap()
      }
      navigate(linkToCustomers, { replace: true })
      return true
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      return false
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

  const displayIntegrator = () => {
    if (!mspIntegrator || mspIntegrator.length === 0)
      return noDataDisplay
    return <>
      {mspIntegrator.map(integrator =>
        <UI.AdminList key={integrator.id}>
          {integrator.name}
        </UI.AdminList>
      )}
    </>
  }

  const displayInstaller = () => {
    if (!mspInstaller || mspInstaller.length === 0)
      return noDataDisplay
    return <>
      {mspInstaller.map(installer =>
        <UI.AdminList key={installer.id}>
          {installer.name}
        </UI.AdminList>
      )}
    </>
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

  const startSubscription = (startDate: Date) => {
    if (startDate) {
      setSubscriptionStartDate(moment(startDate))
      setTrialMode(false)
      formRef.current?.setFieldsValue({
        apswTrialLicense: 0,
        solutionTokenTrialLicense: 0
      })
    }
  }

  const checkAvailableLicense =
  (entitlements: EntitlementSummaries[], apswLic?: number,
    apswTrialLic?: number, solutionTokenLic?: number,
    solutionTokenTrialLic?: number ) => {

    const apswLicenses = entitlements.filter(p => p.remainingQuantity > 0 &&
      p.licenseType === EntitlementDeviceType.APSW && p.isTrial === false)
    let remainingApsw = 0
    apswLicenses.forEach( (lic: EntitlementSummaries) => {
      remainingApsw += lic.remainingQuantity
    })
    const apswTrialLicenses = entitlements.filter(p => p.remainingQuantity > 0 &&
      p.licenseType === EntitlementDeviceType.APSW && p.isTrial === true)
    let remainingApswTrial = 0
    apswTrialLicenses.forEach( (lic: EntitlementSummaries) => {
      remainingApswTrial += lic.remainingQuantity
    })

    apswLic ? setAvailableApswLicense(remainingApsw+apswLic)
      : setAvailableApswLicense(remainingApsw)
    apswTrialLic ? setAvailableApswTrialLicense(remainingApswTrial+apswTrialLic)
      : setAvailableApswTrialLicense(remainingApswTrial)


    const solutionTokenLicenses = entitlements.filter(p => p.remainingQuantity > 0 &&
          p.licenseType === EntitlementDeviceType.SLTN_TOKEN && p.isTrial === false)
    let remainingSolutionTokens = 0
    solutionTokenLicenses.forEach( (lic: EntitlementSummaries) => {
      remainingSolutionTokens += lic.remainingQuantity
    })
    const solutionTokenTrialLicenses = entitlements.filter(p => p.remainingQuantity > 0 &&
          p.licenseType === EntitlementDeviceType.SLTN_TOKEN && p.isTrial === true)
    let remainingSolutionTokenTrial = 0
    solutionTokenTrialLicenses.forEach( (lic: EntitlementSummaries) => {
      remainingSolutionTokenTrial += lic.remainingQuantity
    })

    solutionTokenLic ? setAvailableSolutionTokenLicense(remainingSolutionTokens+solutionTokenLic)
      : setAvailableSolutionTokenLicense(remainingSolutionTokens)
    solutionTokenTrialLic
      ? setAvailableSolutionTokenTrialLicense(remainingSolutionTokenTrial+solutionTokenTrialLic)
      : setAvailableSolutionTokenTrialLicense(remainingSolutionTokenTrial)
  }

  const getDeviceAssignmentId = (deviceType: string, isTrial: boolean) => {
    const license = isEntitlementRbacApiEnabled
      ? assignedLicense.filter(en => en.licenseType === deviceType && en.status === 'VALID' &&
        en.isTrial === isTrial)
      : assignedLicense.filter(en => en.deviceType === deviceType && en.status === 'VALID' &&
        en.trialAssignment === isTrial && en.ownAssignment === false)
    return license.length > 0 ? license[0].id : 0

  }

  const MspAdminsForm = () => {
    return <>
      {(isAbacToggleEnabled && isRbacPhase2Enabled && !isEditMode)
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
          <UI.FieldLabelDelegations width='260px' style={{ marginLeft: '15px', marginTop: '5px' }}>
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
        </UI.FieldLabelAdmins>}

      <UI.FieldLabelAdmins width='275px'>
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

  const handleServiceTierChange = function (tier: RadioChangeEvent) {
    if(isEditMode && createEcWithTierEnabled && originalTier !== tier.target.value) {
      const modalContent = (
        <>
          <p>{intl.$t({ defaultMessage: `Changing Service Tier will impact available features. 
          Downgrade from Professional to Essentials may also result in data loss.` })}</p>
          <p>{intl.$t({ defaultMessage: 'Are you sure you want to save the changes?' })}</p>
        </>
      )
      showActionModal({
        type: 'confirm',
        title: intl.$t({
          defaultMessage: 'Save'
        }),
        content: modalContent,
        okText: intl.$t({ defaultMessage: 'Save' }),
        onCancel: () => {
          if (tier.target.value === MspEcTierEnum.Essentials) {
            formRef.current?.setFieldValue('tier', MspEcTierEnum.Professional)
          } else {
            formRef.current?.setFieldValue('tier', MspEcTierEnum.Essentials)
          }
        }
      })
    }
  }

  const EcTierForm = () => {
    return <Form.Item
      name='tier'
      label={intl.$t({ defaultMessage: 'Service Tier' })}
      style={{ width: '300px' }}
      rules={[{ required: true }]}
      initialValue={isMDU ? MspEcTierEnum.Core
        : (isHospitality ? MspEcTierEnum.Professional : undefined)}
      children={
        <Radio.Group>
          <Space direction='vertical'>
            {
              Object.entries(MspEcTierEnum).map(([label, value]) => {
                // isMDU : show only Core
                // isHospitality: show only Professional
                // everything else: show both Professional and Essentials
                return (
                  (isMDU && value === MspEcTierEnum.Core) ||
                  (isHospitality && value === MspEcTierEnum.Professional) ||
                  ((!isMDU && value !== MspEcTierEnum.Core) &&
                  (!isMDU && !isHospitality &&
                  (value === MspEcTierEnum.Essentials || value === MspEcTierEnum.Professional)))
                ) &&
                <Radio
                  onChange={handleServiceTierChange}
                  key={value}
                  value={value}
                  children={intl.$t({
                    defaultMessage: '{label}' }, { label })} />
              })
            }
          </Space>
        </Radio.Group>
      }
    />
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
            <Select>
              {
                Object.entries(RolesEnum).map(([label, value]) => (
                  !(value === RolesEnum.DPSK_ADMIN || value === RolesEnum.GUEST_MANAGER ||
                    value === RolesEnum.TEMPLATES_ADMIN || value === RolesEnum.REPORTS_ADMIN
                  )
                  && <Option
                    key={label}
                    value={value}>
                    {roleDisplayText[value] ? intl.$t(roleDisplayText[value]) : value}
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
            { validator: (_, value) =>
              fieldValidator(value,
                serviceTypeSelected === ServiceType.EXTENDED_TRIAL || isExtendedTrialEditMode
                  ? availableApswTrialLicense : availableApswLicense) }
          ]}
          children={<Input type='number'/>}
          style={{ paddingRight: '20px' }}
        />
        <label>
          {isvSmartEdgeEnabled
            ? (serviceTypeSelected === ServiceType.EXTENDED_TRIAL || isExtendedTrialEditMode
              ? intl.$t({ defaultMessage: 'licenses out of {availableLicense} available' }, {
                availableLicense: availableApswTrialLicense })
              : intl.$t({ defaultMessage: 'licenses out of {availableApswLicense} available' }, {
                availableApswLicense: availableApswLicense }))
            : intl.$t({ defaultMessage: 'devices out of {availableApswLicense} available' }, {
              availableApswLicense: availableApswLicense })
          }
          {assignedApswTrialLicense > 0 &&
          <span style={{ marginLeft: 10 }}>
            {intl.$t({ defaultMessage: '(active trial license : {apswTrial})' },
              { apswTrial: assignedApswTrialLicense })}
          </span>}
        </label>
      </UI.FieldLabelSubs>
    </div>
  }

  const ApswSubscriptionExtendedTrial = () => {
    return <div >
      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'Device Networking' })}</label>
        {serviceTypeSelected === ServiceType.PAID
          ? <Form.Item
            name='apswLicense'
            label=''
            initialValue={0}
            rules={[
              { required: true },
              { validator: (_, value) =>
                fieldValidator(value, availableApswLicense) }
            ]}
            children={<Input type='number'/>}
            style={{ paddingRight: '20px' }}
          />
          : <Form.Item
            name='apswTrialLicense'
            label=''
            initialValue={0}
            rules={[
              { required: true },
              { validator: (_, value) =>
                fieldValidator(value, availableApswTrialLicense) }
            ]}
            children={<Input type='number'/>}
            style={{ paddingRight: '20px' }}
          />}
        <label>
          {(serviceTypeSelected === ServiceType.EXTENDED_TRIAL
            ? intl.$t({ defaultMessage: 'licenses out of {availableLicense} available' }, {
              availableLicense: availableApswTrialLicense })
            : intl.$t({ defaultMessage: 'licenses out of {availableApswLicense} available' }, {
              availableApswLicense: availableApswLicense }))
          }
        </label>
      </UI.FieldLabelSubs>
    </div>
  }

  const SolutionTokenSubscription = () => {
    return <div >
      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'Solution Token' })
        }</label>
        <Form.Item
          name='solutionTokenLicense'
          label=''
          initialValue={0}
          rules={[
            { required: true },
            { validator: (_, value) =>
              fieldValidator(value,
                serviceTypeSelected === ServiceType.EXTENDED_TRIAL || isExtendedTrialEditMode
                  ? availableSolutionTokenTrialLicense : availableSolutionTokenLicense) }
          ]}
          children={<Input type='number'/>}
          style={{ paddingRight: '20px' }}
        />
        <label>
          {serviceTypeSelected === ServiceType.EXTENDED_TRIAL || isExtendedTrialEditMode
            ? intl.$t({ defaultMessage: 'licenses out of {availableLicense} available' }, {
              availableLicense: availableSolutionTokenTrialLicense })
            : intl.$t({ defaultMessage:
                'licenses out of {availableSolutionTokenLicense} available' },
            { availableSolutionTokenLicense })
          }
          {assignedSolutionTokenTrialLicense > 0 &&
          <span style={{ marginLeft: 10 }}>
            {intl.$t({ defaultMessage:
            '(active trial license : {assignedSolutionTokenTrialLicense})' },
            { assignedSolutionTokenTrialLicense })}
          </span>}
        </label>
      </UI.FieldLabelSubs>
    </div>
  }

  const SolutionTokenSubscriptionExtendedTrial = () => {
    return <div >
      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'Solution Tokens' })}</label>
        {serviceTypeSelected === ServiceType.PAID
          ? <Form.Item
            name='solutionTokenLicense'
            label=''
            initialValue={0}
            rules={[
              { required: true },
              { validator: (_, value) =>
                fieldValidator(value, availableSolutionTokenLicense) }
            ]}
            children={<Input type='number'/>}
            style={{ paddingRight: '20px' }}
          />
          : <Form.Item
            name='solutionTokenTrialLicense'
            label=''
            initialValue={0}
            rules={[
              { required: true },
              { validator: (_, value) =>
                fieldValidator(value, availableSolutionTokenTrialLicense) }
            ]}
            children={<Input type='number'/>}
            style={{ paddingRight: '20px' }}
          />}
        <label>
          {(serviceTypeSelected === ServiceType.EXTENDED_TRIAL
            ? intl.$t({ defaultMessage: 'licenses out of {availableLicense} available' }, {
              availableLicense: availableSolutionTokenTrialLicense })
            : intl.$t({ defaultMessage:
              'licenses out of {availableSolutionTokenLicense} available' },
            { availableSolutionTokenLicense }))
          }
        </label>
      </UI.FieldLabelSubs>
    </div>
  }

  const EnableSupportForm = () => {
    return <>
      <div>
        <h4 style={{ display: 'inline-block', marginTop: '38px', marginRight: '25px' }}>
          {intl.$t({ defaultMessage: 'Enable access to Ruckus Support' })}</h4>
        <Switch defaultChecked={ecSupportEnabled} onChange={ecSupportOnChange}/></div>
      <UI.SwitchDescription><label>
        {intl.$t({ defaultMessage: 'If checked, Ruckus Support team is granted a temporary' +
  ' administrator-level access for 21 days.' })}</label>
      </UI.SwitchDescription>
      <UI.SwitchDescription>
        <label>
          {intl.$t({ defaultMessage: 'Enable when requested by Ruckus Support team.' })}</label>
      </UI.SwitchDescription>
    </>
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
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{isvSmartEdgeEnabled
            ? intl.$t({ defaultMessage: 'Device Networking' })
            : intl.$t({ defaultMessage: 'Device Subscription' })
          }</label>
          <label>{assignedApswTrialLicense}</label>
        </UI.FieldLabel2>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{ intl.$t({ defaultMessage: 'Solution Token' })
          }</label>
          <label>{assignedSolutionTokenTrialLicense}</label>
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

        <ApswSubscription />
        <SolutionTokenSubscription />

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
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please select expiration date' })
              }
            ]}
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
        </UI.FieldLabeServiceDate>
      </div>}
    </>
  }

  const EditCustomerSubscriptionFormExtendedTrial = () => {
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
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: 'Device Networking' })}</label>
          <label>{assignedApswTrialLicense}</label>
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
        {(isTrialEditMode || isExtendedTrialEditMode || (isEditMode && showExtendedTrial) ) &&
        <Form.Item
          name='subscriptionMode'
          initialValue={serviceTypeSelected === ServiceType.EXTENDED_TRIAL
            ? ServiceType.EXTENDED_TRIAL : ServiceType.PAID}
        >
          <Radio.Group onChange={(e: RadioChangeEvent) => {
            setServiceType(e.target.value)
          }}>
            <Space direction='vertical'>
              <Radio
                style={{ marginTop: '2px' }}
                value={ServiceType.EXTENDED_TRIAL}
                disabled={false}>
                { intl.$t({ defaultMessage: 'Extended Trial Mode' }) }
              </Radio>
              <Radio
                style={{ marginTop: '2px' }}
                value={ServiceType.PAID}
                disabled={false}>
                { intl.$t({ defaultMessage: 'Paid Subscription' }) }
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>}

        <Subtitle level={3}>
          { serviceTypeSelected === ServiceType.EXTENDED_TRIAL
            ? intl.$t({ defaultMessage: 'Extended Trial Mode' })
            : intl.$t({ defaultMessage: 'Paid Subscriptions' }) }</Subtitle>
        <ApswSubscriptionExtendedTrial />
        <SolutionTokenSubscriptionExtendedTrial />
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
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please select expiration date' })
              }
            ]}
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
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{isvSmartEdgeEnabled
            ? intl.$t({ defaultMessage: 'Device Networking' })
            : intl.$t({ defaultMessage: 'Device Subscription' })
          }</label>
          <label>{isvSmartEdgeEnabled
            ? intl.$t({ defaultMessage: '50 trial licenses' })
            : intl.$t({ defaultMessage: '50 devices' })
          }</label>
        </UI.FieldLabel2>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: 'Solution Token' })}</label>
          <label>{intl.$t({ defaultMessage: '50 trial licenses' })}</label>
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

      {!trialSelected && <div>
        <Subtitle level={4}>
          { intl.$t({ defaultMessage: 'Paid Subscriptions' }) }</Subtitle>
        <ApswSubscription />
        <SolutionTokenSubscription />
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
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please select expiration date' })
              }
            ]}
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
        </UI.FieldLabeServiceDate></div>}
    </>
  }

  const CustomerSubscriptionExtendedTrial = () => {
    return <>
      <Subtitle level={3}>{intl.$t({ defaultMessage: 'Start service in' })}</Subtitle>
      <Form.Item
        name='trialMode'
        initialValue={ServiceType.TRIAL}
      >
        <Radio.Group onChange={(e: RadioChangeEvent) => {
          if (e.target.value === ServiceType.TRIAL) {
            setSubscriptionStartDate(moment())
            setSubscriptionEndDate(moment().add(30,'days'))
          }
          setTrialSelected(e.target.value === ServiceType.TRIAL)
          setServiceType(e.target.value)
        }}>
          <Space direction='vertical'>
            <Radio
              value={ServiceType.TRIAL}
              disabled={false}>
              { intl.$t({ defaultMessage: 'Trial Mode' }) }
            </Radio>
            <Radio
              style={{ marginTop: '2px' }}
              value={ServiceType.EXTENDED_TRIAL}
              disabled={false}>
              { intl.$t({ defaultMessage: 'Extended Trial Mode' }) }
            </Radio>
            <Radio
              style={{ marginTop: '2px', marginBottom: '50px' }}
              value={ServiceType.PAID}
              disabled={false}>
              { intl.$t({ defaultMessage: 'Paid Subscription' }) }
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      {trialSelected && <div>
        <Subtitle level={4}>
          { intl.$t({ defaultMessage: 'Trial Mode' }) }</Subtitle>
        <UI.FieldLabel2 width='275px' style={{ marginTop: '6px' }}>
          <label>{intl.$t({ defaultMessage: 'Device Subscription' })}</label>
          <label>{intl.$t({ defaultMessage: '50 devices' })}</label>
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

      {!trialSelected && <div>
        <Subtitle level={4}>
          { serviceTypeSelected === ServiceType.EXTENDED_TRIAL
            ? intl.$t({ defaultMessage: 'Extended Trial Mode' })
            : intl.$t({ defaultMessage: 'Paid Subscriptions' }) }</Subtitle>
        <ApswSubscriptionExtendedTrial />
        <SolutionTokenSubscriptionExtendedTrial />
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
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please select expiration date' })
              }
            ]}
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
        </UI.FieldLabeServiceDate></div>}
    </>
  }

  const CustomerSummary = () => {
    const intl = useIntl()
    const { Paragraph } = Typography
    const apswAssigned = trialSelected ? '50' : (serviceTypeSelected === ServiceType.EXTENDED_TRIAL
      ? formData.apswTrialLicense : formData.apswLicense)
    const solutionTokenAssigned = trialSelected ? '50'
      : (serviceTypeSelected === ServiceType.EXTENDED_TRIAL
        ? formData.solutionTokenTrialLicense : formData.solutionTokenLicense)

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


        <Form.Item
          label={isvSmartEdgeEnabled ? intl.$t({ defaultMessage: 'Device Networking' })
            : intl.$t({ defaultMessage: 'Device Subscriptions' })}
        >
          <Paragraph>{apswAssigned}</Paragraph>
        </Form.Item>

        <Form.Item
          label={intl.$t({ defaultMessage: 'Solution Token' })}
        >
          <Paragraph>{solutionTokenAssigned}</Paragraph>
        </Form.Item>

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

          <MspAdminsForm></MspAdminsForm>
          {createEcWithTierEnabled && <EcTierForm />}
          <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Customer Administrator' }) }</Subtitle>
          <Form.Item children={displayCustomerAdmins()} />
          {showExtendedTrial ? <EditCustomerSubscriptionFormExtendedTrial />
            : <EditCustomerSubscriptionForm />}
          {isAppMonitoringEnabled && <div style={{ marginTop: '38px' }}><EnableArcForm /></div>}
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

            <MspAdminsForm></MspAdminsForm>
            {createEcWithTierEnabled && <EcTierForm />}
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
            {showExtendedTrial ? <CustomerSubscriptionExtendedTrial /> : <CustomerSubscription />}
          </StepsFormLegacy.StepForm>

          {isAppMonitoringEnabled && <StepsFormLegacy.StepForm name='privacy'
            title={intl.$t({ defaultMessage: 'Privacy' })}>
            <Subtitle level={3}>{intl.$t({ defaultMessage: 'Privacy' })}</Subtitle>
            <EnableArcForm />
          </StepsFormLegacy.StepForm>}

          <StepsFormLegacy.StepForm name='summary'
            title={intl.$t({ defaultMessage: 'Summary' })}>
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
