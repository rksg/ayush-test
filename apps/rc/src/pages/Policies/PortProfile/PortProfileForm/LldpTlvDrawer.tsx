import { useEffect, useState } from 'react'

import { Form, Input, Radio, Space } from 'antd'
import { useIntl }                   from 'react-intl'

import { Drawer }                             from '@acx-ui/components'
import {
  useAddSwitchPortProfileLldpTlvMutation,
  useEditSwitchPortProfileLldpTlvMutation,
  useLazySwitchPortProfileLldpTlvsListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  LldpTlvMatchingType,
  LldpTlvs } from '@acx-ui/rc/utils'

import { lldpTlvMatchingTypeTextMap } from '../portProfile.utils'

interface LldpTlvDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit: boolean
  editData?: LldpTlvs
}

export function LldpTlvDrawer (props: LldpTlvDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, isEdit, editData } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()
  const [addSwitchPortProfileLldpTlv] = useAddSwitchPortProfileLldpTlvMutation()
  const [editSwitchPortProfileLldpTlv] = useEditSwitchPortProfileLldpTlvMutation()
  const [switchPortProfileLldpTlvsList] = useLazySwitchPortProfileLldpTlvsListQuery()

  const itemDuplicateValidator = async (lldpTlv: LldpTlvs) => {
    const list = (await switchPortProfileLldpTlvsList({
      payload: {
        fields: ['id'],
        page: '1',
        pageSize: '10000',
        sortField: 'id',
        sortOrder: 'ASC'
      }
    }).unwrap()).data
      .filter((n: LldpTlvs) => n.id !== editData?.id)
      .filter((n: LldpTlvs) => n.systemDescription === lldpTlv.systemDescription)
      .filter((n: LldpTlvs) => n.nameMatchingType === lldpTlv.nameMatchingType)
      .filter((n: LldpTlvs) => n.descMatchingType === lldpTlv.descMatchingType)
      .map((n: LldpTlvs) =>
        ({ name: n.systemName }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: lldpTlv.systemName } ,
      $t({ defaultMessage: 'LLDP TLV' }), $t({ defaultMessage: 'value' }))
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
        systemName: data.systemName,
        nameMatchingType: data.nameMatchingType,
        systemDescription: data.systemDescription,
        descMatchingType: data.descMatchingType
      }
      if (isEdit) {
        await editSwitchPortProfileLldpTlv(
          {
            params: { lldpTlvId: data.id },
            payload
          }).unwrap()
      } else {
        await addSwitchPortProfileLldpTlv({
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
      <Form.Item name='systemName'
        label={$t({ defaultMessage: 'System Name' })}
        rules={[
          { required: true },
          { validator: () => itemDuplicateValidator(form.getFieldsValue()) }
        ]}
        validateFirst
        hasFeedback
        validateTrigger={'onBlur'}>
        <Input style={{ width: '390px' }}/>
      </Form.Item>
      <Form.Item name='nameMatchingType'
        label={$t({ defaultMessage: 'Name Match' })}
        rules={[
          { required: true }
        ]}>
        <Radio.Group>
          <Space direction='vertical'>
            {Object.entries(LldpTlvMatchingType).map(([key, value]) => (
              <Radio key={key} value={value}>
                {$t(lldpTlvMatchingTypeTextMap[value])}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Form.Item>
      <Form.Item name='systemDescription'
        label={$t({ defaultMessage: 'System Description' })}
        rules={[
          { required: true }
        ]}
        validateFirst
        hasFeedback
        validateTrigger={'onBlur'}>
        <Input style={{ width: '390px' }}/>
      </Form.Item>
      <Form.Item name='descMatchingType'
        label={$t({ defaultMessage: 'Description Match' })}
        rules={[
          { required: true }
        ]}>
        <Radio.Group>
          <Space direction='vertical'>
            {Object.entries(LldpTlvMatchingType).map(([key, value]) => (
              <Radio key={key} value={value}>
                {$t(lldpTlvMatchingTypeTextMap[value])}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
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
      title={isEdit ? $t({ defaultMessage: 'Edit LLDP TLV' }) : $t({ defaultMessage: 'Add LLDP TLV' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={440}
    />
  )
}
