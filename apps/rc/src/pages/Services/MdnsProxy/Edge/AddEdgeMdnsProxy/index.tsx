
import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PageHeader }         from '@acx-ui/components'
import { useEdgeMdnsActions } from '@acx-ui/rc/components'
import {
  EdgeMdnsProxyViewData,
  ServiceOperation,
  ServiceType,
  getServiceListRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeMdnsProxyForm } from '../EdgeMdnsProxyForm'
import { ScopeForm }         from '../EdgeMdnsProxyForm/ScopeForm'
import { SettingsForm }      from '../EdgeMdnsProxyForm/SettingsForm'
import { SummaryForm }       from '../EdgeMdnsProxyForm/SummaryForm'

const AddEdgeMdnsProxy = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { createEdgeMdns } = useEdgeMdnsActions()

  const routeToList = getServiceRoutePath({
    type: ServiceType.EDGE_MDNS_PROXY,
    oper: ServiceOperation.LIST
  })

  const linkToServiceList = useTenantLink(routeToList)

  const steps = [ {
    title: $t({ defaultMessage: 'Settings' }),
    content: SettingsForm
  }, {
    title: $t({ defaultMessage: 'Scope' }),
    content: ScopeForm
  }, {
    title: $t({ defaultMessage: 'Summary' }),
    content: SummaryForm
  }]

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
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Edge mDNS Proxy' }), link: routeToList }
        ]}
      />
      <EdgeMdnsProxyForm
        form={form}
        steps={steps}
        onFinish={handleFinish}
      />
    </>
  )
}

export default AddEdgeMdnsProxy