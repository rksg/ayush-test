import { useEffect, useState } from 'react'

import { Form, Input, Radio, Space } from 'antd'
import { useIntl }                   from 'react-intl'

import { Drawer, showToast }                  from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import {
  useAddSwitchPortProfileLldpTlvMutation,
  useEditSwitchPortProfileLldpTlvMutation,
  useLazySwitchPortProfileLldpTlvsListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  LldpTlvMatchingType,
  LldpTlvs } from '@acx-ui/rc/utils'

interface LldpTlvDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEdit: boolean
  editData?: LldpTlvs
}

export function LldpTlvDrawer (props: LldpTlvDrawerProps) {
  const intl = useIntl()
  const { visible, setVisible, isEdit, editData } = props
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()
  const [addSwitchPortProfileLldpTlv] = useAddSwitchPortProfileLldpTlvMutation()
  const [editSwitchPortProfileLldpTlv] = useEditSwitchPortProfileLldpTlvMutation()
  const [switchPortProfileLldpTlvsList] = useLazySwitchPortProfileLldpTlvsListQuery()
  const isAsync = useIsSplitOn(Features.CLOUDPATH_ASYNC_API_TOGGLE)

  const nameDuplicateValidator = async (systemName: string) => {
    const list = (await switchPortProfileLldpTlvsList({
      payload: {
        page: '1',
        pageSize: '10000'
      }
    }).unwrap()).data
      .filter((n: LldpTlvs) => n.id !== editData?.id)
      .map((n: LldpTlvs) =>
        ({ name: n.systemName.replace(/[^a-z0-9]/gi, '').toLowerCase() }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: systemName.replace(/[^a-z0-9]/gi, '').toLowerCase() } ,
      intl.$t({ defaultMessage: 'LLDP TLV' }))
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

  const content =
    <Form layout='vertical' form={form}>
      <Form.Item name='systemName'
        label={intl.$t({ defaultMessage: 'System Name' })}
        rules={[
          { required: true },
          { validator: (_, value) => nameDuplicateValidator(value) }
        ]}
        validateFirst
        hasFeedback
        validateTrigger={'onBlur'}>
        <Input style={{ width: '390px' }}/>
      </Form.Item>
      <Form.Item name='nameMatchingType'
        label={intl.$t({ defaultMessage: 'Name Match' })}
        rules={[
          { required: true }
        ]}>
        <Radio.Group>
          <Space direction='vertical'>
            <Radio value={LldpTlvMatchingType.FULL_MAPPING}>
              {intl.$t({ defaultMessage: 'Exact' })}
            </Radio>
            <Radio value={LldpTlvMatchingType.BEGIN}>
              {intl.$t({ defaultMessage: 'Begin with' })}
            </Radio>
            <Radio value={LldpTlvMatchingType.INCLUDE}>
              {intl.$t({ defaultMessage: 'Include' })}
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
      <Form.Item name='systemDescription'
        label={intl.$t({ defaultMessage: 'System Description' })}
        rules={[
          { required: true }
        ]}
        validateFirst
        hasFeedback
        validateTrigger={'onBlur'}>
        <Input style={{ width: '390px' }}/>
      </Form.Item>
      <Form.Item name='descMatchingType'
        label={intl.$t({ defaultMessage: 'Description Match' })}
        rules={[
          { required: true }
        ]}>
        <Radio.Group>
          <Space direction='vertical'>
            <Radio value={LldpTlvMatchingType.FULL_MAPPING}>
              {intl.$t({ defaultMessage: 'Exact' })}
            </Radio>
            <Radio value={LldpTlvMatchingType.BEGIN}>
              {intl.$t({ defaultMessage: 'Begin with' })}
            </Radio>
            <Radio value={LldpTlvMatchingType.INCLUDE}>
              {intl.$t({ defaultMessage: 'Include' })}
            </Radio>
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
      buttonLabel={{ save: (isEdit ? intl.$t({ defaultMessage: 'Apply' }) : intl.$t({ defaultMessage: 'Add' })) }}
      onSave={onSubmit}
    />
  )

  return (
    <Drawer
      //eslint-disable-next-line max-len
      title={isEdit ? intl.$t({ defaultMessage: 'Edit LLDP TLV' }) : intl.$t({ defaultMessage: 'Add LLDP TLV' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      destroyOnClose={resetField}
      width={440}
    />
  )
}
