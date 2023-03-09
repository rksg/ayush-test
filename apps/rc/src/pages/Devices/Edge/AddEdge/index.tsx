import { useRef } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  PageHeader, StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  EdgeSettingForm
} from '@acx-ui/rc/components'
import { useAddEdgeMutation } from '@acx-ui/rc/services'
import { EdgeGeneralSetting } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

const AddEdge = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge/list')
  const formRef = useRef<StepsFormInstance<EdgeGeneralSetting>>()
  const [addEdge] = useAddEdgeMutation()

  const handleAddEdge = async (data: EdgeGeneralSetting) => {
    try {
      await addEdge({ payload: data }).unwrap()
      navigate(linkToEdgeList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add SmartEdge' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'SmartEdge' }), link: '/devices/edge/list' }
        ]}
      />
      <StepsForm
        formRef={formRef}
        onFinish={handleAddEdge}
        onCancel={() => navigate(linkToEdgeList)}
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
