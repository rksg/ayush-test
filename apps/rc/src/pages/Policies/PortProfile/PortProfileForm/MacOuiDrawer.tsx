import { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer, Tooltip }                    from '@acx-ui/components'
import {
  useAddSwitchPortProfileMacOuiMutation, useEditSwitchPortProfileMacOuiMutation,
  useLazySwitchPortProfileMacOuisListQuery
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  MacOuis,
  SwitchPortProfileMessages } from '@acx-ui/rc/utils'

interface MacOuiDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit: boolean
  editData?: MacOuis
}

export function MacOuiDrawer (props: MacOuiDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, isEdit, editData } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()
  const [addSwitchPortProfileMacOui] = useAddSwitchPortProfileMacOuiMutation()
  const [editSwitchPortProfileMacOui] = useEditSwitchPortProfileMacOuiMutation()
  const [switchPortProfileMacOuisList] = useLazySwitchPortProfileMacOuisListQuery()

  const macOuiDuplicateValidator = async (macAddress: string) => {
    const list = (await switchPortProfileMacOuisList({
      payload: {
        fields: ['oui'],
        page: '1',
        pageSize: '10000',
        sortField: 'oui',
        sortOrder: 'ASC'
      }
    }).unwrap()).data
      .filter((n: MacOuis) => n.id !== editData?.id)
      .map((n: MacOuis) =>
        ({ name: n.oui.replace(/[^a-z0-9]/gi, '') }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: macAddress.replace(/[^a-z0-9]/gi, '') } ,
      $t({ defaultMessage: 'MAC OUI' }))
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

      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const content =
    <Form layout='vertical' form={form}>
      <Form.Item name='oui'
        label={<label>{$t({ defaultMessage: 'MAC OUI' })}
          <Tooltip.Question
            title={SwitchPortProfileMessages.MAC_OUI}
          /></label>}
        rules={[
          { required: true },
          { validator: (_, value) => {
            const regexMac = new RegExp(/^[0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){2}$/)
            if (value && !regexMac.test(value)) {
              return Promise.reject(
                $t({ defaultMessage: 'Please enter valid MAC OUI' }))
            }
            return Promise.resolve()
          } },
          { validator: (_, value) => macOuiDuplicateValidator(value) }
        ]}
        validateFirst
        hasFeedback
        validateTrigger={'onBlur'}>
        <Input style={{ width: '390px' }}/>
      </Form.Item>
      <Form.Item
        name='note'
        rules={[{ max: 255 }]}
        label={$t({ defaultMessage: 'Note' })}
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
      buttonLabel={{ save: (isEdit ? $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })) }}
      onSave={onSubmit}
    />
  )

  return (
    <Drawer
      //eslint-disable-next-line max-len
      title={isEdit ? $t({ defaultMessage: 'Edit MAC OUI' }) : $t({ defaultMessage: 'Add MAC OUI' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={440}
    />
  )
}
