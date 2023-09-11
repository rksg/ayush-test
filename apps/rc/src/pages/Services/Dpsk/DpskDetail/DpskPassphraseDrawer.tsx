
import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Drawer }                     from '@acx-ui/components'
import { useDpskNewConfigFlowParams } from '@acx-ui/rc/components'
import {
  useCreateDpskPassphrasesMutation,
  useUpdateDpskPassphrasesMutation
} from '@acx-ui/rc/services'
import {
  CreateDpskPassphrasesFormFields,
  DpskPassphrasesSaveData,
  ExpirationMode
} from '@acx-ui/rc/utils'

import AddDpskPassphrasesForm from './AddDpskPassphrasesForm'

export interface DpskPassphraseEditMode {
  isEdit: boolean;
  passphraseId?: string;
}

export interface DpskPassphraseDrawerProps {
  visible: boolean;
  setVisible: (v: boolean) => void;
  editMode: DpskPassphraseEditMode;
}

export default function DpskPassphraseDrawer (props: DpskPassphraseDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, editMode } = props
  const params = useParams()
  const dpskNewConfigFlowParams = useDpskNewConfigFlowParams()
  const [ createPassphrases ] = useCreateDpskPassphrasesMutation()
  const [ updatePassphrases ] = useUpdateDpskPassphrasesMutation()
  const [ formInstance ] = Form.useForm<CreateDpskPassphrasesFormFields>()

  const onClose = () => {
    setVisible(false)
  }

  const onManualSettingFormSave = async () => {
    await formInstance.validateFields()
    // eslint-disable-next-line max-len
    const payload = transferFormFieldsToSaveData(formInstance.getFieldsValue(), editMode.isEdit)

    if (editMode.isEdit) {
      await updatePassphrases({
        params: { ...params, passphraseId: editMode.passphraseId, ...dpskNewConfigFlowParams },
        payload
      }).unwrap()
    } else {
      await createPassphrases({
        params: { ...params, ...dpskNewConfigFlowParams },
        payload
      }).unwrap()
    }

    onClose()
  }

  const onSave = async () => {
    try {
      await onManualSettingFormSave()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Drawer
      title={editMode.isEdit
        ? $t({ defaultMessage: 'Edit Passphrases' })
        : $t({ defaultMessage: 'Add Passphrases' })
      }
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={<AddDpskPassphrasesForm form={formInstance} editMode={editMode} />}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          buttonLabel={({
            save: editMode.isEdit ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={onSave}
        />
      }
      width={'500px'}
    />
  )
}

function transferFormFieldsToSaveData (
  fields: CreateDpskPassphrasesFormFields,
  isEdit: boolean
): DpskPassphrasesSaveData {
  const { id, passphrase, expiration, revocationReason, ...rest } = fields

  return {
    ...rest,
    id: isEdit ? id : undefined,
    passphrase: passphrase === '' ? null : passphrase,
    revocationReason: revocationReason === '' ? undefined : revocationReason,
    // eslint-disable-next-line max-len
    expirationDate: fields.expiration.mode === ExpirationMode.NEVER ? undefined : fields.expiration.date
  }
}
