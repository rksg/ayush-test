import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import {
  categoryMapping,
  PageHeader,
  RadioCardCategory,
  StepsForm
}  from '@acx-ui/components'
import {
  getSelectServiceRoutePath,
  ServiceOperation,
  ServiceType,
  getServiceRoutePath,
  LocationExtended,
  useServiceListBreadcrumb,
  redirectPreviousPage,
  hasServicePermission
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { MdnsProxyConsolidationTabKey } from '.'

export default function CreateMdnsProxyService () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const fromPage = (useLocation() as LocationExtended)?.state?.from
  const selectServicePageLink = useTenantLink(getSelectServiceRoutePath(true))
  const createWifiMdnsProxyPath = useTenantLink(
    getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })
  )
  const createEdgeMdnsProxyPath = useTenantLink(
    getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY, oper: ServiceOperation.CREATE })
  )


  const handleCreateMdnsProxyService = async (
    values: { mdnsProxyServiceType: MdnsProxyConsolidationTabKey }
  ) => {
    const type = values.mdnsProxyServiceType
    navigate(type === MdnsProxyConsolidationTabKey.WIFI
      ? createWifiMdnsProxyPath
      : createEdgeMdnsProxyPath
    , { state: { from: fromPage } }
    )
  }

  const hasWifiMdnsProxyPermission = hasServicePermission({
    type: ServiceType.MDNS_PROXY,
    oper: ServiceOperation.CREATE
  })
  const hasEdgeMdnsProxyPermission = hasServicePermission({
    type: ServiceType.EDGE_MDNS_PROXY,
    oper: ServiceOperation.CREATE
  })

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add mDNS Proxy Service' })}
        breadcrumb={useServiceListBreadcrumb(ServiceType.MDNS_PROXY_CONSOLIDATION)}
      />
      <StepsForm<{ mdnsProxyServiceType: MdnsProxyConsolidationTabKey }>
        form={form}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
        onFinish={handleCreateMdnsProxyService}
        onCancel={() => redirectPreviousPage(navigate, fromPage?.pathname, selectServicePageLink)}>
        <StepsForm.StepForm>
          <Form.Item name='mdnsProxyServiceType'
            label={$t({ defaultMessage: 'mDNS Proxy Service Type' })}
            initialValue={hasWifiMdnsProxyPermission
              ? MdnsProxyConsolidationTabKey.WIFI
              : MdnsProxyConsolidationTabKey.EDGE}
          >
            <Radio.Group>
              <Space direction='vertical'>
                <Radio
                  value={MdnsProxyConsolidationTabKey.WIFI}
                  disabled={!hasWifiMdnsProxyPermission}
                >
                  {$t(categoryMapping[RadioCardCategory.WIFI].text)}
                </Radio>
                <Radio
                  value={MdnsProxyConsolidationTabKey.EDGE}
                  disabled={!hasEdgeMdnsProxyPermission}
                >
                  {$t(categoryMapping[RadioCardCategory.EDGE].text)}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
