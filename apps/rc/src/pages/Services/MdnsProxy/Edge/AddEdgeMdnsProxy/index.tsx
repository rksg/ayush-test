import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { PageHeader }                               from '@acx-ui/components'
import { AddEdgeMdnsProxyForm, useEdgeMdnsActions } from '@acx-ui/rc/components'
import {
  EdgeMdnsProxyViewData,
  ServiceOperation,
  ServiceType,
  getServiceRoutePath,
  useServiceListBreadcrumb
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

const AddEdgeMdnsProxy = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { createEdgeMdns } = useEdgeMdnsActions()

  const routeToList = getServiceRoutePath({
    type: ServiceType.EDGE_MDNS_PROXY,
    oper: ServiceOperation.LIST
  })

  const linkToServiceList = useTenantLink(routeToList)

  const handleFinish = async (formData: EdgeMdnsProxyViewData) => {
    try {
      await createEdgeMdns(formData)
      navigate(linkToServiceList, { replace: true })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
      navigate(linkToServiceList, { replace: true })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add mDNS Proxy for RUCKUS Edge Service' })}
        breadcrumb={useServiceListBreadcrumb(ServiceType.EDGE_MDNS_PROXY)}
      />
      <Row>
        <Col span={24}>
          <AddEdgeMdnsProxyForm
            onFinish={handleFinish}
            onCancel={() => navigate(linkToServiceList)}
          />
        </Col>
      </Row>
    </>
  )
}

export default AddEdgeMdnsProxy
