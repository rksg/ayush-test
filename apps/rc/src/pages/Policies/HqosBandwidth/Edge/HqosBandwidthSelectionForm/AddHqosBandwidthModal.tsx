import { useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Loader, Modal, ModalType, showToast } from '@acx-ui/components'
import { useCreateEdgeHqosProfileMutation }            from '@acx-ui/rc/services'
import { EdgeHqosProfilesUrls }                        from '@acx-ui/rc/utils'
import { getOpsApi }                                   from '@acx-ui/utils'

import HqosBandwidthForm, { HqosBandwidthFormModel } from '../HqosBandwidthForm'
import { SettingsForm }                              from '../HqosBandwidthForm/SettingsForm'
import { SummaryForm }                               from '../HqosBandwidthForm/SummaryForm'


export const AddHqosBandwidthModal = () => {
  const { $t } = useIntl()
  const [visible, setVisible]=useState(false)
  const [addQosProfile,
    { isLoading: isEdgeQosBandwidthCreating }
  ] = useCreateEdgeHqosProfileMutation()
  const [form] = Form.useForm()

  const steps = [
    {
      title: $t({ defaultMessage: 'Settings' }),
      content: <SettingsForm />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    }
  ]

  const handleFinish = async (formData: HqosBandwidthFormModel) => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        trafficClassSettings: formData.trafficClassSettings
      }

      await addQosProfile({ payload }).unwrap()
      setVisible(false)
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const content = <Loader states={[{ isLoading: false, isFetching: isEdgeQosBandwidthCreating }]}>
    <HqosBandwidthForm
      form={form}
      steps={steps}
      onFinish={handleFinish}
      onCancel={() => setVisible(false)}
    />
  </Loader>

  return (
    <>
      <Button type='link'
        rbacOpsIds={[getOpsApi(EdgeHqosProfilesUrls.addEdgeHqosProfile)]}
        onClick={()=>setVisible(true)}
        data-testid='addHqosBandwidthButton'
      >
        {$t({ defaultMessage: 'Add' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Add HQos for RUCKUS Edge Profile' })}
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
