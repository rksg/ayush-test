import { useState } from 'react'


import { useIntl } from 'react-intl'

import { Modal, ModalType } from '@acx-ui/components'

import { ReactComponent as Logo } from './assets/gptDog.svg'
import * as UI                    from './styledComponents'

export default function RuckusGptButton () {
  const [visible, setVisible] = useState(false)
  const { $t } = useIntl()



  return <>
    <UI.ButtonSolid
      icon={<Logo />}
      onClick={()=> {
        setVisible(!visible)
      }}
    />
    <Modal
      title={$t({ defaultMessage: 'Add Guest Pass Network' })}
      type={ModalType.ModalStepsForm}
      visible={visible}
      mask={true}
      children={<div/>}
    />
    {/* <AlarmsDrawer visible={visible} setVisible={setVisible}/> */}
  </>
}

export {
  RuckusGptButton
}
