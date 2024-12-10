import { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer, showToast }                 from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import {
  useAddSwitchPortProfileMacOuiMutation, useEditSwitchPortProfileMacOuiMutation,
  useLazySwitchPortProfileMacOuisListQuery
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  MacOuis } from '@acx-ui/rc/utils'

interface MacOuiDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit: boolean
  editData?: MacOuis
}

export function MacOuiDrawer (props: MacOuiDrawerProps) {
  const intl = useIntl()
  const { visible, setVisible, isEdit, editData } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()
  const [addSwitchPortProfileMacOui] = useAddSwitchPortProfileMacOuiMutation()
  const [editSwitchPortProfileMacOui] = useEditSwitchPortProfileMacOuiMutation()
  const [ switchPortProfileMacOuisList ] = useLazySwitchPortProfileMacOuisListQuery()
  const isAsync = useIsSplitOn(Features.CLOUDPATH_ASYNC_API_TOGGLE)
  const macAddressValidator = async (macAddress: string) => {
    const list = (await switchPortProfileMacOuisList({
      payload: {
        page: '1',
        pageSize: '10000',
        sortField: 'oui',
        sortOrder: 'ASC'
      }
    }).unwrap()).data
      .filter((n: MacOuis) => n.id !== editData?.id)
      .map((n: MacOuis) =>
        ({ name: n.oui.replace(/[^a-z0-9]/gi, '').toLowerCase() }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: macAddress.replace(/[^a-z0-9]/gi, '').toLowerCase() } ,
      intl.$t({ defaultMessage: 'MAC OUI' }))
  }

  useEffect(()=>{
    if (editData && visible) {
      form.setFieldsValue(editData)
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
        oui: data.oui,
        note: data.note?.length === 0 ? null : data.note
      }
      if (isEdit) {
        await editSwitchPortProfileMacOui(
          {
            params: { macOuiId: data.id },
            payload
          }).unwrap()
      } else {
        await addSwitchPortProfileMacOui({
          payload
        }).unwrap()
      }

      if (!isAsync) {
        showToast({
          type: 'success',
          content: intl.$t(
            // eslint-disable-next-line max-len
            { defaultMessage: 'MAC Address {name} was {isEdit, select, true {updated} other {added}}' },
            { name: data.macAddress, isEdit }
          )
        })
      }
      onClose()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const addManuallyContent =
    <Form layout='vertical' form={form}>
      <Form.Item name='oui'
        label={intl.$t({ defaultMessage: 'MAC OUI' })}
        rules={[
          { required: true },
          { validator: (_, value) => macAddressValidator(value) }
        ]}
        validateFirst
        hasFeedback
        validateTrigger={'onBlur'}>
        <Input style={{ width: '390px' }}/>
      </Form.Item>
      <Form.Item
        name='note'
        rules={[{ max: 255 }]}
        label={intl.$t({ defaultMessage: 'Note' })}
      >
        <Input.TextArea style={{ width: '390px' }}/>
      </Form.Item>
      <Form.Item name='id' hidden={true}>
        <Input/>
      </Form.Item>
    </Form>

  const footer = (
    <Drawer.FormFooter
      onCancel={resetFields}
      // eslint-disable-next-line max-len
      buttonLabel={{ save: (isEdit ? intl.$t({ defaultMessage: 'Apply' }) : intl.$t({ defaultMessage: 'Add' })) }}
      onSave={onSubmit}
    />
  )

  return (
    <Drawer
      //eslint-disable-next-line max-len
      title={isEdit ? intl.$t({ defaultMessage: 'Edit MAC OUI' }) : intl.$t({ defaultMessage: 'Add MAC OUI' })}
      visible={visible}
      onClose={onClose}
      children={addManuallyContent}
      footer={footer}
      destroyOnClose={resetField}
      width={440}
    />
  )
}
