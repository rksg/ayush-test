import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Drawer }                           from '@acx-ui/components'
import { useCreateDpskPassphrasesMutation } from '@acx-ui/rc/services'
import {
  CreateDpskPassphrasesFormFields,
  DpskPassphrasesSaveData,
  ExpirationMode
} from '@acx-ui/rc/utils'

import AddDpskPassphrasesForm from './AddDpskPassphrasesForm'

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

  const onClose = () => {
    setVisible(false)
    manualSettingForm.resetFields()
  }

  const onManualSettingFormSave = async () => {
    await manualSettingForm.validateFields()
    const payload = transferFormFieldsToSaveData(manualSettingForm.getFieldsValue())
    await createPassphrases({ params, payload }).unwrap()
  }

  const onSave = async () => {
    try {
      await onManualSettingFormSave()

      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Passphrases' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={<AddDpskPassphrasesForm form={manualSettingForm} />}
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
  const { passphrase, expiration, ...rest } = fields

  return {
    ...rest,
    passphrase: passphrase === '' ? null : passphrase,
    // eslint-disable-next-line max-len
    expirationDate: fields.expiration.mode === ExpirationMode.NEVER ? undefined : fields.expiration.date
  }
}
