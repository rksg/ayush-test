import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Loader, Modal, ModalType, showToast, StepsForm } from '@acx-ui/components'
import { Features }                                               from '@acx-ui/feature-toggle'
import { ServiceType, TunnelTypeEnum }                            from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady }                    from '../../useEdgeActions'
import { TunnelProfileForm, TunnelProfileFormType } from '../TunnelProfileForm'
import { useTunnelProfileActions }                  from '../TunnelProfileForm/useTunnelProfileActions'

export const TunnelProfileAddModal = (props: { fromServiceType?: ServiceType }) => {
  const { fromServiceType } = props
  const { $t } = useIntl()
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
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
    if (visible && fromServiceType && isEdgeSdLanReady) {
      let tunnelType
      if (fromServiceType === ServiceType.NETWORK_SEGMENTATION) {
        tunnelType = TunnelTypeEnum.VXLAN
      } else if (fromServiceType === ServiceType.EDGE_SD_LAN) {
        tunnelType = TunnelTypeEnum.VLAN_VXLAN
      } else {
      }

      form.setFieldValue('type', tunnelType)
      if (tunnelType) form.setFieldValue('disableTunnelType', true)
    }
  }, [visible, fromServiceType, isEdgeSdLanReady])

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
