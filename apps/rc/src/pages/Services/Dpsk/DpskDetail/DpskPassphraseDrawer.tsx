
import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Drawer, showActionModal }    from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { useDpskNewConfigFlowParams } from '@acx-ui/rc/components'
import {
  useCreateDpskPassphrasesMutation,
  useLazyGetEnhancedDpskPassphraseListQuery,
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
  const [ getEnhancedDpskPassphraseList ] = useLazyGetEnhancedDpskPassphraseListQuery()
  const isNewConfigFlow = useIsSplitOn(Features.DPSK_NEW_CONFIG_FLOW_TOGGLE)

  const onClose = () => {
    setVisible(false)
  }

  const onManualSettingFormSave = async (overrideMac: boolean = false) => {
    await formInstance.validateFields()
    // eslint-disable-next-line max-len
    const payload = transferFormFieldsToSaveData(formInstance.getFieldsValue(), editMode.isEdit, overrideMac)

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

  const checkMacDuplication = async (): Promise<boolean> => {
    const mac = formInstance.getFieldValue('mac')

    if (!mac) return false

    const passphraseListResult = await getEnhancedDpskPassphraseList({
      params: { ...params, ...dpskNewConfigFlowParams },
      payload: { page: 1, pageSize: 65535, filters: { mac: [mac] } }
    }).unwrap()

    const passphraseId = formInstance.getFieldValue('id')

    return passphraseListResult.data.length > 0 &&
      passphraseListResult.data.some(p => p.id !== passphraseId)
  }

  const onSave = async () => {
    try {
      const isMacDuplicated = await checkMacDuplication()

      if (isMacDuplicated && !isNewConfigFlow) {
        showActionModal({
          type: 'confirm',
          width: 450,
          title: $t({ defaultMessage: 'Replace Passphrase For MAC Address?' }),
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'The specified MAC address has already an attached passphrase. Do you want to replace the passphrase?' }),
          okText: $t({ defaultMessage: 'Replace Passphrase' }),
          onOk: async () => {
            await onManualSettingFormSave(true)
          }
        })
      } else {
        await onManualSettingFormSave()
      }
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
  isEdit: boolean,
  overrideMac: boolean
): DpskPassphrasesSaveData {
  const { id, passphrase, expiration, revocationReason, ...rest } = fields

  return {
    ...rest,
    id: isEdit ? id : undefined,
    passphrase: passphrase === '' ? null : passphrase,
    revocationReason: revocationReason === '' ? undefined : revocationReason,
    // eslint-disable-next-line max-len
    expirationDate: fields.expiration.mode === ExpirationMode.NEVER ? undefined : fields.expiration.date,
    ...(overrideMac ? { override: true } : {})
  }
}
