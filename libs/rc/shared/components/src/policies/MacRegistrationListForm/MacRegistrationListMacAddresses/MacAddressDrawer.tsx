import React, { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import _               from 'lodash'
import { useIntl }     from 'react-intl'

import { Drawer }                     from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import {
  useAddMacRegistrationMutation, useLazyMacRegistrationsQuery,
  useUpdateMacRegistrationMutation
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  ExpirationDateEntity,
  ExpirationMode, MacRegistration,
  MacRegistrationFilterRegExp,
  toExpireEndDate,
  toLocalDateString
} from '@acx-ui/rc/utils'

import { ExpirationDateSelector } from '../../../ExpirationDateSelector'
import { IdentitySelector }       from '../../../users/IdentitySelector'

interface MacAddressDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit: boolean,
  policyId: string,
  editData?: MacRegistration,
  expirationOfPool: string,
  identityGroupId?: string,
  defaultIdentityId?: string
}

export function MacAddressDrawer (props: MacAddressDrawerProps) {
  const intl = useIntl()
  // eslint-disable-next-line max-len
  const { policyId, visible, setVisible, isEdit, editData, expirationOfPool, identityGroupId, defaultIdentityId } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm<MacRegistration>()
  const [addMacRegistration] = useAddMacRegistrationMutation()
  const [editMacRegistration] = useUpdateMacRegistrationMutation()
  const [ macReg ] = useLazyMacRegistrationsQuery()
  const isIdentityRequired = useIsSplitOn(Features.MAC_REGISTRATION_REQUIRE_IDENTITY_GROUP_TOGGLE)

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
    if (visible) {
      if (editData) {
        let expiration: ExpirationDateEntity = new ExpirationDateEntity()
        if(editData.expirationDate) {
          expiration.setToByDate(toLocalDateString(editData.expirationDate!))
        }
        else {
          expiration.setToNever()
        }
        form.setFieldsValue({
          identityId: undefined,  // reset the identityId to prevent the legacy id still in the form
          ...editData
        })
        form.setFieldValue('expiration', expiration)
      } else {
        // Single identity case: apply the default identityId into the form for creation
        form.setFieldValue('identityId', defaultIdentityId)
      }
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
      const payload = {
        macAddress: data.macAddress,
        username: data.username?.length === 0 ? null : data.username,
        email: data.email?.length === 0 ? null : data.email,
        expirationDate: data.expiration?.mode === ExpirationMode.NEVER ? null :
          toExpireEndDate(data.expiration?.date),
        identityId: data.identityId,
        deviceName: data.deviceName,
        location: data.location
      }
      if (isEdit) {
        await editMacRegistration(
          {
            params: { policyId, registrationId: editData?.id },
            payload: _.omit(payload, 'macAddress', 'identityId')
          }).unwrap()
      } else {
        await addMacRegistration({
          params: { policyId },
          payload
        }).unwrap()
      }

      onClose()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const addManuallyContent =
    <Form layout='vertical' form={form}>
      {
        isIdentityRequired && (
          <IdentitySelector
            readonly={isEdit || defaultIdentityId !== undefined}
            isEdit={isEdit}
            identityGroupId={identityGroupId}
            disableAddDevices={true}
          />
        )
      }
      <Form.Item name='macAddress'
        label={intl.$t({ defaultMessage: 'MAC Address' })}
        rules={[
          { required: true },
          { validator: (_, value) => MacRegistrationFilterRegExp(value) },
          { validator: (_, value) => macAddressValidator(value) }
        ]}
        validateFirst
        hasFeedback
        validateTrigger={'onBlur'}>
        <Input disabled={isEdit}/>
      </Form.Item>
      <Form.Item
        name='username'
        rules={[{ max: 255 }]}
        label={intl.$t({ defaultMessage: 'Username' })}
      >
        <Input/>
      </Form.Item>
      <Form.Item name='email'
        rules={[
          { max: 255 },
          { type: 'email', message: intl.$t({ defaultMessage: 'E-mail is not a valid email' }) }
        ]}
        label={intl.$t({ defaultMessage: 'E-mail' })}>
        <Input/>
      </Form.Item>
      <Form.Item name='deviceName'
        rules={[{ max: 255 }]}
        label={intl.$t({ defaultMessage: 'Device Name' })}>
        <Input/>
      </Form.Item>
      <Form.Item name='location'
        rules={[{ max: 255 }]}
        label={intl.$t({ defaultMessage: 'Location' })}>
        <Input/>
      </Form.Item>
      <ExpirationDateSelector
        inputName={'expiration'}
        label={intl.$t({ defaultMessage: 'MAC Address Expiration' })}
        modeLabel={{
          // eslint-disable-next-line max-len
          [ExpirationMode.NEVER]: intl.$t({ defaultMessage: '{time} (Same as list)' }, { time: expirationOfPool })
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
      push={false}
      visible={visible}
      onClose={onClose}
      children={addManuallyContent}
      footer={footer}
      destroyOnClose={resetField}
      width={440}
    />
  )
}
