import { useRef } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader, showToast, StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  EdgeDHCPSettingForm
} from '@acx-ui/rc/components'
import { useAddEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import { EdgeDhcpSetting }               from '@acx-ui/rc/utils'

const AddDHCP = () => {

  const { $t } = useIntl()
  const formRef = useRef<StepsFormInstance<EdgeDhcpSetting>>()
  const [addEdgeDhcp] = useAddEdgeDhcpServiceMutation()

  const handleAddEdgeDhcp = async (data: EdgeDhcpSetting) => {
    try {
      const payload = { ...data }
      await addEdgeDhcp({ payload: payload }).unwrap()
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'DHCP for SmartEdge' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <StepsForm
        formRef={formRef}
        onFinish={handleAddEdgeDhcp}
        buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <EdgeDHCPSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default AddDHCP
