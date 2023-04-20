import { Input, Modal }                     from 'antd'
import { MessageDescriptor, defineMessage } from 'react-intl'

import { Button }  from '@acx-ui/components'
import { getIntl } from '@acx-ui/utils'

import * as UI from './styledComponents'

export const UpdateConfirms = ()=>{
  const { $t } = getIntl()
  const title = $t({ defaultMessage: 'Update Application policy?' })
  const contentType='C'
  const contentDescription: Record<string, MessageDescriptor> = {
    A: defineMessage({ defaultMessage: 'Note that all impacted policies/rules that are '+
      'on this tenant will be updated. Are you sure you want to update the application '+
      'under this tenant?' }),
    B: defineMessage({ defaultMessage: 'Note that all impacted policies/rules that are '+
    'on this tenant will be updated/removed. Are you sure you want to update the application '+
    'under this tenant?' }),
    C: defineMessage({ defaultMessage: 'Note that {count} impacted rules that are '+
    'on this tenant will be updated. Are you sure you want to update the application '+
    'under this tenant?' }),
    D: defineMessage({ defaultMessage: 'Note that {count} impacted rules that are '+
    'on this tenant will be removed. Are you sure you want to update the application '+
    'under this tenant?' })
  }
  const typeWords = $t({ defaultMessage: 'Type the word "{text}" to confirm:' }, { text: 'Update' })
  const showModal = ()=>{
    const modal = Modal.confirm({
      type: 'confirm',
      title,
      okText: $t({ defaultMessage: 'Update' }),
      content: <><UI.DialogContent>{$t(contentDescription[contentType], { count: 3 })}
      </UI.DialogContent>
      <UI.TypeContent>{typeWords}<Input onChange={(e)=>{
        modal.update({ okButtonProps: { disabled: e.target.value !== 'Update' } })
      }}
      style={{ width: 80, marginLeft: 5 }}
      /></UI.TypeContent></>,
      okButtonProps: { disabled: true },
      onOk: ()=>{
      },
      icon: <> </>
    })
    return modal
  }
  return <Button size='small'
    onClick={()=>{
      showModal()
    }}
    type='primary'
    style={{
      backgroundColor: 'var(--acx-accents-orange-50)',
      borderColor: 'var(--acx-accents-orange-50)'
    }}>
    {$t({ defaultMessage: 'Update' })}
  </Button>
}

