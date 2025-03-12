import { useMemo } from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { Loader, PageHeader }                                             from '@acx-ui/components'
import { EditEdgeMdnsProxyForm, useEdgeMdnsActions }                      from '@acx-ui/rc/components'
import { useGetEdgeMdnsProxyQuery, useGetEdgeMdnsProxyViewDataListQuery } from '@acx-ui/rc/services'
import {
  EdgeMdnsProxyViewData,
  ServiceOperation,
  ServiceType,
  getServiceListRoutePath,
  getServiceRoutePath,
  transformEdgeMdnsRulesToViewModelType
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'

const EditEdgeMdnsProxy = () => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()

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
      forwardingRules: transformEdgeMdnsRulesToViewModelType(data.forwardingRules),
      activations: viewData?.data[0].activations
    } as EdgeMdnsProxyViewData
  }, [data, viewData])


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
      <Row>
        <Col span={24}>
          <Loader states={[{
            isLoading: isLoading || isViewDataLoading,
            isFetching: isFetching || isViewFetching
          }]}>
            <EditEdgeMdnsProxyForm
              editData={editData}
              onFinish={handleFinish}
              onCancel={() => navigate(linkToServiceList)}
            />
          </Loader>
        </Col>
      </Row>
    </>
  )
}

export default EditEdgeMdnsProxy