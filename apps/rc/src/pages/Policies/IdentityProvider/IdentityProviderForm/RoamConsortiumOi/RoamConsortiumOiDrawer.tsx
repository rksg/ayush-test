import { useContext, useEffect, useState } from 'react'


import { Form, Input, Space } from 'antd'
import { useIntl }            from 'react-intl'

import { Drawer, Select }                                                          from '@acx-ui/components'
import { IdentityProviderActionType, RoamConsortiumType, servicePolicyNameRegExp } from '@acx-ui/rc/utils'

import IdentityProviderFormContext from '../IdentityProviderFormContext'

type RoamConsortiumOiDrawerProps = {
  visible: boolean
  setVisible: (visible: boolean) => void
  editIndex: number
}

const OidTypeOptions = [
  { label: '3 hex', value: 3 },
  { label: '5 hex', value: 5 }
]

const RoamConsortiumOiDrawer = (props: RoamConsortiumOiDrawerProps) => {
  const { $t } = useIntl()

  const [form] = Form.useForm()
  const { state, dispatch } = useContext(IdentityProviderFormContext)
  const [ oidType, setOidType ] = useState(3)
  const { visible, setVisible, editIndex } = props
  const isEditMode = (editIndex !== -1)


  const title = isEditMode
    ? $t({ defaultMessage: 'Edit Roaming Consortium OI' })
    : $t({ defaultMessage: 'Add Roaming Consortium OI' })

  const convertToFormData = (data: RoamConsortiumType) => {
    const { name='', organizationId='' } = data || {}
    const oidArray = organizationId
      ? organizationId.match(/[0-9A-F]{1,2}/g)
      : ['', '', '']

    return {
      name,
      organizationId: oidArray
    }
  }

  useEffect(() => {
    if (form) {
      let roi = { name: '', organizationId: '' } as RoamConsortiumType
      if (isEditMode) {
        roi = state.roamConsortiumOIs?.[editIndex]!
      }

      const { organizationId } = roi
      const oidType = (organizationId.length === 10) ? 5 : 3
      setOidType(oidType)

      const formData = convertToFormData(roi)
      form.setFieldsValue(formData)
    }
  }, [editIndex, form, isEditMode, state])

  const nameDuplicationValidator = async (value: string) => {
    const { roamConsortiumOIs } = state
    const existNames = (roamConsortiumOIs)
      ? roamConsortiumOIs.filter(oi => (oi.rowId !== editIndex)).map(oi => oi.name)
      : []

    return (existNames.includes(value))
      ? Promise.reject($t({ defaultMessage: 'The Name already exists' }))
      : Promise.resolve()
  }

  const oids = Array.from({ length: oidType })

  const handleOidTypeChanged = (value: number) => {
    setOidType(value)
  }


  const content = (
    <Form form={form}
      layout='vertical'
    >
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'OI name' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 32 },
          { validator: (_, value) => servicePolicyNameRegExp(value) },
          { validator: (_, value) => nameDuplicationValidator(value) }
        ]}
        children={<Input />}
      />
      <Form.Item label={$t({ defaultMessage: 'Organization Id' })} required >
        <Space>
          <Form.Item
            children={<Select
              style={{ width: '80px' }}
              options={OidTypeOptions}
              value={oidType}
              onChange={handleOidTypeChanged}
            />}
          />
          {oids.map((_, index) => (
            <Form.Item
              key={`oid-${index}`}
              name={['organizationId', index]}
              children={<Input maxLength={2}
                style={{ width: '42px' }}
                placeholder={'00'}
              />}
            />
          ))}
        </Space>
      </Form.Item>
    </Form>
  )

  const onClose = () => {
    setVisible(false)
  }

  const onSave = async (addAnotherChecked: boolean) => {
    try {
      await form.validateFields()
      const { name, organizationId } = form.getFieldsValue()

      if (isEditMode) {
        dispatch({
          type: IdentityProviderActionType.UPDATE_ROI,
          payload: {
            name: name,
            organizationId: organizationId.join(''),
            rowId: editIndex
          }
        })
      } else {
        const index = state.roamConsortiumOIs?.length || 0
        dispatch({
          type: IdentityProviderActionType.ADD_ROI,
          payload: {
            name: name,
            organizationId: organizationId.join(''),
            rowId: index
          }
        })
      }

      form.submit()
      form.resetFields()

      if (!addAnotherChecked) {
        onClose()
      }
    } catch (error) {
      if (error instanceof Error) throw error
    }
  }


  return (
    <Drawer
      title={title}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      width={'350px'}
      footer={
        <Drawer.FormFooter
          showAddAnother={!isEditMode}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another OI' }),
            save: isEditMode? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={onSave}
        />
      }
    />
  )
}

export default RoamConsortiumOiDrawer