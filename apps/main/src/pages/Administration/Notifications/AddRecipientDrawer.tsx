import { useEffect, useState } from 'react'

import {
  Switch,
  Form,
  Row,
  Col,
  Input,
  Radio,
  Space,
  RadioChangeEvent
} from 'antd'
import _             from 'lodash'
import { FieldData } from 'rc-field-form/lib/interface'
import { useIntl }   from 'react-intl'
import styled        from 'styled-components'

import { Button, Drawer, Select, showToast, Subtitle } from '@acx-ui/components'
import { PhoneInput }                                  from '@acx-ui/rc/components'
import {
  useAddRecipientMutation,
  useGetPrivilegeGroupsQuery,
  useUpdateRecipientMutation
} from '@acx-ui/rc/services'
import {
  NotificationRecipientUIModel,
  NotificationEndpointType,
  emailRegExp,
  generalPhoneRegExp,
  NotificationRecipientType
} from '@acx-ui/rc/utils'
import { useParams }          from '@acx-ui/react-router-dom'
import { RolesEnum }          from '@acx-ui/types'
import { roleStringMap }      from '@acx-ui/user'
import { CatchErrorResponse } from '@acx-ui/utils'

import * as UI from './styledComponents'

export interface RecipientDrawerProps {
  className?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editMode: boolean;
  editData: NotificationRecipientUIModel;
  isDuplicated: (type: string, value: string) => boolean;
  RecipientData?: NotificationRecipientUIModel[]
}

interface Recipient {
    id?: string;    // editMode used
    description: string;
}

interface GlobalRecipient extends Recipient {
    emailPreferences?: never;
    smsPreferences?: never;
    privilegeGroupId?: never;
    endpoints: {
        id?: string;  // editMode used
        active: boolean;
        destination: string;
        type: string;
    }[];
}

interface AdminRecipient extends Recipient {
    emailPreferences: boolean;
    smsPreferences: boolean;
    privilegeGroupId: string
    endpoints?: never;
}

type RecipientSaveModel = GlobalRecipient | AdminRecipient

enum RecipientType {
  GlobalRecipient = 'GlobalRecipient',
  AdminRecipient = 'AdminRecipient'
}

