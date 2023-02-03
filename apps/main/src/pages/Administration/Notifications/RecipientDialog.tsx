import { useEffect } from 'react'

import {
  Switch,
  // ModalProps as AntdModalProps,
  Form,
  Row,
  Col,
  // Space,
  Input,
  Typography
} from 'antd'
import { PhoneNumberUtil } from 'google-libphonenumber'
import { useIntl }         from 'react-intl'

import { Modal, showToast }    from '@acx-ui/components'
import {
  useAddRecipientMutation,
  useUpdateRecipientMutation
} from '@acx-ui/rc/services'
import { NotificationRecipient, NotificationEndpointType, emailRegExp, phoneRegExp } from '@acx-ui/rc/utils'
import { useParams }                                                                 from '@acx-ui/react-router-dom'

  interface RecipientDialogProps {
    visible: boolean;
    editMode: boolean;
    editData: NotificationRecipient;
  }

  interface RecipientSaveModel {
    description: string;
    endpoints: {
      active: boolean;
      destination: string;
      type: string;

    }[];
  }

const RecipientDialog = (props: RecipientDialogProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const { visible, editMode, editData } = props
  const examplePhoneNumber = PhoneNumberUtil.getInstance().getExampleNumber('US')
  const [addRecipient, addState] = useAddRecipientMutation()
  const [updateRecipient, updateState] = useUpdateRecipientMutation()

  const getSavePayload = (data: NotificationRecipient) => {
    let dataToSave = {} as RecipientSaveModel

    if (editMode) {
      // TODO
    } else {
      dataToSave = {
        description: data.name,
        endpoints: []
      }

      if (data.email.trim()) {
        dataToSave.endpoints.push({
          active: data.emailEnabled,
          destination: data.email.trim(),
          type: NotificationEndpointType.email
        })
      }
      if (data.mobile.trim()) {
        dataToSave.endpoints.push({
          active: data.mobileEnabled,
          destination: data.mobile.trim(),
          type: NotificationEndpointType.sms
        })
      }
    }

    return dataToSave
  }

  const handleSubmit = async (data: NotificationRecipient) => {
    const payload = getSavePayload(data)
    try {
      if (editMode) {
        await updateRecipient({ params, payload }).unwrap()
      } else {
        await addRecipient({ params, payload }).unwrap()
      }
    } catch(error) {
      const responseData = error as { status: number, data: { [key: string]: string } }

      // if (responseData.data.error.find(e => e.code === 'TNT-10100')) {
      //   let errMsg = error.errors[0].message
      //   const duplicateEndpoints = this.findDuplicateEndpoints(beModel)
      //   if (duplicateEndpoints.duplicatePhone && duplicateEndpoints.duplicateEmail) {
      //     errMsg = 'The email address and mobile phone number you entered are already defined for another recipient. Please use unique address and number.'
      //   } else if (duplicateEndpoints.duplicatePhone) {
      //     errMsg = 'The mobile phone number you entered is already defined for another recipient. Please use a unique number.'
      //   } else if (duplicateEndpoints.duplicateEmail) {
      //     errMsg = 'The email address you entered is already defined for another recipient. Please use an unique address.'
      //   }
      // }

      showToast({
        type: 'error',
        duration: 10,
        content: $t({ defaultMessage: 'An error occurred: {error}' }, {
          error: responseData.data.error
        })
      })
    }
  }

  const handleEmailChange = () => {}
  const handleEmailEnabledStateChanged = () => {
    // TODO: control save button disabled
    //       Added condition to check email switch on/off
  }

  const handleMobileChange = () => {}
  const handleMobileEnabledStateChanged = () => {
    // TODO: control save button disabled
    //       Added condition to check mobile switch on/off
  }

  useEffect(()=>{
    if (editData && visible) {
      form.setFieldsValue(editData)
    }
  }, [form, editData, visible])

  // TODO: on change  & validate
  // this.disableSave = !this.checkAllRequiredFieldsEntered() || !this.recipientForm.valid;

  const isLoading = addState.isLoading || updateState.isLoading
  const disableSave = editMode

  return (
    <Modal
      visible={visible}
      title={
        editMode
          ? $t({ defaultMessage: 'Edit Recipient' })
          : $t({ defaultMessage: 'Add New Recipient' })
      }
      okText={
        editMode
          ? $t({ defaultMessage: 'OK' })
          : $t({ defaultMessage: 'Save' })
      }
      keyboard={false}
      closable={true}
      width={840}
      onOk={() => form.submit()}
      okButtonProps={{ disabled: disableSave || isLoading }}
    >
      <Form
        form={form}
        layout='horizontal'
        onFinish={handleSubmit}
      >
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Name' })}
        >
          <Input/>
        </Form.Item>

        <Typography.Text>
          {$t({ defaultMessage: 'You must define at least one of the following:' })}
        </Typography.Text>

        <Form.Item
          label={$t({ defaultMessage: 'Email Address' })}
        >
          <Row>
            <Col span={20}>
              <Form.Item
                name='email'
                rules={[
                  { validator: (_, value) => emailRegExp(value) }
                ]}
                initialValue={''}
                noStyle
              >
                <Input onChange={handleEmailChange} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                noStyle
                name='emailEnabled'
              >
                <Switch
                  onChange={handleEmailEnabledStateChanged}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item
          label={$t({ defaultMessage: 'Mobile Number' })}
        >
          <Row>
            <Col span={20}>
              <Form.Item
                name='mobilePhoneNumber'
                rules={[
                  { validator: (_, value) => phoneRegExp(value) }
                ]}
                initialValue={null}
                noStyle
              >
                <Input
                  // eslint-disable-next-line max-len
                  placeholder={`+${examplePhoneNumber.getCountryCode()} ${examplePhoneNumber.getNationalNumberOrDefault()}`}
                  onChange={handleMobileChange}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                noStyle
                name='mobileEnabled'
              >
                <Switch
                  onChange={handleMobileEnabledStateChanged}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RecipientDialog

