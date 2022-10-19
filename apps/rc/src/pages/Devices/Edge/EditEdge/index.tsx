import { useEffect, useRef } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  PageHeader, showToast, StepsForm, StepsFormInstance
} from '@acx-ui/components'
import { useGetEdgeQuery, useUpdateEdgeMutation } from '@acx-ui/rc/services'
import { EdgeSaveData }                           from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

import EdgeSettingForm from '../../../../components/Edge/Form/EdgeSettingForm'


const EditEdge = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const linkToEdgeList = useTenantLink('/devices/edge/list')
  const formRef = useRef<StepsFormInstance<EdgeSaveData>>()
  const { data: edgeInfoData } = useGetEdgeQuery({ params: { serialNumber: params.serialNumber } })
  const [upadteEdge] = useUpdateEdgeMutation()

  useEffect(() => {
    formRef.current?.setFieldsValue({
      venueId: edgeInfoData?.venueId || '',
      edgeGroupId: edgeInfoData?.edgeGroupId || '',
      name: edgeInfoData?.name || '',
      serialNumber: edgeInfoData?.serialNumber || '',
      description: edgeInfoData?.description || ''
    })
  }, [edgeInfoData])

  const handleUpdateEdge = async (data: EdgeSaveData) => {
    try {
      const formData = { ...data }
      delete formData.serialNumber // serial number can not be sent in update API's payload
      await upadteEdge({ params: params, payload: formData }).unwrap()
      navigate(linkToEdgeList, { replace: true })
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
        title={$t({ defaultMessage: 'Edit SmartEdge' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'SmartEdge' }), link: '/devices' }
        ]}
      />
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
    </>
  )
}

export default EditEdge