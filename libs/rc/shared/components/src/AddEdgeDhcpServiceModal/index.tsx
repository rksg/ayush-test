import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, Modal, ModalType, showToast, StepsForm } from '@acx-ui/components'
import { EdgeDhcpSetting, EdgeDhcpUrls }                          from '@acx-ui/rc/utils'
import { getOpsApi }                                              from '@acx-ui/utils'

import { EdgeDhcpSettingForm } from '../EdgeDhcpSetting/EdgeDhcpSettingForm'
import { useEdgeDhcpActions }  from '../EdgeDhcpSetting/useEdgeDhcpActions'

export const AddEdgeDhcpServiceModal = () => {
  const { $t } = useIntl()
  const [visible, setVisible]=useState(false)
  const { createEdgeDhcpProfile, isEdgeDhcpProfileCreating } = useEdgeDhcpActions()

  const handleAddEdgeDhcp = async (data: EdgeDhcpSetting) => {
    try {
      await createEdgeDhcpProfile(data)
      setVisible(false)
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const content = <Loader states={[{ isLoading: false, isFetching: isEdgeDhcpProfileCreating }]}>
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
      <Button type='link'
        rbacOpsIds={[getOpsApi(EdgeDhcpUrls.addDhcpService)]}
        onClick={()=>setVisible(true)}
        data-testid='addDhcpServiceButton'
      >
        {$t({ defaultMessage: 'Add' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Add DHCP for RUCKUS Edge Service' })}
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
