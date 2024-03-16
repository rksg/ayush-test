import { useContext, useEffect, useState } from 'react'


import { Form, Input, Space }        from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Drawer, Select, cssStr }                                                  from '@acx-ui/components'
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
  const [ errorOidIndexes, setErrorOidIndexes] = useState<number[]>([])
  const { visible, setVisible, editIndex } = props
  const isEditMode = (editIndex !== -1)


  const title = isEditMode
    ? $t({ defaultMessage: 'Edit Roaming Consortium OI' })
    : $t({ defaultMessage: 'Add Roaming Consortium OI' })

  const convertToFormData = (data: RoamConsortiumType) => {
    const { name='', organizationId='' } = data || {}
    const oidArray = organizationId.toLocaleLowerCase()
      ? organizationId.match(/[0-9a-fA-F]{1,2}/g)
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

  const roiValidator = async (organizationIds: string[]) => {
    const re = new RegExp(/^([0-9a-fA-F]{1,2})$/)
    const errorOIds: number[] = []
    organizationIds.forEach((oid, index) => {
      if (!re.test(oid)) {
        errorOIds.push(index)
      }
    })
    setErrorOidIndexes(errorOIds)
    return (errorOIds.length > 0)
      ? Promise.reject($t({ defaultMessage: 'Invalid Organization ID' }))
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
      <Form.Item required
        label={$t({ defaultMessage: 'Organization Id' })}
        style={{ marginBottom: '0' }}
      >
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
              children={<Input data-testid={'oid'}
                maxLength={2}
                style={{ width: '42px' }}
                placeholder={'00'}
              />}
            />
          ))}
        </Space>
      </Form.Item>
      {(errorOidIndexes.length > 0) &&
      <div style={{
        paddingLeft: '90px',
        marginTop: '-14px',
        color: cssStr('--acx-semantics-red-50') }}>
        <FormattedMessage
          defaultMessage={'Please enter {number} valid hex'}
          values={{
            number: oidType
          }} />
      </div>
      }
    </Form>
  )

  const onClose = () => {
    setVisible(false)
  }

  const onSave = async (addAnotherChecked: boolean) => {
    try {
      const { name, organizationId } = form.getFieldsValue()
      await roiValidator(organizationId)
      await form.validateFields()

      const organizationIdString = organizationId.join('').toLocaleLowerCase()

      if (isEditMode) {
        dispatch({
          type: IdentityProviderActionType.UPDATE_ROI,
          payload: {
            name: name,
            organizationId: organizationIdString,
            rowId: editIndex
          }
        })
      } else {
        const index = state.roamConsortiumOIs?.length || 0
        dispatch({
          type: IdentityProviderActionType.ADD_ROI,
          payload: {
            name: name,
            organizationId: organizationIdString,
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