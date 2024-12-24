import { useState, useEffect } from 'react'

import {
  DatePicker,
  Form,
  InputNumber,
  Select
} from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Subtitle,
  showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  useMspAssignmentSummaryQuery,
  useMspAssignmentHistoryQuery,
  useAddMspAssignmentMutation,
  useUpdateMspAssignmentMutation,
  useDeleteMspAssignmentMutation,
  useMspRbacAssignmentHistoryQuery
} from '@acx-ui/msp/services'
import {
  dateDisplayText,
  DateSelectionEnum,
  MspAssignmentHistory,
  MspAssignmentSummary
} from '@acx-ui/msp/utils'
import {
  EntitlementDeviceType,
  EntitlementUtil,
  useTableQuery
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { CatchErrorDetails } from '@acx-ui/utils'

import * as UI from '../styledComponent'

interface SubscriptionAssignmentForm {
  startDate: string
  serviceExpirationDate: string
  trialServiceExpirationDate: string
  wifiLicenses?: number
  switchLicenses?: number
  apswLicenses?: number
  apswTrialLicenses?: number
}

interface MspAssignment {
  ownAssignments?: boolean
  startDate?: string
  endDate?: string
  assignments?: Assignment[]
  effectiveDate?: string
  expirationDate?: string
  quantity?: number
  licenseType?: string
  trial?: boolean
}

interface Assignment {
  quantity: number
  deviceType: EntitlementDeviceType
  useTemporaryMspEntitlement?: boolean
}

interface CatchErrorResponse<T> {
  data: {
    error: T,
    requestId: string
  },
  status: number
}

export const entitlementAssignmentPayload = {
  fields: [
    'id',
    'licenseType',
    'quantity',
    'effectiveDate',
    'expirationDate',
    'isTrial',
    'createdDate',
    'revokedDate',
    'status'
  ],
  page: 1,
  pageSize: 20,
  sortField: 'expirationDate',
  sortOrder: 'DESC',
  filters: {
    createdBy: [],
    licenseType: [],
    status: [
      'VALID'
    ]
  }
}

export function AssignMspLicense () {
  const intl = useIntl()

  const navigate = useNavigate()
  const linkToSubscriptions = useTenantLink('/msplicenses', 'v')
  const { tenantId } = useParams()
  const params = useParams()
  const [form] = Form.useForm()

  const [availableWifiLicense, setAvailableWifiLicense] = useState(0)
  const [availableSwitchLicense, setAvailableSwitchLicense] = useState(0)
  const [availableApswLicense, setAvailableApswLicense] = useState(0)
  const [availableApswTrialLicense, setAvailableApswTrialLicense] = useState(0)
  const [assignedLicense, setAssignedLicense] = useState([] as MspAssignmentHistory[])
  const [customDate, setCustomeDate] = useState(true)
  const [customTrialDate, setCustomeTrialDate] = useState(true)
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<moment.Moment>()
  // const [subscriptionEndDate, setSubscriptionEndDate] = useState<moment.Moment>()

  const { Option } = Select
  const isDeviceAgnosticEnabled = useIsSplitOn(Features.DEVICE_AGNOSTIC)
  const isEntitlementRbacApiEnabled = useIsSplitOn(Features.ENTITLEMENT_RBAC_API)
  const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
  const isSeparateServicedateEnabled =
    useIsSplitOn(Features.ENTITLEMENT_SEPARATE_SERVICEDATE_TOGGLE)

  const { data: licenseSummary } = useMspAssignmentSummaryQuery({ params: useParams() })
  const { data: assignment } =
    useMspAssignmentHistoryQuery({ params: params }, { skip: isEntitlementRbacApiEnabled })
  const { data: rbacAssignment } = useTableQuery({
    useQuery: useMspRbacAssignmentHistoryQuery,
    defaultPayload: entitlementAssignmentPayload,
    option: { skip: !isEntitlementRbacApiEnabled }
  })
  const licenseAssignment = isEntitlementRbacApiEnabled ? rbacAssignment?.data : assignment
  const [addMspSubscription] = useAddMspAssignmentMutation()
  const [updateMspSubscription] = useUpdateMspAssignmentMutation()
  const [deleteMspSubscription] = useDeleteMspAssignmentMutation()

  const getAssignmentId = (deviceType: string) => {
    const license =
      assignedLicense.filter(en => en.deviceType === deviceType && en.status === 'VALID')
    return license.length > 0 ? license[0].id : 0
  }

  const getDeviceAssignmentId = (deviceType: string, isTrial: boolean) => {
    const license = isEntitlementRbacApiEnabled
      ? assignedLicense.filter(en => en.licenseType === deviceType && en.status === 'VALID' &&
        en.isTrial === isTrial)
      : assignedLicense.filter(en => en.deviceType === deviceType && en.status === 'VALID' &&
        en.trialAssignment === isTrial)
    return license.length > 0 ? license[0].id : 0
  }

  useEffect(() => {
    if (licenseSummary) {
      if (licenseAssignment) {
        const assigned = isEntitlementRbacApiEnabled ?licenseAssignment : licenseAssignment.filter(
          en => en.mspEcTenantId === tenantId && en.status === 'VALID')
        setAssignedLicense(assigned)
        const wifi =
          assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_WIFI)
        const wLic = wifi.length > 0 ? wifi.reduce((acc, cur) => cur.quantity + acc, 0) : 0
        const sw =
          assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_SWITCH)
        const sLic = sw.length > 0 ? sw.reduce((acc, cur) => cur.quantity + acc, 0) : 0
        const apsw = isEntitlementRbacApiEnabled
          ? assigned.filter(en => en.isTrial === false)
          : assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_APSW &&
              en.trialAssignment === false)
        const apswLic = apsw.length > 0 ? apsw.reduce((acc, cur) => cur.quantity + acc, 0) : 0

        const apswTrial = isEntitlementRbacApiEnabled
          ? assigned.filter(en => en.isTrial === true)
          : assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_APSW &&
            en.trialAssignment === true)
        const apswTrialLic =
          apswTrial.length > 0 ? apswTrial.reduce((acc, cur) => cur.quantity + acc, 0) : 0

        checkAvailableLicense(licenseSummary, wLic, sLic, apswLic, apswTrialLic)

        isDeviceAgnosticEnabled ?
          form.setFieldsValue({
            serviceExpirationDate: moment(apsw[0]?.expirationDate || moment().add(30,'days')),
            trialServiceExpirationDate: isSeparateServicedateEnabled
              ? moment(apswTrial[0]?.expirationDate || moment().add(30,'days')) : '',
            apswLicenses: apswLic,
            apswTrialLicenses: apswTrialLic
          }) :
          form.setFieldsValue({
            serviceExpirationDate: moment(wifi[0]?.dateExpires || moment().add(30,'days')),
            wifiLicenses: wLic,
            switchLicenses: sLic
          })
      } else {
        checkAvailableLicense(licenseSummary)
      }
    }
    setSubscriptionStartDate(moment())
  }, [licenseSummary, licenseAssignment])


  const fieldValidator = async (value: string, remainingDevices: number) => {
    if(parseInt(value, 10) > remainingDevices || parseInt(value, 10) < 0) {
      return Promise.reject(
        intl.$t({ defaultMessage: 'Number should be between 0 and {value}' },
          { value: remainingDevices })
      )
    }
    return Promise.resolve()
  }

  const handleSubmitFailed = (error: CatchErrorResponse<CatchErrorDetails>) => {
    const errData = error?.data
    let title = intl.$t({ defaultMessage: 'Assign Subscription Failed' })
    let message
    const status = error.status
    if (status === 409) {
      // eslint-disable-next-line max-len
      message = (errData?.error?.message) ?? intl.$t({ defaultMessage: 'Operation failed' })
    } else {
      const status = error.status
      title = intl.$t({ defaultMessage: 'Server Error' })
      // eslint-disable-next-line max-len
      message = intl.$t({ defaultMessage: 'Error has occurred. Backend returned code {status}' }, { status })
    }
    showActionModal({
      type: 'error',
      title: title,
      content: message
    })
  }

  const handleAssignLicense = async (values: SubscriptionAssignmentForm) => {
    try {
      const ecFormData = { ...values }
      const today = EntitlementUtil.getServiceStartDate()
      const expirationDate = EntitlementUtil.getServiceStartDate((ecFormData.serviceExpirationDate))

      const addAssignment = []
      const updateAssignment = []
      const deleteAssignment = []
      if (isDeviceAgnosticEnabled) {
        // paid device assignment
        if (availableApswLicense) {
          const apswAssignId =
            isEntitlementRbacApiEnabled ? getDeviceAssignmentId(EntitlementDeviceType.APSW, false)
              : getDeviceAssignmentId(EntitlementDeviceType.MSP_APSW, false)
          const quantityApsw = ecFormData.apswLicenses || 0
          if (apswAssignId) {
            quantityApsw > 0 ?
              updateAssignment.push({
                startDate: today,
                endDate: expirationDate,
                quantity: quantityApsw,
                assignmentId: apswAssignId
              }) :
              deleteAssignment.push({
                assignmentId: apswAssignId
              })
          } else if (quantityApsw > 0) {
            addAssignment.push({
              endDate: expirationDate,
              quantity: quantityApsw,
              deviceType: EntitlementDeviceType.MSP_APSW
            })
          }
        }
        // trial license assignment
        if (availableApswTrialLicense) {
          const trialExpirationDate = isSeparateServicedateEnabled
            ? EntitlementUtil.getServiceStartDate((ecFormData.trialServiceExpirationDate))
            : EntitlementUtil.getServiceStartDate((ecFormData.serviceExpirationDate))
          const apswTrialAssignId =
            isEntitlementRbacApiEnabled ? getDeviceAssignmentId(EntitlementDeviceType.APSW, true)
              : getDeviceAssignmentId(EntitlementDeviceType.MSP_APSW, true)
          const quantityApswTrial = ecFormData.apswTrialLicenses || 0
          if (apswTrialAssignId) {
            quantityApswTrial > 0 ?
              updateAssignment.push({
                startDate: today,
                endDate: trialExpirationDate,
                quantity: quantityApswTrial,
                assignmentId: apswTrialAssignId
              }) :
              deleteAssignment.push({
                assignmentId: apswTrialAssignId
              })
          } else if (quantityApswTrial > 0 ) {
            addAssignment.push({
              endDate: trialExpirationDate,
              quantity: quantityApswTrial,
              deviceType: EntitlementDeviceType.MSP_APSW,
              useTemporaryMspEntitlement: true
            })
          }
        }
      }
      else {
        // wifi assignment
        const wifiAssignId = getAssignmentId(EntitlementDeviceType.MSP_WIFI)
        const quantityWifi = ecFormData.wifiLicenses || 0
        wifiAssignId ?
          updateAssignment.push({
            startDate: today,
            endDate: expirationDate,
            quantity: quantityWifi,
            assignmentId: wifiAssignId
          })
          : addAssignment.push({
            quantity: quantityWifi,
            deviceType: EntitlementDeviceType.MSP_WIFI
          })
        // switch assignment
        const switchAssignId = getAssignmentId(EntitlementDeviceType.MSP_SWITCH)
        const quantitySwitch = ecFormData.switchLicenses || 0
        switchAssignId ?
          updateAssignment.push({
            startDate: today,
            endDate: expirationDate,
            quantity: quantitySwitch,
            assignmentId: switchAssignId
          })
          : addAssignment.push({
            quantity: quantitySwitch,
            deviceType: EntitlementDeviceType.MSP_SWITCH
          })
      }
      if (addAssignment.length > 0) {
        const mspAssignments: MspAssignment = isEntitlementRbacApiEnabled
          ? {
            effectiveDate: today,
            expirationDate: addAssignment[0].endDate,
            quantity: addAssignment[0].quantity,
            licenseType: 'APSW',
            trial: addAssignment[0].useTemporaryMspEntitlement ?? false
          }: {
            ownAssignments: true,
            startDate: today,
            endDate: expirationDate,
            assignments: addAssignment
          }
        await addMspSubscription({ params: { tenantId: tenantId }, payload: mspAssignments,
          enableRbac: isEntitlementRbacApiEnabled }).unwrap()
        if(isEntitlementRbacApiEnabled && addAssignment.length > 1) {
          const addPayload = {
            effectiveDate: today,
            expirationDate: addAssignment[1].endDate,
            quantity: addAssignment[1].quantity,
            licenseType: 'APSW',
            trial: addAssignment[1].useTemporaryMspEntitlement ?? false
          }
          await addMspSubscription({ params: { tenantId: tenantId }, payload: addPayload,
            enableRbac: isEntitlementRbacApiEnabled }).unwrap()
        }
      }
      if (updateAssignment.length > 0) {
        const assignId = updateAssignment[0].assignmentId.toString()
        const updatePayload = isEntitlementRbacApiEnabled
          ? {
            quantity: updateAssignment[0].quantity,
            expirationDate: updateAssignment[0].endDate }
          : updateAssignment
        await updateMspSubscription({ params: { tenantId: tenantId, assignmentId: assignId },
          payload: updatePayload, enableRbac: isEntitlementRbacApiEnabled }).unwrap()
        if(isEntitlementRbacApiEnabled && updateAssignment.length > 1) {
          const assignId = updateAssignment[1].assignmentId.toString()
          const updatePayload = {
            quantity: updateAssignment[1].quantity,
            expirationDate: updateAssignment[1].endDate }
          await updateMspSubscription({ params: { tenantId: tenantId, assignmentId: assignId },
            payload: updatePayload, enableRbac: isEntitlementRbacApiEnabled }).unwrap()
        }
      }
      if (deleteAssignment.length > 0) {
        const assignId = deleteAssignment[0].assignmentId.toString()
        await isEntitlementRbacApiEnabled
          ? deleteMspSubscription({ params: { tenantId: tenantId, assignmentId: assignId },
            enableRbac: isEntitlementRbacApiEnabled }).unwrap()
          : deleteMspSubscription({ payload: deleteAssignment }).unwrap()
        if(isEntitlementRbacApiEnabled && deleteAssignment.length > 1) {
          const assignId = deleteAssignment[1].assignmentId.toString()
          deleteMspSubscription({ params: { tenantId: tenantId, assignmentId: assignId },
            enableRbac: isEntitlementRbacApiEnabled }).unwrap()
        }
      }
      navigate(linkToSubscriptions, { replace: true })
    } catch (error) {
      const respData = error as CatchErrorResponse<CatchErrorDetails>
      handleSubmitFailed(respData)
    }
  }

  const checkAvailableLicense =
  (entitlements: MspAssignmentSummary[], wLic?: number, swLic?: number, apswLic?: number,
    apswTrialLic?: number) => {
    const wifiLicenses = entitlements.filter(p =>
      p.remainingDevices > 0 && p.deviceType === EntitlementDeviceType.MSP_WIFI)
    let remainingWifi = 0
    wifiLicenses.forEach( (lic: MspAssignmentSummary) => {
      remainingWifi += lic.remainingDevices
    })
    setAvailableWifiLicense(remainingWifi + (wLic || 0))

    const switchLicenses = entitlements.filter(p =>
      p.remainingDevices > 0 && p.deviceType === EntitlementDeviceType.MSP_SWITCH)
    let remainingSwitch = 0
    switchLicenses.forEach( (lic: MspAssignmentSummary) => {
      remainingSwitch += lic.remainingDevices
    })
    setAvailableSwitchLicense(remainingSwitch + (swLic || 0))

    const apswLicenses = entitlements.filter(p => p.remainingDevices > 0 &&
      p.deviceType === EntitlementDeviceType.MSP_APSW && p.trial === false)
    let remainingApsw = 0
    apswLicenses.forEach( (lic: MspAssignmentSummary) => {
      remainingApsw += lic.remainingDevices
    })
    setAvailableApswLicense(remainingApsw + (apswLic || 0))

    const apswTrialLicenses = entitlements.filter(p => p.remainingDevices > 0 &&
      p.deviceType === EntitlementDeviceType.MSP_APSW && p.trial === true)
    let remainingApswTrial = 0
    apswTrialLicenses.forEach( (lic: MspAssignmentSummary) => {
      remainingApswTrial += lic.remainingDevices
    })
    setAvailableApswTrialLicense(remainingApswTrial + (apswTrialLic || 0))

  }

  const getSelectExpirationDate = (value: string) => {
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
    return expirationDate
  }

  const onSelectChange = (value: string) => {
    if (value === DateSelectionEnum.CUSTOME_DATE) {
      setCustomeDate(true)
    } else {
      const expirationDate = getSelectExpirationDate(value)
      form.setFieldsValue({
        serviceExpirationDate: expirationDate
      })
      setCustomeDate(false)
    }
  }

  const onTrialSelectChange = (value: string) => {
    if (value === DateSelectionEnum.CUSTOME_DATE) {
      setCustomeTrialDate(true)
    } else {
      const expirationDate = getSelectExpirationDate(value)
      form.setFieldsValue({
        trialServiceExpirationDate: expirationDate
      })
      setCustomeTrialDate(false)
    }
  }

  const EditCustomerSubscriptionForm = () => {
    return <div>
      <Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Subscriptions' }) }</Subtitle>

      {isDeviceAgnosticEnabled &&
      <div>{(availableApswLicense > 0) && <UI.FieldLabelSubs width='315px'>
        <label>{isvSmartEdgeEnabled
          ? intl.$t({ defaultMessage: 'Assigned Device Networking' })
          : intl.$t({ defaultMessage: 'Assigned Paid Device Subscriptions' })
        }</label>
        <Form.Item
          name='apswLicenses'
          label=''
          initialValue={0}
          rules={[
            { required: true,
              message: intl.$t({ defaultMessage: 'Please enter device subscription' })
            },
            { validator: (_, value) => fieldValidator(value, availableApswLicense) }
          ]}
          children={<InputNumber/>}
          style={{ paddingRight: '20px' }}
        />
        <label>
          {isvSmartEdgeEnabled
            ? intl.$t({ defaultMessage: 'paid licenses out of {availableApswLicense} available' }, {
              availableApswLicense: availableApswLicense })
            : intl.$t({ defaultMessage: 'devices out of {availableApswLicense} available' }, {
              availableApswLicense: availableApswLicense })
          }
        </label>
      </UI.FieldLabelSubs>}
      {(availableApswTrialLicense > 0) && <UI.FieldLabelSubs width='315px'>
        <label>{isvSmartEdgeEnabled
          ? intl.$t({ defaultMessage: 'Assigned Device Networking' })
          : intl.$t({ defaultMessage: 'Assigned Trial Device Subscriptions' })
        }</label>
        <Form.Item
          name='apswTrialLicenses'
          label=''
          initialValue={0}
          rules={[
            { required: true,
              message: intl.$t({ defaultMessage: 'Please enter device trial subscription' })
            },
            { validator: (_, value) => fieldValidator(value, availableApswTrialLicense) }
          ]}
          children={<InputNumber/>}
          style={{ paddingRight: '20px' }}
        />
        <label>
          {isvSmartEdgeEnabled
          // eslint-disable-next-line max-len
            ? intl.$t({ defaultMessage: 'trial licenses out of {availableApswTrialLicense} available' }, {
              availableApswTrialLicense: availableApswTrialLicense })
            : intl.$t({ defaultMessage: 'devices out of {availableApswTrialLicense} available' }, {
              availableApswTrialLicense: availableApswTrialLicense })
          }
        </label>
      </UI.FieldLabelSubs>}</div>}

      {!isDeviceAgnosticEnabled && <div>
        <UI.FieldLabelSubs width='275px'>
          <label>{intl.$t({ defaultMessage: 'Assigned Wi-Fi Subscription' })}</label>
          <Form.Item
            name='wifiLicenses'
            label=''
            initialValue={0}
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please enter Wi-Fi subscription' })
              },
              { validator: (_, value) => fieldValidator(value, availableWifiLicense) }
            ]}
            children={<InputNumber/>}
            style={{ paddingRight: '20px' }}
          />
          <label>
            {intl.$t({ defaultMessage: 'devices out of {availableWifiLicense} available' }, {
              availableWifiLicense: availableWifiLicense })}
          </label>
        </UI.FieldLabelSubs>

        <UI.FieldLabelSubs width='275px'>
          <label>{intl.$t({ defaultMessage: 'Assigned Switch Subscription' })}</label>
          <Form.Item
            name='switchLicenses'
            label=''
            initialValue={0}
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please enter switch subscription' })
              },
              { validator: (_, value) => fieldValidator(value, availableSwitchLicense) }
            ]}
            children={<InputNumber/>}
            style={{ paddingRight: '20px' }}
          />
          <label>
            {intl.$t({ defaultMessage: 'devices out of {availableSwitchLicense} available' }, {
              availableSwitchLicense: availableSwitchLicense })}
          </label>
        </UI.FieldLabelSubs>
      </div>}

      <UI.FieldLabel2 width='275px' style={{ marginTop: '18px' }}>
        <label>{intl.$t({ defaultMessage: 'Subscription Start Date' })}</label>
        <label>{formatter(DateFormatEnum.DateFormat)(subscriptionStartDate)}</label>
      </UI.FieldLabel2>

      <UI.FieldLabeServiceDate width='275px' style={{ marginTop: '10px' }}>
        <label>{intl.$t({ defaultMessage: 'Subscription Expiration Date' })}</label>
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
          name='serviceExpirationDate'
          label=''
          rules={[
            { required: true,
              message: intl.$t({ defaultMessage: 'Please select expiration date' })
            }
          ]}
          children={
            <DatePicker
              format={formatter(DateFormatEnum.DateFormat)}
              disabled={!customDate}
              disabledDate={(current) => {
                return current && current < moment().endOf('day')
              }}
              style={{ marginLeft: '4px' }}
            />
          }
        />
      </UI.FieldLabeServiceDate>
    </div>
  }

  const EditSeparateCustomerSubscriptionForm = () => {
    return <>
      {(availableApswLicense > 0) && <div>
        <Subtitle level={4}>
          { intl.$t({ defaultMessage: 'Paid Subscriptions' }) }</Subtitle>
        <UI.FieldLabelSubs2 width='315px'>
          <label>{intl.$t({ defaultMessage: 'Assigned Device Networking' })}</label>
          <Form.Item
            name='apswLicenses'
            label=''
            initialValue={0}
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please enter device subscription' })
              },
              { validator: (_, value) => fieldValidator(value, availableApswLicense) }
            ]}
            children={<InputNumber/>}
            style={{ paddingRight: '20px' }}
          />
          <label>
            {intl.$t({ defaultMessage: 'paid licenses out of {availableApswLicense} available' }, {
              availableApswLicense: availableApswLicense })}
          </label>
        </UI.FieldLabelSubs2>

        <UI.FieldLabel2 width='275px'>
          <label>{intl.$t({ defaultMessage: 'Subscription Start Date' })}</label>
          <label>{formatter(DateFormatEnum.DateFormat)(subscriptionStartDate)}</label>
        </UI.FieldLabel2>

        <UI.FieldLabeServiceDate width='275px' style={{ marginTop: '10px' }}>
          <label>{intl.$t({ defaultMessage: 'Paid Licenses Expiration Date' })}</label>
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
            name='serviceExpirationDate'
            label=''
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please select expiration date' })
              }
            ]}
            children={
              <DatePicker
                format={formatter(DateFormatEnum.DateFormat)}
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

      {availableApswTrialLicense > 0 && <div style={{ marginTop: '25px' }}>
        <Subtitle level={4}>
          { intl.$t({ defaultMessage: 'Trial Subscriptions' }) }</Subtitle>
        <UI.FieldLabelSubs2 width='315px'>
          <label>{intl.$t({ defaultMessage: 'Assigned Device Networking' })}</label>
          <Form.Item
            name='apswTrialLicenses'
            label=''
            initialValue={0}
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please enter device trial subscription' })
              },
              { validator: (_, value) => fieldValidator(value, availableApswTrialLicense) }
            ]}
            children={<InputNumber/>}
            style={{ paddingRight: '20px' }}
          />
          <label>
            {
            // eslint-disable-next-line max-len
              intl.$t({ defaultMessage: 'trial licenses out of {availableApswTrialLicense} available' }, {
                availableApswTrialLicense: availableApswTrialLicense })
            }
          </label>
        </UI.FieldLabelSubs2>

        <UI.FieldLabel2 width='275px'>
          <label>{intl.$t({ defaultMessage: 'Subscription Start Date' })}</label>
          <label>{formatter(DateFormatEnum.DateFormat)(subscriptionStartDate)}</label>
        </UI.FieldLabel2>

        <UI.FieldLabeServiceDate width='275px' style={{ marginTop: '10px' }}>
          <label>{intl.$t({ defaultMessage: 'Trial Licenses Expiration Date' })}</label>
          <Form.Item
            name='trialExpirationDateSelection'
            label=''
            rules={[{ required: true } ]}
            initialValue={DateSelectionEnum.CUSTOME_DATE}
            children={
              <Select onChange={onTrialSelectChange}>
                {
                  Object.entries(DateSelectionEnum).map(([label, value]) => (
                    <Option key={label} value={value}>{intl.$t(dateDisplayText[value])}</Option>
                  ))
                }
              </Select>
            }
          />
          <Form.Item
            name='trialServiceExpirationDate'
            label=''
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please select expiration date' })
              }
            ]}
            children={
              <DatePicker
                format={formatter(DateFormatEnum.DateFormat)}
                disabled={!customTrialDate}
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

  return (
    <>
      <PageHeader
        title={intl.$t({ defaultMessage: 'Assign Subscriptions' })}
        breadcrumb={[
          { text: intl.$t({ defaultMessage: ' Subscriptions' }),
            link: '/msplicenses', tenantType: 'v' }
        ]}
      />
      <StepsForm
        form={form}
        onFinish={handleAssignLicense}
        onCancel={() => navigate(linkToSubscriptions)}
        buttonLabel={{ submit: intl.$t({ defaultMessage: 'Save' }) }}
      >
        <StepsForm.StepForm>
          {isSeparateServicedateEnabled ? <EditSeparateCustomerSubscriptionForm/>
            : <EditCustomerSubscriptionForm/>}
        </StepsForm.StepForm>

      </StepsForm>

    </>
  )
}
