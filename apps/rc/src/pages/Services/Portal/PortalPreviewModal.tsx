

import { useIntl } from 'react-intl'

import { showActionModal } from '@acx-ui/components'
import { Demo }            from '@acx-ui/rc/utils'

import PortalDemo from './PortalDemo'
import * as UI    from './styledComponents'

export default function PortalPreviewModal (props:{
  demoValue?: Demo
}) {
  const { $t } = useIntl()
  const { demoValue } = props
  const getContent = <PortalDemo value={demoValue} isPreview={true}/>
  const openModal= ()=>{
    showActionModal({
      type: 'confirm',
      content: getContent,
      okCancel: false,
      closable: true,
      width: '100%',
      okButtonProps: { style: { display: 'none' } },
      bodyStyle: { padding: 0 },
      className: UI.modalClassName
    })
  }
  return (
    <UI.Button onClick={()=>openModal()} type='default' size='small'>
      <UI.ModalStyle />
      {$t({ defaultMessage: 'Preview' })}
    </UI.Button>
  )
}

