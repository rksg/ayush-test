import { useState } from 'react'

import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import {
  categoryMapping,
  PageHeader,
  RadioCardCategory,
  StepsForm
}  from '@acx-ui/components'
import { Features }                                                               from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip, EdgeCompatibilityDrawer, EdgeCompatibilityType } from '@acx-ui/rc/components'
import {
  getSelectServiceRoutePath,
  ServiceOperation,
  ServiceType,
  getServiceRoutePath,
  LocationExtended,
  useServiceListBreadcrumb,
  redirectPreviousPage,
  hasServicePermission,
  useIsEdgeFeatureReady,
  IncompatibilityFeatures
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
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
  // eslint-disable-next-line max-len
  const [edgeCompatibilityFeature, setEdgeCompatibilityFeature] = useState<IncompatibilityFeatures | undefined>()


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
                  <Space>
                    <span>{$t(categoryMapping[RadioCardCategory.EDGE].text)}</span>
                    <ApCompatibilityToolTip
                      title=''
                      showDetailButton
                      // eslint-disable-next-line max-len
                      onClick={() => setEdgeCompatibilityFeature(IncompatibilityFeatures.EDGE_MDNS_PROXY)}
                    />
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
      {isEdgeCompatibilityEnabled && <EdgeCompatibilityDrawer
        visible={!!edgeCompatibilityFeature}
        type={EdgeCompatibilityType.ALONE}
        title={$t({ defaultMessage: 'Compatibility Requirement' })}
        featureName={edgeCompatibilityFeature}
        onClose={() => setEdgeCompatibilityFeature(undefined)}
      />}
    </>
  )
}
