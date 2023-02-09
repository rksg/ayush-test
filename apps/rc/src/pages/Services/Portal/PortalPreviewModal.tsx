

import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { showActionModal } from '@acx-ui/components'
import { Demo }            from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'

import PortalDemo from './PortalDemo'
import * as UI    from './styledComponents'

export default function PortalPreviewModal (props:{
  demoValue?: Demo,
  portalLang: { [key:string]:string },
  fromPortalList?: boolean,
  portalId?: string,
  id?: string
}) {
  useEffect(()=>{
    if(props.portalLang.accept&&props.fromPortalList&&props.portalId===props.id){
      const content = <Provider><PortalDemo value={demoValue}
        isPreview={true}
        viewPortalLang={props.portalLang}
      /></Provider>
      showActionModal({
        type: 'confirm',
        content: content,
        okCancel: false,
        closable: true,
        width: '100%',
        okButtonProps: { style: { display: 'none' } },
        bodyStyle: { padding: 0 },
        className: UI.modalClassName
      })
    }
  }, [props.portalLang])
  const { $t } = useIntl()
  const { demoValue } = props
  const getContent = <Provider><PortalDemo value={demoValue}
    isPreview={true}
    viewPortalLang={props.portalLang}
  /></Provider>
  const openModal= ()=>{
    !props.fromPortalList&&showActionModal({
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
      {props.fromPortalList?<UI.EyeOpenPreview/>:$t({ defaultMessage: 'Preview' })}
    </UI.Button>
  )
}

