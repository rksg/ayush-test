import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Demo } from '@acx-ui/rc/utils'

import PortalDemo from '../PortalDemo/PortalDemo'
import * as UI    from '../styledComponents'

export default function PortalPreviewModal (props:{
  demoValue?: Demo
}) {
  const { $t } = useIntl()
  const { demoValue } = props
  const [visible, setVisible]=useState(false)
  const getContent = <PortalDemo value={demoValue} isPreview={true}/>

  return (
    <>
      <UI.FieldTextLink onClick={()=>setVisible(true)}>
        {$t({ defaultMessage: 'Preview' })}
      </UI.FieldTextLink>
      <UI.Modal
        title={$t({ defaultMessage: 'Preview' })}
        visible={visible}
        onCancel={()=>setVisible(false)}
        width={1000}
        style={{ paddingLeft: 50 }}
        footer={null}
        closable={true}
        maskClosable={false}
      >
        {getContent}
      </UI.Modal>
    </>

  )
}

