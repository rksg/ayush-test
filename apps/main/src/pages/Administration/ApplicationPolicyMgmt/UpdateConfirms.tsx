import { useState } from 'react'

import { Input, Modal }                     from 'antd'
import { useIntl }                          from 'react-intl'
import { MessageDescriptor, defineMessage } from 'react-intl'

import { Button }                   from '@acx-ui/components'
import { useUpdateSigPackMutation } from '@acx-ui/rc/services'
import { ApplicationConfirmType }   from '@acx-ui/rc/utils'

import * as UI               from './styledComponents'
import { useSigPackDetails } from './useSigPackDetails'

const contentDescription: Record< ApplicationConfirmType, MessageDescriptor|undefined> = {
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.UPDATED_APPS]: defineMessage({ defaultMessage: 'Note that all impacted policies/rules that are on this tenant will be updated.' }),
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.UPDATED_REMOVED_APPS]: defineMessage({ defaultMessage: 'Note that all impacted policies/rules that are on this tenant will be updated/removed.' }),
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.UPDATED_APP_ONLY]: defineMessage({ defaultMessage: 'Note that {count} impacted rules that are on this tenant will be updated.' }),
  // eslint-disable-next-line max-len
  [ApplicationConfirmType.REMOVED_APP_ONLY]: defineMessage({ defaultMessage: 'Note that {count} impacted rules that are on this tenant will be removed.' }),
  [ApplicationConfirmType.NEW_APP_ONLY]: undefined
}

// eslint-disable-next-line max-len
const cautionDescription = defineMessage({ defaultMessage: 'Are you sure you want to update the application under this tenant?' })

export const UpdateConfirms = () => {
  const { $t } = useIntl()
  const [updateSigPack]=useUpdateSigPackMutation()
  const { rulesCount, confirmationType } = useSigPackDetails()
  const [disabled, setDisabled]=useState(false)
  const typeText = 'Update'
  const typeWords = $t({ defaultMessage: 'Type the word "{text}" to confirm:' }, { text: typeText })

  const doUpdate = () => {
    setDisabled(true)
    try{
      updateSigPack({ params: {}, payload: { action: 'UPDATE' } }).then(() => {
        setTimeout(() => setDisabled(false), 3500)
      }, () => {
        setDisabled(false)
      })
    } catch(error) {
      setDisabled(false)
    }
  }

  const showModal = () => {
    const modal = Modal.confirm({
      type: 'confirm',
      title: $t({ defaultMessage: 'Update Application policy?' }),
      okText: $t({ defaultMessage: 'Update' }),
      content: <>
        <UI.DialogContent>
          {$t(contentDescription[confirmationType] as MessageDescriptor, { count: rulesCount })
            + ' ' + $t(cautionDescription)}
        </UI.DialogContent>
        <UI.TypeContent>
          {typeWords}
          <Input
            onChange={(e) => {
              modal.update({ okButtonProps: { disabled: e.target.value !== typeText } })
            }}
            style={{ width: 80, marginLeft: 5 }}
          />
        </UI.TypeContent>
      </>,
      okButtonProps: { disabled: true },
      onOk: () => doUpdate(),
      icon: <> </>
    })
    return modal
  }
  return <Button size='small'
    onClick={() => {
      if(confirmationType === ApplicationConfirmType.NEW_APP_ONLY) {
        doUpdate()
      } else {
        showModal()
      }
    }}
    type='primary'
    disabled={disabled}
    style={!disabled ? {
      backgroundColor: 'var(--acx-accents-orange-50)',
      borderColor: 'var(--acx-accents-orange-50)'
    } : {}}>
    {$t({ defaultMessage: 'Update' })}
  </Button>
}

