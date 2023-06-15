import { useEffect, useRef } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import {
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Loader
} from '@acx-ui/components'
import { useGetDnsServersQuery, useUpdateDnsServersMutation } from '@acx-ui/rc/services'
import { EdgeDnsServers, serverIpAddressRegExp }              from '@acx-ui/rc/utils'
import {
  useNavigate, useParams, useTenantLink
} from '@acx-ui/react-router-dom'




const DnsServer = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const formRef = useRef<StepsFormLegacyInstance<EdgeDnsServers>>()
  const params = useParams()
  const { data: dnsServersData, isLoading: isLoadingDnsServersData } = useGetDnsServersQuery({
    params: {
      serialNumber: params.serialNumber
    }
  })
  const [updateDnsServers, { isLoading: isDnsServersUpdating }] = useUpdateDnsServersMutation()

  useEffect(() => {
    if(dnsServersData) {
      formRef.current?.setFieldsValue({ ...dnsServersData })
    }
  }, [dnsServersData])

  const havePrimary = (value: string) => {
    if(value && !!!formRef.current?.getFieldValue('primary')) {
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
    <StepsFormLegacy
      formRef={formRef}
      onFinish={handleApplyDns}
      onCancel={() => navigate(linkToEdgeList)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply DNS Server' }) }}
    >
      <StepsFormLegacy.StepForm>
        <Row gutter={20}>
          <Col span={5}>
            <Loader states={[{
              isLoading: isLoadingDnsServersData,
              isFetching: isDnsServersUpdating
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
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>

  )
}

export default DnsServer
