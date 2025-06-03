import { useEffect } from 'react'

import { Form, FormItemProps }                       from 'antd'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { Drawer, Select, cssStr }                from '@acx-ui/components'
import { BandModeEnum, ApModelBandModeSettings } from '@acx-ui/rc/utils'

const DrawerFormItem = (props: FormItemProps) => {
  return (
    <Form.Item
      labelAlign={'left'}
      labelCol={{ span: 10 }}
      style={{ marginBottom: '25px' }}
      {...props} />
  )
}

const bandCombinationLabelMapping: Record<BandModeEnum, MessageDescriptor> = {
  [BandModeEnum.DUAL]: defineMessage({ defaultMessage: 'Dual-band' }),
  [BandModeEnum.TRIPLE]: defineMessage({ defaultMessage: 'Tri-band' })
}

interface BandManagementDrawerProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  onAddOrEdit: (item: ApModelBandModeSettings) => void
  initialData?: ApModelBandModeSettings
  tableDataModels: string[]
  triBandApModels: string[]
  dual5gApModels: string[]
  bandModeCaps: Record<string, BandModeEnum[]>
}

export const BandManagementDrawer = ({ visible, setVisible,
  onAddOrEdit, initialData, tableDataModels,
  triBandApModels, dual5gApModels, bandModeCaps }: BandManagementDrawerProps) => {

  const { $t } = useIntl()

  const [form] = Form.useForm<ApModelBandModeSettings>()
  const selectedModel = Form.useWatch<string>('model', form)

  useEffect(() => {
    form.setFieldValue('model', initialData?.model || '')
    form.setFieldValue('bandMode', initialData?.bandMode)
  }, [initialData, form])

  const onClose = () => {
    form.resetFields()
    setVisible(false)
  }

  const onSubmit = () => {
    onAddOrEdit(form.getFieldsValue(true) as ApModelBandModeSettings)
    onClose()
  }

  const drawerContent = <Form
    form={form}
    layout='vertical'
    onFinish={onSubmit}
  >
    <DrawerFormItem
      name='model'
      label={$t({ defaultMessage: 'Model' })}
      initialValue={initialData?.model || ''}
      rules={[{
        required: true,
        message: $t({ defaultMessage: 'Please select a model from the list' })
      }]}
      children={<Select
        data-testid='model-select'
        style={{ width: '100%' }}
        disabled={!!initialData?.model}
        options={[
          { value: '', label: $t({ defaultMessage: 'Select model...' }) },
          ...triBandApModels
            .filter(model => !tableDataModels.includes(model))
            .filter(model => dual5gApModels.includes(model)
                || Object.keys(bandModeCaps).includes(model))
            .map(model => ({
              value: model,
              label: model
            }))
        ]}
      />}
    />
    {selectedModel && <>
      <DrawerFormItem
        name='bandMode'
        label={dual5gApModels.includes(selectedModel) ?
          $t({ defaultMessage: 'Band Management' }) :
          $t({ defaultMessage: 'Band Operation Mode' })}
        initialValue={initialData?.bandMode || BandModeEnum.DUAL}
        required={true}
        children={<Select
          style={{ width: '100%' }}
          options={(dual5gApModels.includes(selectedModel) ?
            [BandModeEnum.DUAL, BandModeEnum.TRIPLE] : bandModeCaps[selectedModel])
            .map(bandMode => ({
              label: $t(bandCombinationLabelMapping[bandMode]), value: bandMode }))}
        />}
      />
      <span style={{ color: cssStr('--acx-semantics-red-50') }}>
        {$t({
          // eslint-disable-next-line max-len
          defaultMessage: 'Modifying the Dual/Tri Band Mode will reboot the AP, the mesh connection will also be disconnected when rebooting.'
        })}
      </span>
    </>}
  </Form>

  return (
    <Drawer
      title='Wi-Fi Band Management'
      visible={visible}
      onClose={onClose}
      children={drawerContent}
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          buttonLabel={{ save: initialData?.model ?
            $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' }) }}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              form.submit()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
      width={400}
    />
  )
}
