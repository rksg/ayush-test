

import { useIntl } from 'react-intl'

import { showActionModal } from '@acx-ui/components'
import { Demo }            from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'

import PortalDemo from './PortalDemo'
import * as UI    from './styledComponents'

export default function PortalPreviewModal (props:{
  demoValue?: Demo,
  portalLang: { [key:string]:string },
}) {
  const { $t } = useIntl()
  const { demoValue } = props
  const getContent = <Provider><PortalDemo value={demoValue}
    isPreview={true}
    viewPortalLang={props.portalLang}
  /></Provider>
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

