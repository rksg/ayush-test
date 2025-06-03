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

import { DHCPConsolidationTabKey } from '.'

export default function CreateDHCPService () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const fromPage = (useLocation() as LocationExtended)?.state?.from
  const selectServicePageLink = useTenantLink(getSelectServiceRoutePath(true))
  const createWifiDHCPPath = useTenantLink(
    getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE })
  )
  const createEdgeDHCPPath = useTenantLink(
    getServiceRoutePath({ type: ServiceType.EDGE_DHCP, oper: ServiceOperation.CREATE })
  )
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
  // eslint-disable-next-line max-len
  const [edgeCompatibilityFeature, setEdgeCompatibilityFeature] = useState<IncompatibilityFeatures | undefined>()


  const handleCreateDHCPService = async (
    values: { dhcpServiceType: DHCPConsolidationTabKey }
  ) => {
    const type = values.dhcpServiceType
    navigate(type === DHCPConsolidationTabKey.WIFI
      ? createWifiDHCPPath
      : createEdgeDHCPPath
    , { state: { from: fromPage } }
    )
  }

  const hasWifiDHCPPermission = hasServicePermission({
    type: ServiceType.DHCP,
    oper: ServiceOperation.CREATE
  })
  const hasEdgeDHCPPermission = hasServicePermission({
    type: ServiceType.EDGE_DHCP,
    oper: ServiceOperation.CREATE
  })

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add DHCP Service' })}
        breadcrumb={useServiceListBreadcrumb(ServiceType.DHCP_CONSOLIDATION)}
      />
      <StepsForm<{ dhcpServiceType: DHCPConsolidationTabKey }>
        form={form}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
        onFinish={handleCreateDHCPService}
        onCancel={() => redirectPreviousPage(navigate, fromPage?.pathname, selectServicePageLink)}>
        <StepsForm.StepForm>
          <Form.Item name='dhcpServiceType'
            label={$t({ defaultMessage: 'DHCP Service Type' })}
            initialValue={hasWifiDHCPPermission
              ? DHCPConsolidationTabKey.WIFI
              : DHCPConsolidationTabKey.EDGE}
          >
            <Radio.Group>
              <Space direction='vertical'>
                <Radio
                  value={DHCPConsolidationTabKey.WIFI}
                  disabled={!hasWifiDHCPPermission}
                >
                  {$t(categoryMapping[RadioCardCategory.WIFI].text)}
                </Radio>
                <Radio
                  value={DHCPConsolidationTabKey.EDGE}
                  disabled={!hasEdgeDHCPPermission}
                >
                  <Space>
                    <span>{$t(categoryMapping[RadioCardCategory.EDGE].text)}</span>
                    <ApCompatibilityToolTip
                      title=''
                      showDetailButton
                      // eslint-disable-next-line max-len
                      onClick={() => setEdgeCompatibilityFeature(IncompatibilityFeatures.DHCP)}
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
