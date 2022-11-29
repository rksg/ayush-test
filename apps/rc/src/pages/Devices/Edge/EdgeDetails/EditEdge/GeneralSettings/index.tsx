import { useEffect, useRef } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { EdgeSettingForm }                         from '@acx-ui/rc/components'
import { useGetEdgeQuery, useUpdateEdgeMutation }  from '@acx-ui/rc/services'
import { EdgeSaveData }                            from '@acx-ui/rc/utils'
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
  const formRef = useRef<StepsFormInstance<EdgeSaveData>>()
  const { data: edgeInfoData } = useGetEdgeQuery({ params: { serialNumber: params.serialNumber } })
  const [upadteEdge] = useUpdateEdgeMutation()

  useEffect(() => {
    if(edgeInfoData) {
      formRef.current?.setFieldsValue({
        venueId: edgeInfoData?.venueId || '',
        edgeGroupId: edgeInfoData?.edgeGroupId || '',
        name: edgeInfoData?.name || '',
        serialNumber: edgeInfoData?.serialNumber || '',
        description: edgeInfoData?.description || '',
        tags: edgeInfoData?.tags || ''
      })
    }
  }, [edgeInfoData])

  const handleUpdateEdge = async (data: EdgeSaveData) => {
    try {
      // TODO when Tags component ready remove this
      const payload = { ...data, tags: [] as string[] }
      if(data.tags) {
        if(typeof data.tags === 'string') {
          payload.tags = data.tags.split(',').map(item => item.trim())
        } else {
          payload.tags = data.tags
        }
      }
      delete payload.serialNumber // serial number can not be sent in update API's payload
      await upadteEdge({ params: params, payload: payload }).unwrap()
      navigate(linkToEdgeList, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
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
            <EdgeSettingForm isEdit />
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

export default GeneralSettings