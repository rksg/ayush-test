import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button }             from '@acx-ui/components'
import { VLANPoolPolicyType } from '@acx-ui/rc/utils'


import VLANPoolForm from '../../../Policies/VLANPool/VLANPoolForm/VLANPoolForm'
import * as UI      from '../styledComponents'

export default function VLANPoolModal (props:{
  updateInstance: (value:VLANPoolPolicyType) => void
}) {
  const { updateInstance }=props
  const { $t } = useIntl()
  const onClose = () => {
    setVisible(false)
  }
  const [visible, setVisible]=useState(false)
  const getContent = <VLANPoolForm networkView={true}
    edit={false}
    backToNetwork={(data)=>{
      onClose()
      if(data)updateInstance(data)
    }}/>

  return (
    <UI.ButtonContainer>
      <Button type='link' onClick={()=>setVisible(true)}>
        {$t({ defaultMessage: 'Add Pool' })}
      </Button>
      <UI.Drawer
        title={$t({ defaultMessage: 'Add VLAN Pool' })}
        visible={visible}
        onClose={onClose}
        mask={true}
        children={getContent}
        destroyOnClose={true}
        width={'calc( 100% - var(--acx-sider-width))'}
      />
    </UI.ButtonContainer>
  )
}
