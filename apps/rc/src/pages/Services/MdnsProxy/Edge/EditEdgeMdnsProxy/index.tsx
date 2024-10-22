
import { useMemo } from 'react'

import { Form }    from 'antd'
import { omit }    from 'lodash'
import { useIntl } from 'react-intl'

import { Loader, PageHeader }                                             from '@acx-ui/components'
import { useEdgeMdnsActions }                                             from '@acx-ui/rc/components'
import { useGetEdgeMdnsProxyQuery, useGetEdgeMdnsProxyViewDataListQuery } from '@acx-ui/rc/services'
import {
  EdgeMdnsProxyViewData,
  ServiceOperation,
  ServiceType,
  getServiceListRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'

import { EdgeMdnsProxyForm } from '../EdgeMdnsProxyForm'
import { ScopeForm }         from '../EdgeMdnsProxyForm/ScopeForm'
import { SettingsForm }      from '../EdgeMdnsProxyForm/SettingsForm'

const EditEdgeMdnsProxy = () => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const routeToList = getServiceRoutePath({
    type: ServiceType.EDGE_MDNS_PROXY,
    oper: ServiceOperation.LIST
  })

  const linkToServiceList = useTenantLink(routeToList)
  const { editEdgeMdns } = useEdgeMdnsActions()
  const { data, isLoading, isFetching } = useGetEdgeMdnsProxyQuery(
    { params },
    { skip: !params.serviceId }
  )
  const {
    data: viewData,
    isLoading: isViewDataLoading,
    isFetching: isViewFetching
  } = useGetEdgeMdnsProxyViewDataListQuery({
    payload: {
      fields: ['id', 'name', 'forwardingRules', 'activations'],
      filters: { id: [params.serviceId] }
    }
  }, { skip: !params.serviceId })

  const editData = useMemo(() => {
    if (!data) return

    return {
      id: params.serviceId,
      ...data,
      forwardingRules: data.forwardingRules.map((r, idx) =>
        ({
          ...omit(r, 'serviceType'),
          service: r.serviceType,
          ruleIndex: idx
        })),
      activations: viewData?.data[0].activations
    } as EdgeMdnsProxyViewData
  }, [data, viewData])

  const steps = [{
    title: $t({ defaultMessage: 'Settings' }),
    content: SettingsForm
  }, {
    title: $t({ defaultMessage: 'Scope' }),
    content: ScopeForm
  }]

  const handleFinish = async (formData: EdgeMdnsProxyViewData) => {
    try {
      await editEdgeMdns(formData, editData! as EdgeMdnsProxyViewData)
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
        title={$t({ defaultMessage: 'Edit mDNS Proxy for RUCKUS Edge Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Edge mDNS Proxy' }), link: routeToList }
        ]}
      />
      <Loader states={[{
        isLoading: isLoading || isViewDataLoading,
        isFetching: isFetching || isViewFetching
      }]}>
        <EdgeMdnsProxyForm
          form={form}
          editData={editData}
          steps={steps}
          onFinish={handleFinish}
        />
      </Loader>
    </>
  )
}

export default EditEdgeMdnsProxy