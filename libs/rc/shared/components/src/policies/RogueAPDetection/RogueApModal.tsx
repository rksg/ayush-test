import React, { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Modal, ModalType } from '@acx-ui/components'

import { RogueAPDetectionForm } from './RogueAPDetectionForm/RogueAPDetectionForm'

export const RogueApModal = (props: {
  setPolicyId: (id: string) => void
}) => {
  const { $t } = useIntl()
  const { setPolicyId } = props
  const [visible, setVisible] = useState(false)

  return <>
    <Button
      type='link'
      onClick={() => setVisible(true)}
    >
      {$t({ defaultMessage: 'Add Profile' })}
    </Button>
    {visible && <Modal
      title={$t({ defaultMessage: 'Add Rogue AP Detection Policy' })}
      visible={visible}
      type={ModalType.ModalStepsForm}
      children={
        <RogueAPDetectionForm
          edit={false}
          modalMode={true}
          modalCallBack={(id) => {
            if (id && visible) {
              setPolicyId(id)
            }
            setVisible(false)
          }}
        />}
      onCancel={() => setVisible(false)}
    />}
  </>
}
