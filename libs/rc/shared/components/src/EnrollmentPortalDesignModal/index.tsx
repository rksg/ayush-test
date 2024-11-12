import { useRef } from 'react'

import { Modal } from 'antd'


import PortalDesign from './PortalDesign'
import * as UI      from './styledComponents'
export interface EnrollmentPortalDesignModalProps {
  id: string
  onFinish?: ()=>void
}

export function EnrollmentPortalDesignModal (props: EnrollmentPortalDesignModalProps) {
  const { id, onFinish } = props
  const portalRef = useRef<{ onFinish: ()=> Promise<boolean> }>(null)
  return (
    <Modal
      destroyOnClose={true}
      closable={true}
      width={'100%'}
      bodyStyle={{
        padding: 0,
        height: '90%'
      }}
      visible
      className={UI.modalClassName}
      maskClosable={false}
      footer={null}
      onCancel={async ()=> {
        if (portalRef?.current) {
          await portalRef.current.onFinish()
            .then((res)=> {
              if (res) {
                onFinish && onFinish()
              }
            })
        } else {
          onFinish && onFinish()
        }
      }}
    >
      <PortalDesign id={id} ref={portalRef}/>
    </Modal>
  )
}