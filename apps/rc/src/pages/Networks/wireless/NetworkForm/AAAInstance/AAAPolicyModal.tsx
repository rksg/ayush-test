import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Modal, ModalType }        from '@acx-ui/components'
import { AAAPolicyType, AAA_LIMIT_NUMBER } from '@acx-ui/rc/utils'

import AAAForm from '../../../../Policies/AAA/AAAForm/AAAForm'


export default function AAAPolicyModal (props:{
  type?: string,
  updateInstance: (value:AAAPolicyType) => void,
  aaaCount: number
  disabled?: boolean
}) {
  const { updateInstance, aaaCount, type }=props
  const { $t } = useIntl()
  const onClose = () => {
    setVisible(false)
  }
  const [visible, setVisible]=useState(false)
  const getContent = <AAAForm networkView={true}
    edit={false}
    type={type}
    backToNetwork={(data)=>{
      onClose()
      if(data)updateInstance(data)
    }}/>
  return (
    <>
      <Button type='link'
        onClick={()=>setVisible(true)}
        disabled={aaaCount>=AAA_LIMIT_NUMBER || props.disabled}>
        {$t({ defaultMessage: 'Add Server' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Add AAA Server' })}
        type={ModalType.ModalStepsForm}
        visible={visible}
        mask={true}
        children={getContent}
        destroyOnClose={true}
        width={600}
        bodyStyle={{ width: '600px' }}
      />
    </>
  )
}
