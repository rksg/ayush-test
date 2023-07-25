import { useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Loader, Modal, ModalType, showToast, StepsFormLegacy } from '@acx-ui/components'
import { EdgeDhcpSettingForm }                                          from '@acx-ui/rc/components'
import { useAddEdgeDhcpServiceMutation }                                from '@acx-ui/rc/services'
import { EdgeDhcpSetting }                                              from '@acx-ui/rc/utils'



export const DhcpServiceModal = () => {

  const { $t } = useIntl()
  const [visible, setVisible]=useState(false)
  const [addEdgeDhcp, { isLoading: isFormSubmitting }] = useAddEdgeDhcpServiceMutation()

  const handleAddEdgeDhcp = async (data: EdgeDhcpSetting) => {
    try {
      const payload = _.cloneDeep(data)

      // should not create service with id
      payload.dhcpPools.forEach(item => item.id = '')
      payload.dhcpOptions?.forEach(item => item.id = '')
      payload.hosts?.forEach(item => item.id = '')

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
    <StepsFormLegacy
      onFinish={handleAddEdgeDhcp}
      onCancel={() => setVisible(false)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
    >
      <StepsFormLegacy.StepForm>
        <EdgeDhcpSettingForm />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>

  return (
    <>
      <Button type='link' onClick={()=>setVisible(true)}>
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
