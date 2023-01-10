import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button }        from '@acx-ui/components'
import { AAAPolicyType } from '@acx-ui/rc/utils'


import AAAForm from '../../../Policies/AAA/AAAForm/AAAForm'
import * as UI from '../styledComponents'

export default function AAAPolicyModal (props:{
  updateInstance: (value:AAAPolicyType) => void
}) {
  const { updateInstance }=props
  const { $t } = useIntl()
  const onClose = () => {
    setVisible(false)
  }
  const [visible, setVisible]=useState(false)
  const getContent = <AAAForm networkView={true}
    edit={false}
    backToNetwork={(data)=>{
      onClose()
      if(data)updateInstance(data)
    }}/>

  return (
    <div style={{ marginTop: 28, marginLeft: 10 }}>
      <Button type='link' onClick={()=>setVisible(true)}>
        {$t({ defaultMessage: 'Add Server' })}
      </Button>
      <UI.Drawer
        title={$t({ defaultMessage: 'Add AAA Server' })}
        visible={visible}
        onClose={onClose}
        mask={true}
        children={getContent}
        destroyOnClose={true}
        width={'calc( 100% - var(--acx-sider-width))'}
      />
    </div>
  )
}
