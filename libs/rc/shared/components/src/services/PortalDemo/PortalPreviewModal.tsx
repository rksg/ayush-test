

import { useCallback, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { showActionModal } from '@acx-ui/components'
import { Demo }            from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'

import * as UI from './styledComponents'

import { PortalDemo } from './index'

export default function PortalPreviewModal (props:{
  demoValue?: Demo,
  portalLang: { [key:string]:string },
  fromPortalList?: boolean,
  portalId?: string,
  id?: string,
  resetDemo?: () => void
}) {
  const { $t } = useIntl()
  const [isVisibledDemoModal, setIsVisibledDemoModal]=useState(false)

  const onCancel = useCallback(() => {
    setIsVisibledDemoModal(false)
    props.resetDemo && props.resetDemo()
  }, [props])

  const openModal= useCallback(async () => {
    const getContent = <Provider><PortalDemo value={props.demoValue}
      isPreview={true}
      viewPortalLang={props.portalLang}
    /></Provider>
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

  },[props.demoValue, props.portalLang, props.fromPortalList])

  useEffect(()=>{
    if (isVisibledDemoModal && props.fromPortalList && props.portalId!==props.id) {
      setIsVisibledDemoModal(false)
    }
  }, [props.portalId, props.id, isVisibledDemoModal, props.fromPortalList])

  useEffect(()=>{
    if(!isVisibledDemoModal && props.fromPortalList && props.portalLang.accept&&
      props.portalId===props.id){
      const content = <Provider><PortalDemo value={props.demoValue}
        isPreview={true}
        viewPortalLang={props.portalLang}
      /></Provider>
      setIsVisibledDemoModal(true)
      showActionModal({
        type: 'confirm',
        content: content,
        okCancel: false,
        closable: true,
        width: '100%',
        okButtonProps: { style: { display: 'none' } },
        bodyStyle: { padding: 0 },
        className: UI.modalClassName,
        onCancel
      })
    }
  }, [props.portalLang, props.portalId,
    props.fromPortalList, props.id,
    props.demoValue, onCancel, isVisibledDemoModal])
  return (
    <UI.Button onClick={openModal} type='default' size='small'>
      <UI.ModalStyle />
      {props.fromPortalList?<UI.EyeOpenPreview/>:$t({ defaultMessage: 'Preview' })}
    </UI.Button>
  )
}

