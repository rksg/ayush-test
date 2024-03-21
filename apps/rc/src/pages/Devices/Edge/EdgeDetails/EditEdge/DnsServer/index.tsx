import { useContext, useEffect } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import {
  Loader,
  StepsForm
} from '@acx-ui/components'
import { useUpdateDnsServersMutation }           from '@acx-ui/rc/services'
import { EdgeDnsServers, serverIpAddressRegExp } from '@acx-ui/rc/utils'
import {
  useNavigate, useParams, useTenantLink
} from '@acx-ui/react-router-dom'

import { EditEdgeDataContext } from '../EditEdgeDataProvider'

const DnsServer = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const params = useParams()
  const {
    dnsServersData,
    isDnsServersDataFetching
  } = useContext(EditEdgeDataContext)
  const [updateDnsServers, { isLoading: isDnsServersUpdating }] = useUpdateDnsServersMutation()

  useEffect(() => {
    if(dnsServersData) {
      form.setFieldsValue({ ...dnsServersData })
    }
  }, [dnsServersData])

  const havePrimary = (value: string) => {
    if(value && !form.getFieldValue('primary')) {
      return Promise.reject($t({ defaultMessage: 'Must have primary DNS' }))
    }
    return Promise.resolve()
  }

  const handleApplyDns = async (data: EdgeDnsServers) => {
    try {
      await updateDnsServers({ params: params, payload: data }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsForm
      form={form}
      onFinish={handleApplyDns}
      onCancel={() => navigate(linkToEdgeList)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply DNS Server' }) }}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={5}>
            <Loader states={[{
              isLoading: false,
              isFetching: isDnsServersUpdating || isDnsServersDataFetching
            }]}>
              <Form.Item
                name='primary'
                label={$t({ defaultMessage: 'Primary DNS Server' })}
                rules={[
                  { validator: (_, value) => serverIpAddressRegExp(value) }
                ]}
                children={<Input />}
              />
              <Form.Item
                name='secondary'
                label={$t({ defaultMessage: 'Secondary DNS Server' })}
                rules={[
                  { validator: (_, value) => serverIpAddressRegExp(value) },
                  { validator: (_, value) => havePrimary(value) }
                ]}
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
