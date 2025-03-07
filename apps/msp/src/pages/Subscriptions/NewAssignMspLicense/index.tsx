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
  useMspAssignmentHistoryQuery,
  useAddMspAssignmentMutation,
  useUpdateMspAssignmentMutation,
  useDeleteMspAssignmentMutation,
  useMspRbacAssignmentHistoryQuery
} from '@acx-ui/msp/services'
import {
  dateDisplayText,
  DateSelectionEnum,
  MspAssignmentHistory
} from '@acx-ui/msp/utils'
import { useRbacEntitlementSummaryQuery } from '@acx-ui/rc/services'
import {
  EntitlementDeviceType,
  EntitlementSummaries,
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
  sltnServiceExpirationDate?: string
  sltnTrialServiceExpirationDate?: string
  apswLicenses?: number
  apswTrialLicenses?: number
  sltnLicenses?: number
  sltnTrialLicenses?: number
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

interface AddAssignment {
  endDate: string;
  quantity: number;
  deviceType: EntitlementDeviceType;
  useTemporaryMspEntitlement?: boolean;
}

interface UpdateAssignment {
  startDate: string;
  endDate: string;
  quantity: number;
  assignmentId: number;
}

interface DeleteAssignment {
  assignmentId: number
}

type DeleteAssignmentPayoad = {
  params: {
      tenantId: string | undefined;
      assignmentId: string;
  };
  enableRbac: true;
} | {
  payload: DeleteAssignment[]
}

export function NewAssignMspLicense () {
  const intl = useIntl()

  const navigate = useNavigate()
  const linkToSubscriptions = useTenantLink('/msplicenses', 'v')
  const { tenantId } = useParams()
  const params = useParams()
  const [form] = Form.useForm()

  const [availableApswLicense, setAvailableApswLicense] = useState(0)
  const [availableApswTrialLicense, setAvailableApswTrialLicense] = useState(0)
  const [availableSolutionTokenLicense, setAvailableSolutionTokenLicense] = useState(0)
  const [availableSolutionTokenTrialLicense, setAvailableSolutionTokenTrialLicense] = useState(0)
  const [assignedLicense, setAssignedLicense] = useState([] as MspAssignmentHistory[])
  const [customDate, setCustomeDate] = useState(true)
  const [customTrialDate, setCustomeTrialDate] = useState(true)
  const [sltnCustomDate, setSltnCustomDate] = useState(true)
  const [sltnCustomTrialDate, setSltnCustomTrialDate] = useState(true)
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<moment.Moment>()
  // const [subscriptionEndDate, setSubscriptionEndDate] = useState<moment.Moment>()

  const { Option } = Select
  const isEntitlementRbacApiEnabled = useIsSplitOn(Features.ENTITLEMENT_RBAC_API)
  const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
  const isSeparateServicedateEnabled =
    useIsSplitOn(Features.ENTITLEMENT_SEPARATE_SERVICEDATE_TOGGLE)

  const entitlementSummaryPayload = {
    filters: {
      licenseType: ['APSW', 'SLTN_TOKEN'],
      usageType: 'ASSIGNED'
    }
  }

  const { data: licenseSummaryResults } = useRbacEntitlementSummaryQuery(
    { params: useParams(), payload: entitlementSummaryPayload })
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

  const getDeviceAssignmentId = (deviceType: string, isTrial: boolean) => {
    const license = isEntitlementRbacApiEnabled
      ? assignedLicense.filter(en => en.licenseType === deviceType && en.status === 'VALID' &&
        en.isTrial === isTrial)
      : assignedLicense.filter(en => en.deviceType === deviceType && en.status === 'VALID' &&
        en.trialAssignment === isTrial)
    return license.length > 0 ? license[0].id : 0
  }

  useEffect(() => {
    if (licenseSummaryResults) {
      if (licenseAssignment) {
        const assigned = isEntitlementRbacApiEnabled ?licenseAssignment : licenseAssignment.filter(
          en => en.mspEcTenantId === tenantId && en.status === 'VALID')
        setAssignedLicense(assigned)
        const apsw = isEntitlementRbacApiEnabled
          ? assigned.filter(en => en.isTrial === false
            && en.licenseType === EntitlementDeviceType.APSW)
          : assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_APSW &&
              en.trialAssignment === false)
        const apswLic = apsw.length > 0 ? apsw.reduce((acc, cur) => cur.quantity + acc, 0) : 0

        const apswTrial = isEntitlementRbacApiEnabled
          ? assigned.filter(en => en.isTrial === true
            && en.licenseType === EntitlementDeviceType.APSW)
          : assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_APSW &&
            en.trialAssignment === true)
        const apswTrialLic =
          apswTrial.length > 0 ? apswTrial.reduce((acc, cur) => cur.quantity + acc, 0) : 0

        const solutionToken = isEntitlementRbacApiEnabled
          ? assigned.filter(en => en.isTrial === false
            && en.licenseType === EntitlementDeviceType.SLTN_TOKEN)
          : assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_SLTN_TOKEN &&
              en.trialAssignment === false)
        const solutionTokenLic = solutionToken.length > 0
          ? solutionToken.reduce((acc, cur) => cur.quantity + acc, 0) : 0

        const solutionTokenTrial = isEntitlementRbacApiEnabled
          ? assigned.filter(en => en.isTrial === true
            && en.licenseType === EntitlementDeviceType.SLTN_TOKEN)
          : assigned.filter(en => en.deviceType === EntitlementDeviceType.MSP_SLTN_TOKEN &&
            en.trialAssignment === true)
        const solutionTokenTrialLic =
        solutionTokenTrial.length > 0
          ? solutionTokenTrial.reduce((acc, cur) => cur.quantity + acc, 0) : 0

        checkAvailableLicense(licenseSummaryResults, apswLic, apswTrialLic,
          solutionTokenLic, solutionTokenTrialLic)

        form.setFieldsValue({
          serviceExpirationDate: moment(apsw[0]?.expirationDate || moment().add(30,'days')),
          trialServiceExpirationDate: isSeparateServicedateEnabled
            ? moment(apswTrial[0]?.expirationDate || moment().add(30,'days')) : '',
          apswLicenses: apswLic,
          apswTrialLicenses: apswTrialLic
        })

        form.setFieldsValue({
          sltnServiceExpirationDate: moment(solutionToken[0]?.expirationDate
              || moment().add(30,'days')),
          sltnTrialServiceExpirationDate:
            moment(solutionTokenTrial[0]?.expirationDate || moment().add(30,'days')),
          sltnLicenses: solutionTokenLic,
          sltnTrialLicenses: solutionTokenTrialLic
        })

      } else {
        checkAvailableLicense(licenseSummaryResults)
      }
    }
    setSubscriptionStartDate(moment())
  }, [licenseSummaryResults, licenseAssignment])


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

  async function executeAddAssignmentCall (assignment: AddAssignment,
    today: string, expirationDate: string) {
    try {
      let payload
      if (isEntitlementRbacApiEnabled){
        payload = {
          effectiveDate: today,
          expirationDate: assignment.endDate,
          quantity: assignment.quantity,
          licenseType: assignment.deviceType,
          trial: assignment.useTemporaryMspEntitlement ?? false
        }
      } else {
        payload = {
          ownAssignments: true,
          startDate: today,
          endDate: expirationDate,
          assignments: assignment
        }
      }
      return await addMspSubscription({ params: { tenantId: tenantId }, payload: payload,
        enableRbac: isEntitlementRbacApiEnabled }).unwrap()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('API call error:', error)
      throw error // Stop further execution if an error occurs
    }
  }

  async function executeUpdateAssignmentCall (assignment: UpdateAssignment) {
    try {
      const assignId = assignment.assignmentId.toString()
      let updatePayload
      if (isEntitlementRbacApiEnabled) {
        updatePayload = {
          quantity: assignment.quantity,
          expirationDate: assignment.endDate
        }
      } else {
        updatePayload = assignment
      }
      return await updateMspSubscription({ params: { tenantId: tenantId, assignmentId: assignId },
        payload: updatePayload, enableRbac: isEntitlementRbacApiEnabled }).unwrap()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('API call error:', error)
      throw error // Stop further execution if an error occurs
    }
  }

  async function executeDeleteAssignmentCall (deleteAssignmentPayoad: DeleteAssignmentPayoad) {
    try {
      return await deleteMspSubscription(deleteAssignmentPayoad).unwrap()
    } catch (error) {
    // eslint-disable-next-line no-console
      console.error('API call error:', error)
      throw error // Stop further execution if an error occurs
    }
  }

  const handleAssignLicense = async (values: SubscriptionAssignmentForm) => {
    try {
      const ecFormData = { ...values }
      const today = EntitlementUtil.getServiceStartDate()
      const expirationDate = EntitlementUtil.getServiceStartDate((ecFormData.serviceExpirationDate))
      const sltnExpirationDate =
        EntitlementUtil.getServiceStartDate((ecFormData.sltnServiceExpirationDate))

      const addAssignment: AddAssignment[] = []
      const updateAssignment: UpdateAssignment[] = []
      const deleteAssignment: DeleteAssignment[] = []
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

      if (availableSolutionTokenLicense) {
        const sltnAssignId =
            isEntitlementRbacApiEnabled
              ? getDeviceAssignmentId(EntitlementDeviceType.SLTN_TOKEN, false)
              : getDeviceAssignmentId(EntitlementDeviceType.MSP_SLTN_TOKEN, false)
        const quantitySltn = ecFormData.sltnLicenses || 0
        if (sltnAssignId) {
          quantitySltn > 0 ?
            updateAssignment.push({
              startDate: today,
              endDate: sltnExpirationDate,
              quantity: quantitySltn,
              assignmentId: sltnAssignId
            }) :
            deleteAssignment.push({
              assignmentId: sltnAssignId
            })
        } else if (quantitySltn > 0) {
          addAssignment.push({
            endDate: sltnExpirationDate,
            quantity: quantitySltn,
            deviceType: EntitlementDeviceType.MSP_SLTN_TOKEN
          })
        }
      }

      if (availableSolutionTokenTrialLicense) {
        const trialExpirationDate =
            EntitlementUtil.getServiceStartDate((ecFormData.sltnTrialServiceExpirationDate))
        const sltnTrialAssignId =
            isEntitlementRbacApiEnabled
              ? getDeviceAssignmentId(EntitlementDeviceType.SLTN_TOKEN, true)
              : getDeviceAssignmentId(EntitlementDeviceType.MSP_SLTN_TOKEN, true)
        const quantitySltnTrial = ecFormData.sltnTrialLicenses || 0
        if (sltnTrialAssignId) {
          quantitySltnTrial > 0 ?
            updateAssignment.push({
              startDate: today,
              endDate: trialExpirationDate,
              quantity: quantitySltnTrial,
              assignmentId: sltnTrialAssignId
            }) :
            deleteAssignment.push({
              assignmentId: sltnTrialAssignId
            })
        } else if (quantitySltnTrial > 0 ) {
          addAssignment.push({
            endDate: trialExpirationDate,
            quantity: quantitySltnTrial,
            deviceType: EntitlementDeviceType.MSP_SLTN_TOKEN,
            useTemporaryMspEntitlement: true
          })
        }
      }

      for (const payload of addAssignment) {
        await executeAddAssignmentCall(payload, today, expirationDate)
      }

      for (const payload of updateAssignment) {
        await executeUpdateAssignmentCall(payload)
      }

      if (isEntitlementRbacApiEnabled) {
        for (const payload of deleteAssignment) {
          const assignId = payload.assignmentId.toString()
          const reqParamsPayload = { params: { tenantId: tenantId, assignmentId: assignId },
            enableRbac: isEntitlementRbacApiEnabled }
          await executeDeleteAssignmentCall(reqParamsPayload)
        }
      } else {
        await executeDeleteAssignmentCall({ payload: deleteAssignment })
      }

      navigate(linkToSubscriptions, { replace: true })
    } catch (error) {
      const respData = error as CatchErrorResponse<CatchErrorDetails>
      handleSubmitFailed(respData)
    }
  }

  const checkAvailableLicense =
  (entitlements: EntitlementSummaries[], apswLic?: number, apswTrialLic?: number,
    solutionTokenLic?: number, solutionTokenTrialLic?: number) => {

    const apswLicenses = entitlements.filter(p => p.remainingQuantity > 0 &&
      p.licenseType === EntitlementDeviceType.APSW && p.isTrial === false)
    let remainingApsw = 0
    apswLicenses.forEach( (lic: EntitlementSummaries) => {
      remainingApsw += lic.remainingQuantity
    })
    setAvailableApswLicense(remainingApsw + (apswLic || 0))

    const apswTrialLicenses = entitlements.filter(p => p.remainingQuantity > 0 &&
      p.licenseType === EntitlementDeviceType.APSW && p.isTrial === true)
    let remainingApswTrial = 0
    apswTrialLicenses.forEach( (lic: EntitlementSummaries) => {
      remainingApswTrial += lic.remainingQuantity
    })
    setAvailableApswTrialLicense(remainingApswTrial + (apswTrialLic || 0))

    const solutionTokenLicenses = entitlements.filter(p => p.remainingQuantity > 0 &&
      p.licenseType === EntitlementDeviceType.SLTN_TOKEN && p.isTrial === false)
    let remainingSolutionToken = 0
    solutionTokenLicenses.forEach( (lic: EntitlementSummaries) => {
      remainingSolutionToken += lic.remainingQuantity
    })
    setAvailableSolutionTokenLicense(remainingSolutionToken + (solutionTokenLic || 0))

    const solutionTokenTrialLicenses = entitlements.filter(p => p.remainingQuantity > 0 &&
      p.licenseType === EntitlementDeviceType.SLTN_TOKEN && p.isTrial === true)
    let remainingSolutionTokenTrial = 0
    solutionTokenTrialLicenses.forEach( (lic: EntitlementSummaries) => {
      remainingSolutionTokenTrial += lic.remainingQuantity
    })
    setAvailableSolutionTokenTrialLicense(remainingSolutionTokenTrial
      + (solutionTokenTrialLic || 0))

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

  const onSelectChange = (value: string, licenseType?: EntitlementDeviceType) => {
    if (value === DateSelectionEnum.CUSTOME_DATE) {
      licenseType === EntitlementDeviceType.SLTN_TOKEN
        ? setSltnCustomDate(true)
        : setCustomeDate(true)
    } else {
      const expirationDate = getSelectExpirationDate(value)

      if (licenseType === EntitlementDeviceType.SLTN_TOKEN) {
        form.setFieldsValue({
          sltnServiceExpirationDate: expirationDate
        })
        setSltnCustomDate(false)
      } else {
        form.setFieldsValue({
          serviceExpirationDate: expirationDate
        })
        setCustomeDate(false)
      }
    }
  }

  const onTrialSelectChange = (value: string, licenseType?: EntitlementDeviceType) => {
    if (value === DateSelectionEnum.CUSTOME_DATE) {
      licenseType === EntitlementDeviceType.SLTN_TOKEN
        ? setSltnCustomTrialDate(true)
        : setCustomeTrialDate(true)
    } else {
      const expirationDate = getSelectExpirationDate(value)
      if (licenseType === EntitlementDeviceType.SLTN_TOKEN) {
        form.setFieldsValue({
          sltnTrialServiceExpirationDate: expirationDate
        })
        setSltnCustomTrialDate(false)
      } else {
        form.setFieldsValue({
          trialServiceExpirationDate: expirationDate
        })
        setCustomeTrialDate(false)
      }
    }
  }

  const EditCustomerSubscriptionForm = () => {
    return <div>
      <Subtitle level={3}>
        { intl.$t({ defaultMessage: 'Subscriptions' }) }</Subtitle>

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
      </UI.FieldLabelSubs>}</div>

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
            <Select onChange={(value) => onSelectChange(value)}>
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
          { intl.$t({ defaultMessage: 'Device Networking Paid Licenses' }) }</Subtitle>
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
              <Select onChange={(value) => onSelectChange(value)}>
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
          { intl.$t({ defaultMessage: 'Device Networking Trial Licenses' }) }</Subtitle>
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
              <Select onChange={(value) => onTrialSelectChange(value)}>
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

      { (availableSolutionTokenLicense > 0)
      && <div style={{ marginTop: '25px' }}>
        <Subtitle level={4}>
          { intl.$t({ defaultMessage: 'Solution Tokens Paid Licenses' }) }</Subtitle>
        <UI.FieldLabelSubs2 width='315px'>
          <label>{intl.$t({ defaultMessage: 'Assigned Solution Tokens' })}</label>
          <Form.Item
            name='sltnLicenses'
            label=''
            initialValue={0}
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please enter device subscription' })
              },
              { validator: (_, value) => fieldValidator(value, availableSolutionTokenLicense) }
            ]}
            children={<InputNumber/>}
            style={{ paddingRight: '20px' }}
          />
          <label>
            {intl.$t({ defaultMessage:
            'paid licenses out of {availableSolutionTokenLicense} available' }, {
              availableSolutionTokenLicense })}
          </label>
        </UI.FieldLabelSubs2>

        <UI.FieldLabel2 width='275px'>
          <label>{intl.$t({ defaultMessage: 'Subscription Start Date' })}</label>
          <label>{formatter(DateFormatEnum.DateFormat)(subscriptionStartDate)}</label>
        </UI.FieldLabel2>

        <UI.FieldLabeServiceDate width='275px' style={{ marginTop: '10px' }}>
          <label>{intl.$t({ defaultMessage: 'Paid Licenses Expiration Date' })}</label>
          <Form.Item
            name='sltnExpirationDateSelection'
            label=''
            rules={[{ required: true } ]}
            initialValue={DateSelectionEnum.CUSTOME_DATE}
            children={
              <Select onChange={(value) => onSelectChange(value, EntitlementDeviceType.SLTN_TOKEN)}>
                {
                  Object.entries(DateSelectionEnum).map(([label, value]) => (
                    <Option key={label} value={value}>{intl.$t(dateDisplayText[value])}</Option>
                  ))
                }
              </Select>
            }
          />
          <Form.Item
            name='sltnServiceExpirationDate'
            label=''
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please select expiration date' })
              }
            ]}
            children={
              <DatePicker
                format={formatter(DateFormatEnum.DateFormat)}
                disabled={!sltnCustomDate}
                disabledDate={(current) => {
                  return current && current < moment().endOf('day')
                }}
                style={{ marginLeft: '4px' }}
              />
            }
          />
        </UI.FieldLabeServiceDate>
      </div>}

      { (availableSolutionTokenTrialLicense > 0)
      && <div style={{ marginTop: '25px' }}>
        <Subtitle level={4}>
          { intl.$t({ defaultMessage: 'Solution Tokens Trial Licenses' }) }</Subtitle>
        <UI.FieldLabelSubs2 width='315px'>
          <label>{intl.$t({ defaultMessage: 'Assigned Solution Tokens' })}</label>
          <Form.Item
            name='sltnTrialLicenses'
            label=''
            initialValue={0}
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please enter device subscription' })
              },
              { validator: (_, value) => fieldValidator(value, availableSolutionTokenTrialLicense) }
            ]}
            children={<InputNumber/>}
            style={{ paddingRight: '20px' }}
          />
          <label>
            {intl.$t({ defaultMessage:
            'trial licenses out of {availableSolutionTokenTrialLicense} available' }, {
              availableSolutionTokenTrialLicense })}
          </label>
        </UI.FieldLabelSubs2>

        <UI.FieldLabel2 width='275px'>
          <label>{intl.$t({ defaultMessage: 'Subscription Start Date' })}</label>
          <label>{formatter(DateFormatEnum.DateFormat)(subscriptionStartDate)}</label>
        </UI.FieldLabel2>

        <UI.FieldLabeServiceDate width='275px' style={{ marginTop: '10px' }}>
          <label>{intl.$t({ defaultMessage: 'Trial Licenses Expiration Date' })}</label>
          <Form.Item
            name='sltnExpirationDateSelection'
            label=''
            rules={[{ required: true } ]}
            initialValue={DateSelectionEnum.CUSTOME_DATE}
            children={
              <Select onChange={(value) => onTrialSelectChange(value,
                EntitlementDeviceType.SLTN_TOKEN)}>
                {
                  Object.entries(DateSelectionEnum).map(([label, value]) => (
                    <Option key={label} value={value}>{intl.$t(dateDisplayText[value])}</Option>
                  ))
                }
              </Select>
            }
          />
          <Form.Item
            name='sltnTrialServiceExpirationDate'
            label=''
            rules={[
              { required: true,
                message: intl.$t({ defaultMessage: 'Please select expiration date' })
              }
            ]}
            children={
              <DatePicker
                format={formatter(DateFormatEnum.DateFormat)}
                disabled={!sltnCustomTrialDate}
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