const AddRecipientDrawer = (props: RecipientDrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const {
    className,
    visible,
    setVisible,
    editMode,
    editData,
    isDuplicated,
    RecipientData
  } = props
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recipientType, setRecipientType] = useState(RecipientType.GlobalRecipient)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [mobileEnabled, setMobileEnabled] = useState(false)
  const [emailSwitchDisabled, setEmailSwitchDisabled] = useState(true)
  const [mobileSwitchDisabled, setMobileSwitchDisabled] = useState(true)
  const [emailPreferences, setEmailPreferences] = useState(false)
  const [smsPreferences, setSmsPreferences] = useState(false)
  const [addRecipient, addState] = useAddRecipientMutation()
  const [updateRecipient, updateState] = useUpdateRecipientMutation()

  const { data: privilegeGroupList } = useGetPrivilegeGroupsQuery({ params })

  const groupList = privilegeGroupList?.map((item) => ({
    label: roleStringMap[item.name as RolesEnum]
      ? $t(roleStringMap[item.name as RolesEnum]) : item.name,
    value: item.id
  }))

  const existingPgList = RecipientData?.filter((item) =>
    item.recipientType === NotificationRecipientType.PRIVILEGEGROUP)

  useEffect(()=>{
    if (editData && visible) {
      form.setFieldsValue(editData)
      if (editData.privilegeGroup) {
        form.setFieldValue('description', '')
      }
      setEmailEnabled(editData.emailEnabled)
      setMobileEnabled(editData.mobileEnabled)
      setEmailSwitchDisabled(editData.email ? false : true)
      setMobileSwitchDisabled(editData.mobile ? false : true)
      setEmailPreferences(editData.emailPreferences ?? false)
      setSmsPreferences(editData.smsPreferences ?? false)
    }
    const recipient = editData?.privilegeGroup
      ? RecipientType.AdminRecipient
      : RecipientType.GlobalRecipient
    setRecipientType(recipient)
    form.setFieldValue('recipientType', recipient)
  }, [form, editData, visible])

  useEffect(() => {
    setLoading(addState.isLoading || updateState.isLoading)
  }, [addState.isLoading, updateState.isLoading])

  const getSavePayload = (data: NotificationRecipientUIModel) => {
    let dataToSave = {} as RecipientSaveModel

    if (recipientType === RecipientType.AdminRecipient) {
      if (editMode) {
        dataToSave.id = data.id
      }
      dataToSave.privilegeGroupId = data.privilegeGroup
      dataToSave.smsPreferences = smsPreferences
      dataToSave.emailPreferences = emailPreferences
    }
    else if (recipientType === RecipientType.GlobalRecipient) {
      dataToSave.description = data.description
      dataToSave.endpoints = []
      const emailVal = data.email?.trim()
      const mobileVal = data.mobile?.trim()

      if (editMode) {
        dataToSave.id = data.id

        // need endpoint "id", it will tell API do endpoint update
        // without it API will try to create new endpoint
        // also check data.endpoints may be undefined if admin recipient was edited to global recipient
        dataToSave.endpoints = data.endpoints?.map((point) =>
          _.pick(point, ['id', 'active', 'destination', 'type'])
        ) ?? []

        let endpoint = dataToSave.endpoints.find(e => e.type === NotificationEndpointType.email)
        if (endpoint) {
          endpoint.destination = emailVal
          endpoint.active = emailEnabled
        } else if (emailVal) {
          dataToSave.endpoints.push({
            active: emailEnabled,
            destination: emailVal,
            type: NotificationEndpointType.email
          })
        }

        endpoint = dataToSave.endpoints.find(e => e.type === NotificationEndpointType.sms)
        if (endpoint) {
          endpoint.destination = mobileVal
          endpoint.active = mobileEnabled
        } else if (mobileVal) {
          dataToSave.endpoints.push({
            active: mobileEnabled,
            destination: mobileVal,
            type: NotificationEndpointType.sms
          })
        }

        // clear empty endpoints
        for (let i = 0; i < dataToSave.endpoints.length; i++) {
          if (dataToSave.endpoints[i].destination === '') {
            dataToSave.endpoints.splice(i, 1)
          }
        }
      }
      else {
        if (emailVal) {
          dataToSave.endpoints?.push({
            active: emailEnabled,
            destination: emailVal,
            type: NotificationEndpointType.email
          })
        }
        if (mobileVal) {
          dataToSave.endpoints?.push({
            active: mobileEnabled,
            destination: mobileVal,
            type: NotificationEndpointType.sms
          })
        }
      }
    }
    return dataToSave
  }

  const findDuplicateEndpoints = (data: NotificationRecipientUIModel) => {
    return {
      duplicatePhone: isDuplicated(NotificationEndpointType.sms, data.mobile),
      duplicateEmail: isDuplicated(NotificationEndpointType.email, data.email)
    }
  }

  const getIsValid = () => {
    const errors = form.getFieldsError()
    const hasErrors = errors.some((field) => field.errors.length > 0)
    const { description, privilegeGroup } = form.getFieldsValue()
    if (recipientType === RecipientType.GlobalRecipient) {
      return !hasErrors && description && (emailEnabled || mobileEnabled)
    }
    if (recipientType === RecipientType.AdminRecipient) {
      return !hasErrors && privilegeGroup
        && (emailPreferences || smsPreferences)
    }
    return false
  }

  const handleInputChange = (changedFields: FieldData[]) => {
    const changedFieldName = changedFields[0].name.toString()
    const { email, mobile } = form.getFieldsValue()

    if (recipientType === RecipientType.GlobalRecipient) {
      if (changedFieldName === 'email') {
        setEmailEnabled(!_.isEmpty(email?.trim()))
        setEmailSwitchDisabled(_.isEmpty(email?.trim()))
      }
      if (changedFieldName === 'mobile') {
        setMobileEnabled(!_.isEmpty(mobile?.trim()))
        setMobileSwitchDisabled(_.isEmpty(mobile?.trim()))
      }
    }
    setIsValid(getIsValid())
  }

  useEffect(() => {
    setIsValid(getIsValid())
  }, [emailEnabled, mobileEnabled, emailPreferences, smsPreferences])

  const handleSubmit = async () => {
    const allData = form.getFieldsValue(true)
    const payload = getSavePayload(allData)
    try {
      await form.validateFields()
    } catch(err) {
      return
    }

    try {
      if (editMode) {
        await updateRecipient({
          params: {
            tenantId: params.tenantId,
            recipientId: editData.id
          },
          payload
        }).unwrap()
      } else {
        await addRecipient({ params, payload }).unwrap()
      }

      handleClose()
    } catch(err) {
      const respData = err as CatchErrorResponse
      const errors = respData.data.errors

      let errMsg: string
      if (errors?.find(e => e.code === 'TNT-10100')) {
        errMsg = errors[0].message

        const duplicateEndpoints = findDuplicateEndpoints(allData)
        if (duplicateEndpoints.duplicatePhone && duplicateEndpoints.duplicateEmail) {
          // eslint-disable-next-line max-len
          errMsg = $t({ defaultMessage: 'The email address and mobile phone number you entered are already defined for another recipient. Please use unique address and number.' })
        } else if (duplicateEndpoints.duplicatePhone) {
          // eslint-disable-next-line max-len
          errMsg = $t({ defaultMessage: 'The mobile phone number you entered is already defined for another recipient. Please use a unique number.' })
        } else if (duplicateEndpoints.duplicateEmail) {
          // eslint-disable-next-line max-len
          errMsg = $t({ defaultMessage: 'The email address you entered is already defined for another recipient. Please use an unique address.' })
        }
      } else {
        errMsg = errors[0].message
      }

      showToast({
        type: 'error',
        duration: 10,
        content: $t({ defaultMessage: 'An error occurred: {error}' }, {
          error: errMsg
        })
      })
    }
  }

  const resetValues = () => {
    setIsValid(false)
    setEmailEnabled(false)
    setMobileEnabled(false)
    setEmailSwitchDisabled(true)
    setMobileSwitchDisabled(true)
    setEmailPreferences(false)
    setSmsPreferences(false)
    form.resetFields()
  }

  const handleClose = () => {
    setVisible(false)
    resetValues()
  }

  const setPhoneValue = (phoneNumber: string) => {
    form.setFieldValue('mobile', phoneNumber)
    form.validateFields(['mobile'])
  }

  const handleRecipientTypeChange = (e: RadioChangeEvent) => {
    setRecipientType(e.target.value)
  }

  const validatePrivilegeGroup = (value: string) =>{
    if (existingPgList?.find(e => e.privilegeGroup === value) &&
      editData.privilegeGroup !== value) {
      return Promise.reject($t({ defaultMessage: 'Privilege Group already exists' }))
    }
    return Promise.resolve()
  }

  const GlobalRecipientContent =
    <>
      <Form.Item
        name='description'
        label={$t({ defaultMessage: 'Name' })}
        rules={[
          { required: true },
          { max: 255 }
        ]}
      >
        <Input/>
      </Form.Item>

      <Subtitle level={5}>
        {$t({ defaultMessage: 'Delivery Preference' })}
      </Subtitle>
      <Form.Item
        required
        label={$t({ defaultMessage: 'At least one delivery method must be defined.' })}
        className='email_mobile_help'
      />

      <Form.Item
        label={$t({ defaultMessage: 'Email Address' })}
      >
        <Row align='middle' justify='space-between'>
          <Col span={18}>
            <Form.Item
              name='email'
              rules={[
                { validator: (_, value) => emailRegExp(value) }
              ]}
              noStyle
              initialValue=''
            >
              <Input
                placeholder={$t({ defaultMessage: 'Email' })}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Switch checked={emailEnabled}
              onChange={setEmailEnabled}
              disabled={emailSwitchDisabled}/>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'Mobile Number' })}
      >
        <Row align='middle' justify='space-between'>
          <Col span={18}>
            <Form.Item
              name='mobile'
              rules={[
                { validator: (_, value) => generalPhoneRegExp(value) }
              ]}
              noStyle
              initialValue=''
              validateFirst
            >
              <UI.PhoneInputWrapper>
                <PhoneInput name={'mobile'} callback={setPhoneValue} onTop={true} />
              </UI.PhoneInputWrapper>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Switch checked={mobileEnabled}
              onChange={setMobileEnabled}
              disabled={mobileSwitchDisabled}/>
          </Col>
        </Row>
      </Form.Item>
    </>

  const AdminRecipientContent =
    <>
      <Form.Item
        name='privilegeGroup'
        label={$t({ defaultMessage: 'Privilege Group Name' })}
        rules={[
          { required: true },
          { validator: (_, value) => validatePrivilegeGroup(value) }
        ]}
        validateFirst
      >
        <Select
          options={groupList}
          placeholder={$t({ defaultMessage: 'Select Group' })}
        />
      </Form.Item>

      <Subtitle level={5}>
        {$t({ defaultMessage: 'Delivery Preference' })}
      </Subtitle>
      <Form.Item
        required
        label={$t({ defaultMessage: 'At least one delivery method must be defined.' })}
        className='email_mobile_help'
      />

      <UI.FieldLabel width={'45px'}>
        <Col span={4}>
          <Switch data-testid='enableEmailNotification'
            checked={emailPreferences}
            onChange={setEmailPreferences}/>
        </Col>
        <Space align='start'>
          { $t({ defaultMessage: 'Enable Email Notifications' }) }
        </Space>
      </UI.FieldLabel>

      <UI.FieldLabel width={'45px'}>
        <Col span={4}>
          <Switch data-testid='enableSmsNotification'
            checked={smsPreferences}
            onChange={setSmsPreferences}/>
        </Col>
        <Space align='start'>
          { $t({ defaultMessage: 'Enable SMS Notifications' }) }
        </Space>
      </UI.FieldLabel>
    </>

  return (
    <Drawer
      className={className}
      title={
        editMode
          ? $t({ defaultMessage: 'Edit Recipient' })
          : $t({ defaultMessage: 'Add Recipient' })
      }
      width={430}
      visible={visible}
      onClose={handleClose}
      footer={
        <div>
          <Button
            disabled={!isValid || loading}
            onClick={handleSubmit}
            type='primary'
          >
            {editMode ? $t({ defaultMessage: 'Save' })
              : $t({ defaultMessage: 'Add' }) }
          </Button>
          <Button onClick={handleClose}>
            {$t({ defaultMessage: 'Cancel' })}
          </Button>
        </div>
      }

    >
      <Form
        form={form}
        layout='vertical'
        onFieldsChange={handleInputChange}
      >
        <Form.Item
          name='recipientType'
          initialValue={recipientType}
          rules={[
            { required: true, message: $t({ defaultMessage: 'Please select a recipient type' }) }
          ]}
        >
          <Radio.Group
            onChange={handleRecipientTypeChange}
            value={recipientType}
          >
            <Space direction='vertical'>
              <Radio value={RecipientType.GlobalRecipient}>
                {$t({ defaultMessage: 'Add global recipient' })}
              </Radio>
              <Radio value={RecipientType.AdminRecipient}>
                {$t({ defaultMessage: 'Add Privilege Group as recipient' })}
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {recipientType as RecipientType === RecipientType.GlobalRecipient
          ? GlobalRecipientContent
          : AdminRecipientContent}
      </Form>
    </Drawer>
  )
}
export default styled(AddRecipientDrawer)`${UI.dialogStyles}`