import { useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space } from 'antd'
import { useIntl }                              from 'react-intl'
import { useParams }                            from 'react-router-dom'

import { Drawer }                           from '@acx-ui/components'
import { useCreateDpskPassphrasesMutation } from '@acx-ui/rc/services'
import {
  CreateDpskPassphrasesFormFields,
  DpskPassphrasesSaveData,
  ExpirationMode
} from '@acx-ui/rc/utils'

import AddDpskPassphrasesForm from './AddDpskPassphrasesForm'

enum AddPassphrasesType {
  IMPORT,
  MANUAL
}

export interface DpskPassphraseDrawerProps {
  visible: boolean;
  setVisible: (v: boolean) => void;
}

export default function DpskPassphraseDrawer (props: DpskPassphraseDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible } = props
  const params = useParams()
  const [ createPassphrases ] = useCreateDpskPassphrasesMutation()
  const [ manualSettingForm ] = Form.useForm<CreateDpskPassphrasesFormFields>()
  // eslint-disable-next-line max-len
  const [ addPassphrasesType, setAddPassphrasesType ] = useState<AddPassphrasesType>(AddPassphrasesType.IMPORT)

  const onClose = () => {
    setVisible(false)

    if (addPassphrasesType === AddPassphrasesType.MANUAL) {
      manualSettingForm.resetFields()
    }
  }

  const onAddPassphrasesTypeChange = (e: RadioChangeEvent) => {
    setAddPassphrasesType(e.target.value)
  }

  const content = (
    <Space size={'large'} direction='vertical'>
      <Radio.Group defaultValue={addPassphrasesType} onChange={onAddPassphrasesTypeChange}>
        <Space size={'middle'} direction='vertical'>
          <Radio value={AddPassphrasesType.IMPORT}>
            {$t({ defaultMessage: 'Import list' })}
          </Radio>
          <Radio value={AddPassphrasesType.MANUAL}>
            {$t({ defaultMessage: 'Add manually' })}
          </Radio>
        </Space>
      </Radio.Group>
      {addPassphrasesType === AddPassphrasesType.IMPORT &&
        <h1>Add Passphrases Uploader!</h1>
      }
      {addPassphrasesType === AddPassphrasesType.MANUAL &&
        <AddDpskPassphrasesForm form={manualSettingForm} />
      }
    </Space>
  )

  const onManualSettingFormFinish = async () => {
    await manualSettingForm.validateFields()
    const payload = transferFormFieldsToSaveData(manualSettingForm.getFieldsValue())
    await createPassphrases({ params, payload }).unwrap()
  }

  const onSave = async () => {
    try {
      if (addPassphrasesType === AddPassphrasesType.MANUAL) {
        await onManualSettingFormFinish()
      }

      onClose()
    } catch (error) {
      if (error instanceof Error) throw error
    }
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Passphrases' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          buttonLabel={({
            save: $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={onSave}
        />
      }
      width={'500px'}
    />
  )
}

// eslint-disable-next-line max-len
function transferFormFieldsToSaveData (fields: CreateDpskPassphrasesFormFields): DpskPassphrasesSaveData {
  return {
    ...fields,
    expiration: fields.expiration.mode === ExpirationMode.NEVER ? undefined : fields.expiration.date
  }
}
