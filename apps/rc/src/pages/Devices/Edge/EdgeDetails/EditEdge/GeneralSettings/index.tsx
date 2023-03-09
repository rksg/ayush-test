import { useEffect, useRef } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { StepsForm, StepsFormInstance }           from '@acx-ui/components'
import { EdgeSettingForm }                        from '@acx-ui/rc/components'
import { useGetEdgeQuery, useUpdateEdgeMutation } from '@acx-ui/rc/services'
import { EdgeGeneralSetting }                     from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

const GeneralSettings = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const linkToEdgeList = useTenantLink('/devices/edge/list')
  const formRef = useRef<StepsFormInstance<EdgeGeneralSetting>>()
  const { data: edgeGeneralSettings } = useGetEdgeQuery({
    params: { serialNumber: params.serialNumber }
  })
  const [upadteEdge, { isLoading: isEdgeUpdating }] = useUpdateEdgeMutation()

  useEffect(() => {
    if(edgeGeneralSettings) {
      formRef.current?.setFieldsValue(edgeGeneralSettings)
    }
  }, [edgeGeneralSettings])

  const handleUpdateEdge = async (data: EdgeGeneralSetting) => {
    try {
      // Following config cannot be sent in update API's payload
      delete data.venueId
      delete data.serialNumber
      await upadteEdge({ params, payload: data }).unwrap()
      navigate(linkToEdgeList)

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsForm
      formRef={formRef}
      onFinish={handleUpdateEdge}
      onCancel={() => navigate(linkToEdgeList)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
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