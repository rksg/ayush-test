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
  const { macRegistrationListId } = useParams()

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
      if (!isEdit) {
        const payload = {
          macAddress: data.macAddress,
          username: data.username,
          deviceName: data.deviceName,
          expirationDate: data.listExpiration === 1 ? null : data.expirationDate
        }
        await addMacRegistration({
          params: { macRegistrationListId },
          payload
        }).unwrap()
      } else {
        const payload = {
          username: data.username,
          deviceName: data.deviceName,
          expirationDate: data.listExpiration === 1 ? null : data.expirationDate
        }
        await editMacRegistration(
          {
            params: { macRegistrationListId, registrationId: editData?.id },
            payload
          }).unwrap()
      }
      onClose()
    } catch {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const addManuallyContent = <Row>
    <Col span={16}>
      <Form.Item name='macAddress'
        label='MAC Address'
        rules={[
          { required: true, message: 'Please enter MAC Address' },
          { validator: (_, value) => macAddressRegExp(value) }
        ]}>
        <Input disabled={isEdit}/>
      </Form.Item>
      <Form.Item name='username' label='Username'>
        <Input/>
      </Form.Item>
      <Form.Item name='deviceName' label='DeviceName'>
        <Input/>
      </Form.Item>
      <Form.Item name='listExpiration' label='MAC Address Expiration' initialValue={1}>
        <Radio.Group>
          <Space direction='vertical'>
            <Radio value={1}>Never expires (Same as list)</Radio>
            <Space>
              <Radio value={2}>By date</Radio>
              { isExpired === 2 &&
                <Form.Item
                  name='expirationDate'
                  rules={[{ required: true },
                    { validator: (_, value) => dateValidationRegExp(value) }]}>
                  <DatePicker placeholder={'Choose date'} />
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
              <Radio value={2}>Add manually</Radio>
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
      title={isEdit ? 'Edit Mac Address' : 'Add Mac Address'}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={600}
    />
  )
}
