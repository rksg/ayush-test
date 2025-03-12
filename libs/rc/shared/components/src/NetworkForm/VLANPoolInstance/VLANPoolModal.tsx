import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Modal, ModalType }                                                                             from '@acx-ui/components'
import { VLANPoolPolicyType, VLAN_LIMIT_NUMBER, PolicyType, PolicyOperation, useTemplateAwarePolicyPermission } from '@acx-ui/rc/utils'

import { VLANPoolForm } from '../../policies/VLANPoolForm'
import * as UI          from '../styledComponents'

export default function VLANPoolModal (props:{
  updateInstance: (value:VLANPoolPolicyType) => void,
  vlanCount: number
}) {
  const { updateInstance, vlanCount }=props
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

  // eslint-disable-next-line max-len
  if (!useTemplateAwarePolicyPermission(PolicyType.VLAN_POOL, PolicyOperation.CREATE)) return null

  return (
    <UI.ButtonContainer>
      <Button type='link'
        onClick={()=>setVisible(true)}
        disabled={vlanCount>=VLAN_LIMIT_NUMBER}
      >
        {$t({ defaultMessage: 'Add Pool' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Add VLAN Pool' })}
        visible={visible}
        type={ModalType.ModalStepsForm}
        mask={true}
        children={getContent}
        destroyOnClose={true}
        width={600}
      />
    </UI.ButtonContainer>
  )
}
