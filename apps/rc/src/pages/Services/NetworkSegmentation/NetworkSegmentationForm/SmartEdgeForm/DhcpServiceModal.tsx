import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, Modal, ModalType, showToast, StepsForm } from '@acx-ui/components'
import { EdgeDhcpSettingForm }                                    from '@acx-ui/rc/components'
import { useAddEdgeDhcpServiceMutation }                          from '@acx-ui/rc/services'
import { convertEdgeDHCPFormDataToApiPayload, EdgeDhcpSetting }   from '@acx-ui/rc/utils'

export const DhcpServiceModal = () => {
  const { $t } = useIntl()
  const [visible, setVisible]=useState(false)
  const [addEdgeDhcp, { isLoading: isFormSubmitting }] = useAddEdgeDhcpServiceMutation()

  const handleAddEdgeDhcp = async (data: EdgeDhcpSetting) => {
    try {
      const payload = convertEdgeDHCPFormDataToApiPayload(data)
      await addEdgeDhcp({ payload: payload }).unwrap()
      setVisible(false)
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const content = <Loader states={[{ isLoading: false, isFetching: isFormSubmitting }]}>
    <StepsForm
      onFinish={handleAddEdgeDhcp}
      onCancel={() => setVisible(false)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
    >
      <StepsForm.StepForm>
        <EdgeDhcpSettingForm />
      </StepsForm.StepForm>
    </StepsForm>
  </Loader>

  return (
    <>
      <Button type='link' onClick={()=>setVisible(true)} data-testid='addDhcpServiceButton'>
        {$t({ defaultMessage: 'Add' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Add DHCP for SmartEdge Service' })}
        width={1000}
        visible={visible}
        type={ModalType.ModalStepsForm}
        mask={true}
        children={content}
        destroyOnClose={true}
      />
    </>
  )
}
