import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Modal, ModalType } from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { AAAPolicyType }            from '@acx-ui/rc/utils'
import { notAvailableMsg }          from '@acx-ui/utils'

import AAAForm from '../../../../Policies/AAA/AAAForm/AAAForm'


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
    <>
      <Button type='link'
        title={!useIsSplitOn(Features.POLICIES)?$t(notAvailableMsg):''}
        onClick={()=>setVisible(true)}
        disabled={!useIsSplitOn(Features.POLICIES)}>
        {$t({ defaultMessage: 'Add Server' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Add AAA (802.1x) Server' })}
        type={ModalType.ModalStepsForm}
        visible={visible}
        mask={true}
        children={getContent}
        destroyOnClose={true}
      />
    </>
  )
}
