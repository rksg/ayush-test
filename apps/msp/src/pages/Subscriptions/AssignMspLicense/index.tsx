import { useState, useEffect } from 'react'

import {
  DatePicker,
  Form,
  Input,
  Select
} from 'antd'
// import _           from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Subtitle
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  useMspAssignmentSummaryQuery,
  useMspAssignmentHistoryQuery
} from '@acx-ui/rc/services'
import {
  dateDisplayText,
  DateSelectionEnum,
  // MspAssignmentHistory,
  MspAssignmentSummary,
  EntitlementDeviceType
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import * as UI from '../styledComponent'

export function AssignMspLicense () {
  const intl = useIntl()

  const navigate = useNavigate()
  const linkToSubscriptions = useTenantLink('/msplicenses', 'v')
  const { action, mspEcTenantId } = useParams()

  const [availableWifiLicense, setAvailableWifiLicense] = useState(0)
  const [availableSwitchLicense, setAvailableSwitchLicense] = useState(0)
  // const [assignedLicense, setAssignedLicense] = useState([] as MspAssignmentHistory[])
  // const [assignedWifiLicense, setWifiLicense] = useState(0)
  // const [assignedSwitchLicense, setSwitchLicense] = useState(0)
  const [customDate, setCustomeDate] = useState(true)
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<moment.Moment>()
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<moment.Moment>()

  const { Option } = Select
  const isEditMode = action === 'edit'

  const { data: licenseSummary } = useMspAssignmentSummaryQuery({ params: useParams() })
  const { data: licenseAssignment } = useMspAssignmentHistoryQuery({ params: useParams() })

  useEffect(() => {
    if (licenseSummary) {
      checkAvailableLicense(licenseSummary)

      if (licenseAssignment) {
        const assigned = licenseAssignment.filter(en => en.mspEcTenantId === mspEcTenantId)
        // setAssignedLicense(assigned)
        const wifi = assigned.filter(en =>
          en.deviceType === EntitlementDeviceType.MSP_WIFI && en.status === 'VALID')
        const wLic = wifi.length > 0 ? wifi[0].quantity : 0
        const sw = assigned.filter(en =>
          en.deviceType === EntitlementDeviceType.MSP_SWITCH && en.status === 'VALID')
        const sLic = sw.length > 0 ? sw.reduce((acc, cur) => cur.quantity + acc, 0) : 0
        checkAvailableLicense(licenseSummary, wLic, sLic)
      }
    }

    if (!isEditMode) { // Add mode
      setSubscriptionStartDate(moment())
      setSubscriptionEndDate(moment().add(30,'days'))
    }
  }, [licenseSummary, licenseAssignment])


  const fieldValidator = async (value: string, remainingDevices: number) => {
    if(parseInt(value, 10) > remainingDevices || parseInt(value, 10) < 0) {
      return Promise.reject(
        `${intl.$t({ defaultMessage: 'Invalid number' })} `
      )
    }
    return Promise.resolve()
  }

  // const handleAssignLicense = async (values: unknown) => {
  // }

  // const handleEditLicense = async (values: unknown) => {
  // }

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
    return <div>
      <Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Subscriptions' }) }</Subtitle>
      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'Assigned Wi-Fi Subscription' })}</label>
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

      <UI.FieldLabelSubs width='275px'>
        <label>{intl.$t({ defaultMessage: 'Assigned Switch Subscription' })}</label>
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
        // formRef={formRef}
        // onFinish={isEditMode ? handleEditLicense : handleAssignLicense}
        onCancel={() => navigate(linkToSubscriptions)}
        buttonLabel={{ submit: isEditMode ?
          intl.$t({ defaultMessage: 'Save' }):
          intl.$t({ defaultMessage: 'Assign' }) }}
      >
        <StepsForm.StepForm>
          <EditCustomerSubscriptionForm></EditCustomerSubscriptionForm>
        </StepsForm.StepForm>

      </StepsForm>

    </>
  )
}
