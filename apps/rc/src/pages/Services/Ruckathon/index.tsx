import { useRef } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { CommonResult } from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'
import { baseEdgeApi }                                  from '@acx-ui/store'
import { RequestPayload }                               from '@acx-ui/types'
import { ApiInfo, createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

export interface UploadExtended {
  serialNumber: string
  imageProtocol?: string
  httpUrl?: string
  imageServer?: string
  userName?: string
  password?: string
  imagePath?: string
}

export const RuckathonEdgeUrlsInfo: { [key: string]: ApiInfo } = {
  addEdge: {
    method: 'post',
    url: '/edges',
    newApi: true
  }
}

export const ruckathonEdgeApi = baseEdgeApi.injectEndpoints({
  endpoints: (build) => ({
    uploadRuckathonImage: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RuckathonEdgeUrlsInfo.addEdge, params, {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: payload
        }
      }
    })
  })
})

export const {
  useUploadRuckathonImageMutation
} = ruckathonEdgeApi

function RuckathonEdgeTestForm () {
  // const isEdgeHaReady = useIsSplitOn(Features.EDGE_HA_TOGGLE)
  // const isEdgeFirewallHaReady = useIsSplitOn(Features.EDGE_FIREWALL_HA_TOGGLE)
  const intl = useIntl()
  const formRef = useRef<StepsFormLegacyInstance>()
  const params = useParams()
  const [uploadImage] = useUploadRuckathonImageMutation()
  const handleAdd = async (values: UploadExtended) => {
    const request = uploadImage({ params, payload: values })
    await request.unwrap()
    sendDone()
  }

  const sendDone = () => {
    alert('Send to edge successful.')
    formRef.current?.resetFields()
  }

  return (
    <>
      <PageHeader
        title={'Upload Image to Edge'}
      />
      <Loader states={[{
        isLoading: false
      }]}>
        <StepsFormLegacy
          formRef={formRef}
          onFinish={handleAdd}
          buttonLabel={{ submit: intl.$t({ defaultMessage: 'Add' }) }}
        >
          <StepsFormLegacy.StepForm>
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item
                  name='serialNumber'
                  label={intl.$t({ defaultMessage: 'Edge Serial Number' })}
                  rules={[
                    { type: 'string', required: true }
                  ]}
                  validateFirst
                  hasFeedback
                  children={<Input />}
                  validateTrigger={'onBlur'}
                />
                <Form.Item
                  name='imageProtocol'
                  label={intl.$t({ defaultMessage: 'Image Protocol' })}
                  children={<Input.TextArea rows={2} maxLength={180} />}
                />
                <Form.Item
                  name='httpUrl'
                  label={intl.$t({ defaultMessage: 'HTTP URL' })}
                  children={<Input.TextArea rows={2} maxLength={256} />}
                />
                <Form.Item
                  name='imageServer'
                  label={intl.$t({ defaultMessage: 'Image Server' })}
                  children={<Input.TextArea rows={2} maxLength={256} />}
                />
                <Form.Item
                  name='userName'
                  label={intl.$t({ defaultMessage: 'Username' })}
                  children={<Input.TextArea rows={2} maxLength={256} />}
                />
                <Form.Item
                  name='password'
                  label={intl.$t({ defaultMessage: 'Password' })}
                  children={<Input.TextArea rows={2} maxLength={256} />}
                />
                <Form.Item
                  name='imagePath'
                  label={intl.$t({ defaultMessage: 'Image Path' })}
                  children={<Input.TextArea rows={2} maxLength={256} />}
                />
              </Col>
            </Row>
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
    </>
  )
}

export default RuckathonEdgeTestForm