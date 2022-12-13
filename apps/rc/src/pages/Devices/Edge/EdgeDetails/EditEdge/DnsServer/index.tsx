import { useEffect, useRef } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import {
  StepsForm,
  StepsFormInstance,
  Loader,
  showToast
} from '@acx-ui/components'
import { useGetDnsServersQuery, useUpdateDnsServersMutation } from '@acx-ui/rc/services'
import { EdgeDnsServers }                                     from '@acx-ui/rc/utils'
import {
  useNavigate, useParams, useTenantLink
} from '@acx-ui/react-router-dom'




const DnsServer = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge/list')
  const formRef = useRef<StepsFormInstance<EdgeDnsServers>>()
  const params = useParams()
  const { data: dnsServersData, isLoading: isLoadingDnsServersData } = useGetDnsServersQuery({
    params: {
      serialNumber: params.serialNumber
    }
  })
  const [updateDnsServers, { isLoading: isDnsServersUpdating }] = useUpdateDnsServersMutation()

  const handleApplyDns = async (data: EdgeDnsServers) => {
    try {
      await updateDnsServers({ params: params, payload: data }).unwrap()
    } catch {
      // TODO error message not be defined
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  useEffect(() => {
    if(dnsServersData) {
      formRef.current?.setFieldsValue({ ...dnsServersData })
    }
  }, [dnsServersData])

  return (
    <StepsForm
      formRef={formRef}
      onFinish={handleApplyDns}
      onCancel={() => navigate(linkToEdgeList)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply DNS Server' }) }}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={5}>
            <Loader states={[{
              isLoading: isLoadingDnsServersData,
              isFetching: isDnsServersUpdating
            }]}>
              <Form.Item
                name='primary'
                label={$t({ defaultMessage: 'Primary DNS Server' })}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name='secondary'
                label={$t({ defaultMessage: 'Secondary DNS Server' })}
                children={<Input />}
              />
            </Loader>
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>

  )
}

export default DnsServer