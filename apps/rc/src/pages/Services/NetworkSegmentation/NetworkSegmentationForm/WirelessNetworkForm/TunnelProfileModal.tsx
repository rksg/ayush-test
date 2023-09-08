import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Loader, Modal, ModalType, showToast, StepsForm }            from '@acx-ui/components'
import { TunnelProfileForm, TunnelProfileFormType, useTunnelProfileActions } from '@acx-ui/rc/components'



export const TunnelProfileModal = () => {

  const { $t } = useIntl()
  const params = useParams()
  const [visible, setVisible]=useState(false)
  const { createTunnelProfile, isTunnelProfileCreating } = useTunnelProfileActions(params)

  const handleCreateTunnelProfile = async (data: TunnelProfileFormType) => {
    try {
      await createTunnelProfile(data)
      setVisible(false)
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const content = <Loader states={[{ isLoading: false, isFetching: isTunnelProfileCreating }]}>
    <StepsForm
      onFinish={handleCreateTunnelProfile}
      onCancel={() => setVisible(false)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
    >
      <StepsForm.StepForm>
        <TunnelProfileForm />
      </StepsForm.StepForm>
    </StepsForm>
  </Loader>

  return (
    <>
      <Button type='link' onClick={()=>setVisible(true)}>
        {$t({ defaultMessage: 'Add' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Add Tunnel Profile' })}
        width={1100}
        visible={visible}
        type={ModalType.ModalStepsForm}
        mask={true}
        children={content}
        destroyOnClose={true}
      />
    </>
  )
}
