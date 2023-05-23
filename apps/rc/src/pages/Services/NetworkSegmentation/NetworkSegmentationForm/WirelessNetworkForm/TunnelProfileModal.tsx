import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, Modal, ModalType, showToast, StepsFormLegacy } from '@acx-ui/components'
import { TunnelProfileForm }                                            from '@acx-ui/rc/components'
import { useCreateTunnelProfileMutation }                               from '@acx-ui/rc/services'
import { TunnelProfile }                                                from '@acx-ui/rc/utils'



export const TunnelProfileModal = () => {

  const { $t } = useIntl()
  const [visible, setVisible]=useState(false)
  const [createTunnelProfile, { isLoading: isFormSubmitting }] = useCreateTunnelProfileMutation()

  const handleCreateTunnelProfile = async (data: TunnelProfile) => {
    try {
      await createTunnelProfile({ payload: data }).unwrap()
      setVisible(false)
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const content = <Loader states={[{ isLoading: false, isFetching: isFormSubmitting }]}>
    <StepsFormLegacy
      onFinish={handleCreateTunnelProfile}
      onCancel={() => setVisible(false)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
    >
      <StepsFormLegacy.StepForm>
        <TunnelProfileForm />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>

  return (
    <>
      <Button type='link' onClick={()=>setVisible(true)}>
        {$t({ defaultMessage: 'Add' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Add Tunnel Profile' })}
        width={600}
        visible={visible}
        type={ModalType.ModalStepsForm}
        mask={true}
        children={content}
        destroyOnClose={true}
      />
    </>
  )
}
