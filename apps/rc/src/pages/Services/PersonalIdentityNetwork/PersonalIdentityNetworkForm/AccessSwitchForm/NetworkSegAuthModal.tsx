import React, { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Modal, ModalType } from '@acx-ui/components'

import NetworkSegAuthForm from '../../../NetworkSegWebAuth/NetworkSegAuthForm'

export const NetworkSegAuthModal = (props: {
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
      title={$t({ defaultMessage: 'Add PIN Portal for Switch' })}
      visible={visible}
      destroyOnClose={true}
      type={ModalType.ModalStepsForm}
      width={700}
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
