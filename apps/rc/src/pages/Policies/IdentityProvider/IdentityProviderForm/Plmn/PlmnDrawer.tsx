import { useContext, useEffect } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer }                               from '@acx-ui/components'
import { IdentityProviderActionType, PlmnType } from '@acx-ui/rc/utils'

import IdentityProviderFormContext          from '../IdentityProviderFormContext'
import { validatePlmnMcc, validatePlmnMnc } from '../IdentityProviderFormValidator'

type PlmnDrawerProps = {
  visible: boolean
  setVisible: (visible: boolean) => void
  editIndex: number
}

const PlmnDrawer = (props: PlmnDrawerProps) => {
  const { $t } = useIntl()

  const [form] = Form.useForm()
  const { state, dispatch } = useContext(IdentityProviderFormContext)
  const { visible, setVisible, editIndex } = props
  const isEditMode = (editIndex !== -1)

  const title = isEditMode
    ? $t({ defaultMessage: 'Edit PLMN' })
    : $t({ defaultMessage: 'Add PLMN' })

  useEffect(() => {
    if (visible && form) {
      let plmn = { mcc: '', mnc: '' } as PlmnType
      if (isEditMode) {
        plmn = state.plmns?.[editIndex]!
      }
      form.setFieldsValue(plmn)
    }

  }, [editIndex, visible, form, isEditMode, state])

  const content = (
    <Form form={form}
      layout='vertical'
    >
      <Form.Item
        name='mcc'
        label={$t({ defaultMessage: 'Mobile Country Code (MCC)' })}
        rules={[
          { required: true },
          { validator: (_, value) => validatePlmnMcc(value) }
        ]}
        children={<Input maxLength={3} style={{ width: '100px' }} />}
      />
      <Form.Item
        name='mnc'
        label={$t({ defaultMessage: 'Mobile Network Code (MNC)' })}
        rules={[
          { required: true },
          { validator: (_, value) => validatePlmnMnc(value) }
        ]}
        children={<Input maxLength={3} style={{ width: '100px' }}/>}
      />
    </Form>
  )

  const onClose = () => {
    setVisible(false)
  }

  const onSave = async (addAnotherChecked: boolean) => {
    try {
      await form.validateFields()
      const { mcc, mnc } = form.getFieldsValue()
      if (isEditMode) {
        dispatch({
          type: IdentityProviderActionType.UPDATE_PLMN,
          payload: {
            mcc: mcc,
            mnc: mnc,
            rowId: editIndex
          }
        })
      } else {
        const index = state.plmns?.length || 0
        dispatch({
          type: IdentityProviderActionType.ADD_PLMN,
          payload: {
            mcc: mcc,
            mnc: mnc,
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
            addAnother: $t({ defaultMessage: 'Add another PLMN' }),
            save: isEditMode? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={onSave}
        />
      }
    />
  )
}

export default PlmnDrawer