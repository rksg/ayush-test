import { useEffect, useState } from 'react'

import { Form, Input, Space }        from 'antd'
import Select, { DefaultOptionType } from 'antd/lib/select'
import _                             from 'lodash'

import { Button, Modal } from '@acx-ui/components'
import {
  dscpRegExp,
  priorityRegExp,
  LldpQosModel,
  QOS_APP_Type,
  QOS_VLAN_Type
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

export function EditLldpModal (props: {
  isEditMode: boolean,
  editRowId?: string,
  vlansOptions: DefaultOptionType[],
  lldpModalvisible: boolean,
  lldpQosList: LldpQosModel[],
  setLldpModalvisible: (visible: boolean) => void,
  setLldpQosList: (data: LldpQosModel[]) => void
}) {
  const { $t } = getIntl()
  const {
    isEditMode,
    editRowId,
    lldpModalvisible,
    setLldpModalvisible,
    lldpQosList,
    setLldpQosList,
    vlansOptions
  } = props

  const [form] = Form.useForm()
  const { useWatch } = Form
  const [ qosVlanType ] = [ useWatch('qosVlanType', form) ]
  const [disableButton, setDisableButton] = useState(false)

  const editRow = lldpQosList
    ?.filter(lldp => lldp?.id === editRowId)?.[0]
  const existType = lldpQosList
    ?.filter(lldp => !isEditMode || (lldp.id !== editRowId))
    ?.map(lldp => lldp?.applicationType)

  const applicationTypeOptions = Object.entries(QOS_APP_Type)
    .map(([label, value]) => ({
      label, value, disabled: existType?.includes(value)
    }))
  const qosVlanTypeOptions
    = Object.entries(QOS_VLAN_Type).map(([label, value]) => ({ label, value }))

  const onFieldsChange = async () => {
    if (isEditMode) {
      setDisableButton(_.isEqual(form.getFieldsValue(), editRow))
    }
  }

  const transformData = (values: LldpQosModel) => ({
    ...values,
    id: isEditMode ? editRowId : `lldp-${lldpQosList?.length}`,
    dscp: Number(values?.dscp),
    ...(values?.priority && { priority: Number(values?.priority) }),
    ...(values?.vlanId && { vlanId: Number(values?.vlanId) })
  } as LldpQosModel)

  const onSave = async () => {
    try {
      const valid = await form.validateFields()
      if (valid) {
        !isEditMode
          ? setLldpQosList([ ...lldpQosList, transformData(form.getFieldsValue()) ])
          : setLldpQosList(lldpQosList.map(lldp => {
            return lldp.id !== editRowId ? lldp : transformData(form.getFieldsValue())
          }))

        setLldpModalvisible(false)
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onCancel = () => {
    setLldpModalvisible(false)
  }

  useEffect(() => {
    if (editRowId) {
      form.setFieldsValue(editRow)
      setDisableButton(true)
    }
  }, [editRowId])

  return (<Modal
    title={isEditMode
      ? $t({ defaultMessage: 'Edit LLDP QoS' })
      : $t({ defaultMessage: 'Add LLDP QoS' })
    }
    visible={lldpModalvisible}
    width={500}
    destroyOnClose={true}
    onCancel={onCancel}
    footer={[
      <Space style={{ display: 'flex', justifyContent: 'space-between' }} key='button-wrapper'>
        <Button key='back' onClick={onCancel}>{$t({ defaultMessage: 'Cancel' })}</Button>
        <Button key='submit' type='secondary' disabled={disableButton} onClick={onSave}>
          {$t({ defaultMessage: 'Save' })}
        </Button>
      </Space>
    ]}
  >
    <Form
      form={form}
      layout='vertical'
      validateTrigger='onBlur'
      onFieldsChange={onFieldsChange}
    >
      <Form.Item name='id' hidden children={<Input />}/>
      <Form.Item
        label={$t({ defaultMessage: 'Application Type' })}
        name='applicationType'
        rules={[
          { validator: (_, value) => {
            if (existType?.includes(value)) {
              return Promise.reject($t({
                defaultMessage: 'LLDP QoS Application Type can not duplicate'
              }))
            } else {
              return Promise.resolve()
            }
          } }
        ]}
        initialValue='GUEST_VOICE'
        children={<Select
          style={{ width: '100%' }}
          options={applicationTypeOptions}
        />}
      />
      <Form.Item
        label={$t({ defaultMessage: 'QoS VLAN Type' })}
        name='qosVlanType'
        validateFirst
        initialValue='PRIORITY_TAGGED'
        children={<Select
          style={{ width: '100%' }}
          options={qosVlanTypeOptions}
          onChange={(value) => {
            if (value === QOS_VLAN_Type['Priority-tagged']) {
              form.resetFields(['vlanId'])
            } else if (value === QOS_VLAN_Type['Untagged']) {
              form.resetFields(['vlanId', 'priority'])
            }
          }}
        />}
      />
      <Form.Item
        label={$t({ defaultMessage: 'VLAN ID' })}
        name='vlanId'
        rules={[{
          required: qosVlanType === QOS_VLAN_Type['Tagged'],
          message: $t({ defaultMessage: 'This field is required' })
        }]}
        validateFirst
        initialValue=''
        children={<Select
          style={{ width: '100%' }}
          disabled={vlansOptions?.length === 1
            || qosVlanType !== QOS_VLAN_Type['Tagged']
          }
          options={vlansOptions}
        />}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Priority' })}
        name='priority'
        rules={[
          { required: qosVlanType !== QOS_VLAN_Type['Untagged'] },
          { validator: (_, value) => priorityRegExp(value) }
        ]}
        children={<Input
          disabled={qosVlanType === QOS_VLAN_Type['Untagged']}
          placeholder={$t({ defaultMessage: 'Between 0-7' })}
        />}
      />
      <Form.Item
        label={$t({ defaultMessage: 'DSCP' })}
        name='dscp'
        rules={[
          { required: true },
          { validator: (_, value) => dscpRegExp(value) }
        ]}
        children={<Input
          placeholder={$t({ defaultMessage: 'Between 0-63' })}
        />}
      />
    </Form>
  </Modal>)
}