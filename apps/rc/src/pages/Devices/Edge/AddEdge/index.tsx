
import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  PageHeader, showActionModal,
  StepsForm
} from '@acx-ui/components'
import {
  EdgeSettingForm
} from '@acx-ui/rc/components'
import { useAddEdgeMutation }                     from '@acx-ui/rc/services'
import { CatchErrorResponse, EdgeGeneralSetting } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { getErrorModalInfo } from './errorMessageMapping'

const AddEdge = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [addEdge] = useAddEdgeMutation()

  const handleAddEdge = async (data: EdgeGeneralSetting) => {
    try {
      await addEdge({ payload: data }).unwrap()
      navigate(linkToEdgeList, { replace: true })
    } catch (error) {
      showActionModal({
        type: 'error',
        ...getErrorModalInfo(error as CatchErrorResponse)
      })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add SmartEdge' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'SmartEdge' }), link: '/devices/edge' }
        ]}
      />
      <StepsForm
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
