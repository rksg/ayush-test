import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, Modal, ModalType, showToast, StepsForm }   from '@acx-ui/components'
import { getTunnelProfileFormDefaultValues, TunnelProfileFormType } from '@acx-ui/rc/utils'

import { TunnelProfileForm }       from '../TunnelProfileForm'
import { useTunnelProfileActions } from '../TunnelProfileForm/useTunnelProfileActions'

interface TunnelProfileAddModalProps {
  initialValues?: TunnelProfileFormType
}
export const TunnelProfileAddModal = (props: TunnelProfileAddModalProps) => {
  const { initialValues } = props
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const { createTunnelProfileOperation, isTunnelProfileCreating } = useTunnelProfileActions()

  const handleCreateTunnelProfile = async (data: TunnelProfileFormType) => {
    try {
      await createTunnelProfileOperation(data)
      setVisible(false)
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const formInitValues = getTunnelProfileFormDefaultValues(initialValues)

  const content = <Loader states={[{ isLoading: false, isFetching: isTunnelProfileCreating }]}>
    <StepsForm
      onFinish={handleCreateTunnelProfile}
      onCancel={() => setVisible(false)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
      initialValues={formInitValues}
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
