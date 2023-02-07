import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'
import { Portal } from '@acx-ui/rc/utils'

import PortalForm from '../../../../Services/Portal/PortalForm/PortalForm'
import * as UI    from '../styledComponents'

export default function PortalServiceModal (props:{
  updateInstance: (value:Portal) => void
}) {
  const { updateInstance }=props
  const { $t } = useIntl()
  const onClose = () => {
    setVisible(false)
  }
  const [visible, setVisible]=useState(false)
  const getContent = <PortalForm networkView={true}
    backToNetwork={(data)=>{
      onClose()
      if(data)updateInstance(data)
    }}/>

  return (
    <>
      <Button type='link' onClick={()=>setVisible(true)}>
        {$t({ defaultMessage: 'Add Guest Portal Service' })}
      </Button>
      <UI.Drawer
        title={$t({ defaultMessage: 'Add Portal Service' })}
        visible={visible}
        onClose={onClose}
        mask={true}
        children={getContent}
        destroyOnClose={true}
        width={'calc( 100% - var(--acx-sider-width))'}
      />
    </>
  )
}
