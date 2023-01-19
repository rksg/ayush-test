import React, { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import moment          from 'moment-timezone'
import { useIntl }     from 'react-intl'

import { Drawer, showToast }         from '@acx-ui/components'
import { ExpirationDateSelector }    from '@acx-ui/rc/components'
import {
  useAddMacRegistrationMutation, useLazyMacRegistrationsQuery,
  useUpdateMacRegistrationMutation
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  ExpirationDateEntity,
  ExpirationMode,
  MacRegistration, MacRegistrationFilterRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

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
  const [addMacRegistration] = useAddMacRegistrationMutation()
  const [editMacRegistration] = useUpdateMacRegistrationMutation()
  const { policyId } = useParams()
  const [ macReg ] = useLazyMacRegistrationsQuery()

  const macAddressValidator = async (macAddress: string) => {
    const list = (await macReg({
      params: { policyId },
      payload: {
        page: '1',
        pageSize: '10000',
        sortField: 'macAddress',
        sortOrder: 'ASC'
      }
    }).unwrap()).data
      .filter(n => n.id !== editData?.id)
      .map(n => ({ name: n.macAddress.replace(/[^a-z0-9]/gi, '').toLowerCase() }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: macAddress.replace(/[^a-z0-9]/gi, '').toLowerCase() } , intl.$t({ defaultMessage: 'MAC Address' }))
  }

  useEffect(()=>{
    if (editData && visible) {
      let expiration: ExpirationDateEntity = new ExpirationDateEntity()
      if(editData.expirationDate) {
        expiration.setToByDate(editData.expirationDate!)
      }
      else {
        expiration.setToNever()
      }
      form.setFieldsValue(editData)
      form.setFieldValue('expiration', expiration)
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

  const onSubmit = async () => {
    try {
      await form.validateFields()
      const data = form.getFieldsValue()
      if (isEdit) {
        const payload = {
          username: data.username?.length === 0 ? null : data.username,
          email: data.email?.length === 0 ? null : data.email,
          expirationDate: data.expiration?.mode === ExpirationMode.NEVER ? null :
            moment.utc(data.expiration?.date).format('YYYY-MM-DDT23:59:59[Z]')
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
          email: data.email?.length === 0 ? null : data.email,
          expirationDate: data.expiration?.mode === ExpirationMode.NEVER ? null :
            moment(data.expiration?.date).format('YYYY-MM-DDT23:59:59[Z]')
        }
        await addMacRegistration({
          params: { policyId },
          payload
        }).unwrap()
      }
      onClose()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.data?.message) {
        showToast({
          type: 'error',
          content: intl.$t({ defaultMessage: 'An error occurred' })
        })
      }
    }
  }

  const addManuallyContent =
    <Form layout='vertical' form={form}>
      <Form.Item name='macAddress'
        label={intl.$t({ defaultMessage: 'MAC Address' })}
        rules={[
          { required: true },
          { validator: (_, value) => MacRegistrationFilterRegExp(value) },
          { validator: (_, value) => macAddressValidator(value) }
        ]}
        validateFirst
        hasFeedback>
        <Input disabled={isEdit}/>
      </Form.Item>
      <Form.Item name='username' label={intl.$t({ defaultMessage: 'Username' })}>
        <Input/>
      </Form.Item>
      <Form.Item name='email'
        rules={[
          { type: 'email', message: intl.$t({ defaultMessage: 'E-mail is not a valid email' }) }
        ]}
        label={intl.$t({ defaultMessage: 'E-mail' })}>
        <Input/>
      </Form.Item>
      <ExpirationDateSelector
        inputName={'expiration'}
        label={intl.$t({ defaultMessage: 'MAC Address Expiration' })}
        modeLabel={{
          [ExpirationMode.NEVER]: intl.$t({ defaultMessage: 'Never expires (Same as list)' })
        }}
        modeAvailability={{
          [ExpirationMode.AFTER_TIME]: false
        }}
      />
    </Form>

  const footer = (
    <Drawer.FormFooter
      onCancel={resetFields}
      // eslint-disable-next-line max-len
      buttonLabel={{ save: (isEdit ? intl.$t({ defaultMessage: 'Done' }) : intl.$t({ defaultMessage: 'Add' })) }}
      onSave={onSubmit}
    />
  )

  return (
    <Drawer
      //eslint-disable-next-line max-len
      title={isEdit ? intl.$t({ defaultMessage: 'Edit MAC Address' }) : intl.$t({ defaultMessage: 'Add MAC Address' })}
      visible={visible}
      onClose={onClose}
      children={addManuallyContent}
      footer={footer}
      destroyOnClose={resetField}
      width={440}
    />
  )
}
