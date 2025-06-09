import { useState } from 'react'

import { Modal }   from 'antd'
import { useIntl } from 'react-intl'

import { Demo } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

import { PortalDemo } from './index'

export default function PortalPreviewModal (props:{
  demoValue?: Demo,
  portalLang: { [key:string]:string },
  fromPortalList?: boolean,
  onPreviewClick?: () => void,
  resetDemo?: () => void
}) {
  const { $t } = useIntl()
  const { demoValue, portalLang, fromPortalList } = props
  const [isVisibledDemoModal, setIsVisibledDemoModal] = useState(false)

  const onCancel = () => {
    setIsVisibledDemoModal(false)
    props.resetDemo && props.resetDemo()
  }

  const openModal = () => {
    props.onPreviewClick && props.onPreviewClick()
    setIsVisibledDemoModal(true)
  }

  return <>
    <UI.Button onClick={openModal} type='default' size='small' disabled={isVisibledDemoModal}>
      {fromPortalList ? <UI.EyeOpenPreview /> : $t({ defaultMessage: 'Preview' })}
    </UI.Button>
    <Modal
      visible={isVisibledDemoModal && !!demoValue?.componentDisplay} // check if demoValue is not empty
      footer={null}
      onCancel={onCancel}
      closable={true}
      width='100%'
      bodyStyle={{ padding: 0 }}
      className={UI.modalClassName}
    >
      <PortalDemo value={demoValue}
        isPreview={true}
        viewPortalLang={portalLang}
      />
    </Modal>
  </>
}

