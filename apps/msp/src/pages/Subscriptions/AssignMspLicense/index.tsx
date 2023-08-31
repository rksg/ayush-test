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
  Subtitle
} from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  useMspAssignmentSummaryQuery,
  useMspAssignmentHistoryQuery,
  useAddMspAssignmentMutation,
  useUpdateMspAssignmentMutation
} from '@acx-ui/msp/services'
import {
  dateDisplayText,
  DateSelectionEnum,
  MspAssignmentHistory,
  MspAssignmentSummary
} from '@acx-ui/msp/utils'
import {
  EntitlementDeviceType, EntitlementUtil
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import * as UI from '../styledComponent'

interface SubscriptionAssignmentForm {
  startDate: string
  serviceExpirationDate: string
  wifiLicenses?: number
  switchLicenses?: number
  apswLicenses?: number
}

interface MspAssignment {
  ownAssignments: boolean
  startDate: string
  endDate: string
  assignments: Assignment[]
}

interface Assignment {
  quantity: number
  deviceType: EntitlementDeviceType
}

export function AssignMspLicense () {
  const intl = useIntl()

  const navigate = useNavigate()
  const linkToSubscriptions = useTenantLink('/msplicenses', 'v')
  const { tenantId } = useParams()
  const [form] = Form.useForm()

  const [availableWifiLicense, setAvailableWifiLicense] = useState(0)
  const [availableSwitchLicense, setAvailableSwitchLicense] = useState(0)
  const [availableApswLicense, setAvailableApswLicense] = useState(0)
  const [assignedLicense, setAssignedLicense] = useState([] as MspAssignmentHistory[])
  const [customDate, setCustomeDate] = useState(true)
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<moment.Moment>()
  // const [subscriptionEndDate, setSubscriptionEndDate] = useState<moment.Moment>()

  const { Option } = Select
  const isDeviceAgnosticEnabled = useIsSplitOn(Features.DEVICE_AGNOSTIC)

  const { data: licenseSummary } = useMspAssignmentSummaryQuery({ params: useParams() })
  const { data: licenseAssignment } = useMspAssignmentHistoryQuery({ params: useParams() })
  const [addMspSubscription] = useAddMspAssignmentMutation()
  const [updateMspSubscription] = useUpdateMspAssignmentMutation()

  const getAssignmentId = (deviceType: string) => {
    const license =
      assignedLicense.filter(en => en.deviceType === deviceType && en.status === 'VALID')
    return license.length > 0 ? license[0].id : 0
  }

  useEffect(() => {
    if (licenseSummary) {
      if (licenseAssignment) {
        const assigned = licenseAssignment.filter(
          en => en.mspEcTenantId === tenantId && en.status === 'VALID')
        setAssignedLicense(assigned)
        const wifi =
          assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_WIFI)
        const wLic = wifi.length > 0 ? wifi.reduce((acc, cur) => cur.quantity + acc, 0) : 0
        const sw =
          assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_SWITCH)
        const sLic = sw.length > 0 ? sw.reduce((acc, cur) => cur.quantity + acc, 0) : 0
        const apsw =
          assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_APSW)
        const apswLic = apsw.length > 0 ? apsw.reduce((acc, cur) => cur.quantity + acc, 0) : 0

        checkAvailableLicense(licenseSummary, wLic, sLic, apswLic)
        form.setFieldsValue({
          serviceExpirationDate:
            moment((isDeviceAgnosticEnabled ? apsw[0]?.dateExpires : wifi[0]?.dateExpires)
            || moment().add(30,'days')),
          wifiLicenses: wLic,
          switchLicenses: sLic,
          apswLicenses: apswLic
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

  const handleAssignLicense = async (values: SubscriptionAssignmentForm) => {
    try {
      const ecFormData = { ...values }
      const today = EntitlementUtil.getServiceStartDate()
      const expirationDate = EntitlementUtil.getServiceStartDate(
        formatter(DateFormatEnum.DateFormat)(ecFormData.serviceExpirationDate))

      const addAssignment = []
      const updateAssignment = []
      if (isDeviceAgnosticEnabled) {
        // device assignment
        const apswAssignId = getAssignmentId(EntitlementDeviceType.MSP_APSW)
        const quantityApsw = ecFormData.apswLicenses || 0
        apswAssignId ?
          updateAssignment.push({
            startDate: today,
            endDate: expirationDate,
            quantity: quantityApsw,
            assignmentId: apswAssignId
          })
          : addAssignment.push({
            quantity: quantityApsw,
            deviceType: EntitlementDeviceType.MSP_APSW
          })
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
        const mspAssignments: MspAssignment = {
          ownAssignments: true,
          startDate: today,
          endDate: expirationDate,
          assignments: addAssignment
        }
        await addMspSubscription({ payload: mspAssignments }).unwrap()
      }
      if (updateAssignment.length > 0) {
        await updateMspSubscription({ payload: updateAssignment }).unwrap()
      }
      navigate(linkToSubscriptions, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const checkAvailableLicense =
  (entitlements: MspAssignmentSummary[], wLic?: number, swLic?: number, apswLic?: number) => {
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

    const apswLicenses = entitlements.filter(p =>
      p.remainingDevices > 0 && p.deviceType === EntitlementDeviceType.MSP_APSW)
    let remainingApsw = 0
    apswLicenses.forEach( (lic: MspAssignmentSummary) => {
      remainingApsw += lic.remainingDevices
    })
    setAvailableApswLicense(remainingApsw + (apswLic || 0))
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
      form.setFieldsValue({
        serviceExpirationDate: expirationDate
      })
      setCustomeDate(false)
    }
  }

  const EditCustomerSubscriptionForm = () => {
    return <div>
      <Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Subscriptions' }) }</Subtitle>

      {isDeviceAgnosticEnabled && <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'Assigned Device Subscriptions' })}</label>
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
          {intl.$t({ defaultMessage: 'devices out of {availableApswLicense} available' }, {
            availableApswLicense: availableApswLicense })}
        </label>
      </UI.FieldLabelSubs>}

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
              // defaultValue={moment(formatter(DateFormatEnum.DateFormat)(subscriptionEndDate))}
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

  return (
    <>
      <PageHeader
        title={intl.$t({ defaultMessage: 'Assign Subscription' })}
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
          <EditCustomerSubscriptionForm></EditCustomerSubscriptionForm>
        </StepsForm.StepForm>

      </StepsForm>

    </>
  )
}
