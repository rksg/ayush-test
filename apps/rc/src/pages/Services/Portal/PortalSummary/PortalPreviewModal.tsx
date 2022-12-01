

import { useIntl } from 'react-intl'

import { showActionModal } from '@acx-ui/components'
import { Demo }            from '@acx-ui/rc/utils'

import PortalDemo from '../PortalDemo'
import * as UI    from '../styledComponents'

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
      title: $t({ defaultMessage: 'Preview' }),
      width: '1000px',
      bodyStyle: { marginLeft: 25, paddingRight: 50 }
    })
  }
  return (
    <UI.Button onClick={()=>openModal()} type='default' size='small'>
      {$t({ defaultMessage: 'Preview' })}
    </UI.Button>
  )
}

