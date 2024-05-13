import { useContext, useEffect } from 'react'

import { Col, Form, Row } from 'antd'

import { StepsForm }             from '@acx-ui/components'
import { EdgeSettingForm }       from '@acx-ui/rc/components'
import { useUpdateEdgeMutation } from '@acx-ui/rc/services'
import { EdgeGeneralSetting }    from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { EditEdgeDataContext } from '../EditEdgeDataProvider'

const GeneralSettings = () => {
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const {
    generalSettings
  } = useContext(EditEdgeDataContext)
  const [upadteEdge, { isLoading: isEdgeUpdating }] = useUpdateEdgeMutation()

  useEffect(() => {
    if(generalSettings) {
      form.setFieldsValue(generalSettings)
    }
  }, [generalSettings])

  const handleUpdateEdge = async (data: EdgeGeneralSetting) => {
    try {
      const params = {
        edgeClusterId: data.clusterId,
        venueId: data.venueId,
        serialNumber: data.serialNumber
      }

      // Following config cannot be sent in update API's payload
      delete data.venueId
      delete data.clusterId
      delete data.serialNumber
      await upadteEdge({ params, payload: data }).unwrap()
      navigate(linkToEdgeList)

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsForm
      editMode
      form={form}
      onFinish={handleUpdateEdge}
      onCancel={() => navigate(linkToEdgeList)}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <EdgeSettingForm isFetching={isEdgeUpdating} isEdit />
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

export default GeneralSettings
