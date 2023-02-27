import React, { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Modal, ModalType } from '@acx-ui/components'

import RogueAPDetectionForm from './RogueAPDetectionForm/RogueAPDetectionForm'

const RogueApModal = () => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)

  return <>
    <Button
      type='link'
      onClick={() => setVisible(true)}
    >
      {$t({ defaultMessage: 'Add Profile' })}
    </Button>
    <Modal
      title={$t({ defaultMessage: 'Add Rogue AP Detection Policy' })}
      visible={visible}
      type={ModalType.ModalStepsForm}
      children={
        <RogueAPDetectionForm
          edit={false}
          modalMode={true}
          modalCallBack={() => setVisible(false)}
        />}
      onCancel={() => setVisible(false)}
    />
  </>
}

export default RogueApModal
