import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Loader, Modal, ModalType, showToast, StepsForm } from '@acx-ui/components'

import { TunnelProfileForm, TunnelProfileFormType } from '../TunnelProfileForm'
import { useTunnelProfileActions }                  from '../TunnelProfileForm/useTunnelProfileActions'

interface TunnelProfileAddModalProps {
  defaultValues?: TunnelProfileFormType,
}

export const TunnelProfileAddModal = (props: TunnelProfileAddModalProps) => {
  const { defaultValues } = props
  const { $t } = useIntl()
  const [ form ] = Form.useForm()
  const [visible, setVisible] = useState(false)
  const { createTunnelProfile, isTunnelProfileCreating } = useTunnelProfileActions()

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
      form={form}
      onFinish={handleCreateTunnelProfile}
      onCancel={() => setVisible(false)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
    >
      <StepsForm.StepForm>
        <TunnelProfileForm />
      </StepsForm.StepForm>
    </StepsForm>
  </Loader>

  useEffect(() => {
    if (visible && defaultValues) {
      form.setFieldsValue(defaultValues)
    }
  }, [visible, defaultValues])

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
