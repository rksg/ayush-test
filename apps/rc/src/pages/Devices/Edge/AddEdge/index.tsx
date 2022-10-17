import { useRef } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  PageHeader, StepsForm, StepsFormInstance
} from '@acx-ui/components'
import {
  showToast
} from '@acx-ui/components'
import { useAddEdgeMutation } from '@acx-ui/rc/services'
import { EdgeSaveData }       from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import EdgeSettingForm from '../../../../components/Edge/Form/EdgeSettingForm'


const AddEdge = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToDevices = useTenantLink('/devices')
  const formRef = useRef<StepsFormInstance<EdgeSaveData>>()
  const [addEdge] = useAddEdgeMutation()

  const handleAddEdge = async (data: EdgeSaveData) => {
    try {
      const formData = { ...data }
      await addEdge({ payload: formData }).unwrap()
      navigate(linkToDevices, { replace: true })
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
        title={$t({ defaultMessage: 'Add SmartEdge' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'SmartEdge' }), link: '/devices' }
        ]}
      />
      <StepsForm
        formRef={formRef}
        onFinish={handleAddEdge}
        onCancel={() => navigate(linkToDevices)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <EdgeSettingForm />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default AddEdge