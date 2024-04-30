import { useEffect } from 'react'

import { Form, FormItemProps }                       from 'antd'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { Drawer, Select }                             from '@acx-ui/components'
import { BandModeEnum, VenueApModelBandModeSettings } from '@acx-ui/rc/utils'

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

interface VenueBandManagementDrawerProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  onAddOrEdit: (item: VenueApModelBandModeSettings) => void
  initialData?: VenueApModelBandModeSettings
  tableDataModels: string[]
  triBandApModels: string[]
  dual5gApModels: string[]
  bandModeCaps: Record<string, BandModeEnum[]>
}

export const VenueBandManagementDrawer = ({ visible, setVisible,
  onAddOrEdit, initialData, tableDataModels,
  triBandApModels, dual5gApModels, bandModeCaps }: VenueBandManagementDrawerProps) => {

  const { $t } = useIntl()

  const [form] = Form.useForm<VenueApModelBandModeSettings>()
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
    onAddOrEdit(form.getFieldsValue(true) as VenueApModelBandModeSettings)
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
    {selectedModel &&
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
    }
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
