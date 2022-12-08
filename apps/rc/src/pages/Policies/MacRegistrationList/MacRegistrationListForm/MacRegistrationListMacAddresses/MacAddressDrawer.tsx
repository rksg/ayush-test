import React, { useEffect, useState } from 'react'

import { Col, DatePicker, Form, Input, Row, Space } from 'antd'
import { Radio }                                    from 'antd'
import moment                                       from 'moment-timezone'
import { useIntl }                                  from 'react-intl'

import { Drawer, showToast }                                               from '@acx-ui/components'
import { useAddMacRegistrationMutation, useUpdateMacRegistrationMutation } from '@acx-ui/rc/services'
import {
  MacRegistration
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { dateValidationRegExp, macAddressRegExp } from '../../MacRegistrationListUtils'

interface MacAddressDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit: boolean
  editData?: MacRegistration
}

export function MacAddressDrawer (props: MacAddressDrawerProps) {
  const intl = useIntl()
  const { visible, setVisible, isEdit, editData } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()
  const [ isExpired, addType ] = [ Form.useWatch('listExpiration', form),
    Form.useWatch('importAction', form)]
  const [addMacRegistration] = useAddMacRegistrationMutation()
  const [editMacRegistration] = useUpdateMacRegistrationMutation()
  const { policyId } = useParams()

  useEffect(()=>{
    if (editData && visible) {
      form.setFieldsValue(editData)
      form.setFieldValue('expirationDate', moment(editData.expirationDate))
      form.setFieldValue('listExpiration', 2)
    }
  }, [editData, visible])

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const onSubmit = async (data: MacRegistration) => {
    try {
      if (isEdit) {
        const payload = {
          username: data.username?.length === 0 ? null : data.username,
          // deviceName: data.deviceName,
          email: data.email?.length === 0 ? null : data.email,
          expirationDate: data.listExpiration === 1 ? null :
            moment(data.expirationDate).format('YYYY-MM-DDT23:59:59[Z]')
        }
        await editMacRegistration(
          {
            params: { policyId, registrationId: editData?.id },
            payload
          }).unwrap()
      } else {
        const payload = {
          macAddress: data.macAddress,
          username: data.username?.length === 0 ? null : data.username,
          // deviceName: data.deviceName,
          email: data.email?.length === 0 ? null : data.email,
          expirationDate: data.listExpiration === 1 ? null :
            moment(data.expirationDate).format('YYYY-MM-DDT23:59:59[Z]')
        }
        await addMacRegistration({
          params: { policyId },
          payload
        }).unwrap()
      }
      onClose()
    } catch (error) {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' }),
        // FIXME: Correct the error message
        link: { onClick: () => alert(JSON.stringify(error)) }
      })
    }
  }

  const addManuallyContent = <Row>
    <Col span={16}>
      <Form.Item name='macAddress'
        label={intl.$t({ defaultMessage: 'MAC Address' })}
        rules={[
          { required: true, message: intl.$t({ defaultMessage: 'Please enter MAC Address' }) },
          { validator: (_, value) => macAddressRegExp(value) }
        ]}>
        <Input disabled={isEdit}/>
      </Form.Item>
      <Form.Item name='username' label={intl.$t({ defaultMessage: 'Username' })}>
        <Input/>
      </Form.Item>
      <Form.Item name='deviceName' label={intl.$t({ defaultMessage: 'DeviceName' })}>
        <Input/>
      </Form.Item>
      <Form.Item name='email'
        rules={[
          { type: 'email', message: intl.$t({ defaultMessage: 'E-mail is not a valid email' }) }
        ]}
        label={intl.$t({ defaultMessage: 'E-mail' })}>
        <Input/>
      </Form.Item>
      <Form.Item name='listExpiration'
        label={intl.$t({ defaultMessage: 'MAC Address Expiration' })}
        initialValue={1}>
        <Radio.Group>
          <Space direction='vertical'>
            <Radio value={1}>{intl.$t({ defaultMessage: 'Never expires (Same as list)' })}</Radio>
            <Space>
              <Radio value={2}>{intl.$t({ defaultMessage: 'By date' })}</Radio>
              { isExpired === 2 &&
                <Form.Item
                  name='expirationDate'
                  rules={[
                    { required: true,
                      message: intl.$t({ defaultMessage: 'Please choose expiration date' }) },
                    { validator: (_, value) => dateValidationRegExp(value) }]}>
                  <DatePicker placeholder={intl.$t({ defaultMessage: 'Choose date' })} />
                </Form.Item>
              }
            </Space>
          </Space>
        </Radio.Group>
      </Form.Item>
    </Col>
  </Row>

  const content = <Form layout='vertical' form={form} onFinish={onSubmit}>
    {isEdit ? addManuallyContent :
      <>
        <Form.Item name='importAction' initialValue={2}>
          <Radio.Group>
            <Space direction='vertical'>
              <Radio value={2}>{intl.$t({ defaultMessage: 'Add manually' })}</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        {addType !== 1 && addManuallyContent}
      </>
    }
  </Form>

  const footer = (
    <Drawer.FormFooter
      onCancel={resetFields}
      buttonLabel={{ save: (addType === 1 ? 'Import List' : (isEdit ? 'Done' : 'Add')) }}
      onSave={async () => { form.submit() }}
    />
  )

  return (
    <Drawer
      //eslint-disable-next-line max-len
      title={isEdit ? intl.$t({ defaultMessage: 'Edit Mac Address' }) : intl.$t({ defaultMessage: 'Add Mac Address' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={600}
    />
  )
}
