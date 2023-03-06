import { useEffect, useState } from 'react'

import {
  Switch,
  Form,
  Row,
  Col,
  Input
} from 'antd'
import { PhoneNumberUtil } from 'google-libphonenumber'
import _                   from 'lodash'
import { FieldData }       from 'rc-field-form/lib/interface'
import { useIntl }         from 'react-intl'
import styled              from 'styled-components/macro'

import { Modal, showToast }    from '@acx-ui/components'
import {
  useAddRecipientMutation,
  useUpdateRecipientMutation
} from '@acx-ui/rc/services'
import {
  NotificationRecipientUIModel,
  NotificationEndpointType,
  emailRegExp,
  phoneRegExp,
  CatchErrorResponse
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { dialogStyles } from './styledComponents'

export interface RecipientDialogProps {
  className?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editMode: boolean;
  editData: NotificationRecipientUIModel;
  isDuplicated: (type: string, value: string) => boolean;
}

interface RecipientSaveModel {
  id?: string;    // editMode used
  description: string;
  endpoints: {
    id?: string;  // editMode used
    active: boolean;
    destination: string;
    type: string;
  }[];
}

const RecipientDialog = (props: RecipientDialogProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const {
    className,
    visible,
    setVisible,
    editMode,
    editData,
    isDuplicated
  } = props
  const [isChanged, setIsChanged] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const examplePhoneNumber = PhoneNumberUtil.getInstance().getExampleNumber('US')
  const [addRecipient, addState] = useAddRecipientMutation()
  const [updateRecipient, updateState] = useUpdateRecipientMutation()

  const emailInputVal = Form.useWatch('email', form)
  const mobileInputVal = Form.useWatch('mobile', form)

  const getSavePayload = (data: NotificationRecipientUIModel) => {
    let dataToSave = {
      description: data.description,
      endpoints: []
    } as RecipientSaveModel

    const emailVal = data.email?.trim()
    const mobileVal = data.mobile?.trim()
    if (editMode) {
      dataToSave.id = data.id

      // need endpoint "id", it will tell API do endpint update
      // without it API will try to create new endpoint
      dataToSave.endpoints = data.endpoints.map((point) =>
        _.pick(point, ['id', 'active', 'destination', 'type'])
      )

      let endpoint = dataToSave.endpoints.find(e => e.type === NotificationEndpointType.email)
      if (endpoint) {
        endpoint.destination = emailVal
        endpoint.active = data.emailEnabled
      } else if (emailVal) {
        dataToSave.endpoints.push({
          active: data.emailEnabled,
          destination: emailVal,
          type: NotificationEndpointType.email
        })
      }

      endpoint = dataToSave.endpoints.find(e => e.type === NotificationEndpointType.sms)
      if (endpoint) {
        endpoint.destination = mobileVal
        endpoint.active = data.mobileEnabled
      } else if (mobileVal) {
        dataToSave.endpoints.push({
          active: data.mobileEnabled,
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
    } else {
      if (emailVal) {
        dataToSave.endpoints.push({
          active: data.emailEnabled,
          destination: emailVal,
          type: NotificationEndpointType.email
        })
      }
      if (mobileVal) {
        dataToSave.endpoints.push({
          active: data.mobileEnabled,
          destination: mobileVal,
          type: NotificationEndpointType.sms
        })
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

  const checkOptionFieldsEntered = ():boolean => {
    return mobileInputVal || emailInputVal
  }

  const handleInputChange = (changedFields: FieldData[]) => {
    const changedField = changedFields[0]
    const changedFieldName = changedField.name.toString()
    const value = changedField.value

    const errors = form.getFieldsError()
    setIsValid(errors.some((field) => field.errors.length > 0) === false)
    setIsChanged(true)

    if (changedFieldName === 'email') {
      if (changedField.errors?.length === 0)
        form.setFieldValue('emailEnabled', Boolean(value.trim()))
    }

    if (changedFieldName === 'mobile') {
      if (changedField.errors?.length === 0)
        form.setFieldValue('mobileEnabled', Boolean(value.trim()))
    }
  }

  const handleSubmit = async () => {
    const allData = form.getFieldsValue(true)
    const payload = getSavePayload(allData)

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
      if (errors.find(e => e.code === 'TNT-10100')) {
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

  const handleClose = () => {
    setVisible(false)
    form.resetFields()
  }

  useEffect(()=>{
    if (editData && visible) {
      form.setFieldsValue(editData)
    }
  }, [form, editData, visible])

  const isLoading = addState.isLoading || updateState.isLoading
  const disableSave = !(isChanged && checkOptionFieldsEntered() && isValid)

  return (
    <Modal
      className={className}
      visible={visible}
      title={
        editMode
          ? $t({ defaultMessage: 'Edit Recipient' })
          : $t({ defaultMessage: 'Add New Recipient' })
      }
      okText={$t({ defaultMessage: 'Save' })}
      keyboard={false}
      maskClosable={false}
      onOk={() => form.submit()}
      onCancel={handleClose}
      okButtonProps={{ disabled: disableSave || isLoading }}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        onFieldsChange={handleInputChange}
      >
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

        <Form.Item
          required
          label={$t({ defaultMessage: 'You must define at least one of the following:' })}
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
              <Form.Item
                noStyle
                name='emailEnabled'
                valuePropName='checked'
                initialValue={false}
              >
                <Switch />
              </Form.Item>
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
                  { validator: (_, value) => phoneRegExp(value) }
                ]}
                noStyle
                initialValue=''
              >
                <Input
                  // eslint-disable-next-line max-len
                  placeholder={`+${examplePhoneNumber.getCountryCode()} ${examplePhoneNumber.getNationalNumberOrDefault()}`}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                noStyle
                name='mobileEnabled'
                valuePropName='checked'
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default styled(RecipientDialog)`${dialogStyles}`
