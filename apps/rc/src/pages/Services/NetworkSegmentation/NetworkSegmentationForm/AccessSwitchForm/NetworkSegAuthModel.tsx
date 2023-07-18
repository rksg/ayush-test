import React, { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Modal, ModalType } from '@acx-ui/components'

import NetworkSegAuthForm from '../../../NetworkSegWebAuth/NetworkSegAuthForm'

export const NetworkSegAuthModel = (props: {
  setWebAuthTemplateId: (id: string) => void
}) => {
  const { $t } = useIntl()
  const { setWebAuthTemplateId } = props
  const [visible, setVisible] = useState(false)

  return <>
    <Button
      type='link'
      onClick={() => setVisible(true)}
    >
      {$t({ defaultMessage: 'Add' })}
    </Button>
    <Modal
      title={$t({ defaultMessage: 'Add Network Segmentation Auth page for Switch' })}
      visible={visible}
      type={ModalType.ModalStepsForm}
      width={680}
      children={
        <NetworkSegAuthForm editMode={false}
          modalMode={true}
          modalCallBack={(id) => {
            setVisible(false)
            id && setWebAuthTemplateId(id)
          }}
        />}
      onCancel={() => setVisible(false)}
    />
  </>
}
