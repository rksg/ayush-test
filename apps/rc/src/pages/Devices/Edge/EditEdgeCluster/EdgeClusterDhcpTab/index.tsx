import { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { StepsForm }                                                                          from '@acx-ui/components'
import { EdgeDhcpSelectionForm }                                                              from '@acx-ui/rc/components'
import { useGetDhcpPoolStatsQuery, useGetEdgeDhcpListQuery, usePatchEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import { DhcpPoolStats, EdgeDhcpSetting, useTableQuery }                                      from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                              from '@acx-ui/react-router-dom'
import { RequestPayload }                                                                     from '@acx-ui/types'

const EdgeClusterDhcpTab = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { clusterId } = params
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const [isDhcpServiceActive, setIsDhcpServiceActive] = useState(false)
  const [patchEdgeDhcpService] = usePatchEdgeDhcpServiceMutation()
  const { $t } = useIntl()

  const {
    data: edgeDhcpData
  } = useGetEdgeDhcpListQuery(
    { params, payload: { page: 1, pageSize: 10000 } },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          data: data?.content.reduce((acc, item) => ({
            ...acc,
            [item.id]: item
          }), {}) as { [key: string]: EdgeDhcpSetting },
          edgeDhcpOptions: data?.content.map(item => ({ label: item.serviceName, value: item.id })),
          isLoading
        }
      }
    })

  const getDhcpPoolStatsPayload = {
    fields: [
      'id',
      'dhcpId',
      'poolId',
      'poolName',
      'subnetMask',
      'poolRange',
      'gateway',
      'edgeId',
      'utilization'
    ],
    filters: { edgeId: [clusterId] },
    sortField: 'name',
    sortOrder: 'ASC'
  }
  const poolTableQuery = useTableQuery<DhcpPoolStats, RequestPayload<unknown>, unknown>({
    useQuery: useGetDhcpPoolStatsQuery,
    defaultPayload: getDhcpPoolStatsPayload
  })

  useEffect(() => {
    setIsDhcpServiceActive((poolTableQuery.data?.totalCount || 0) > 0)
    form.setFieldValue('dhcpId', poolTableQuery.data?.data[0].dhcpId)
  }, [poolTableQuery.data?.totalCount])

  const handleApplyDhcp = async () => {
    const dhcpId = form.getFieldValue('dhcpId') || null
    const pathParams = { id: dhcpId }
    const payload = { edgeIds: [...edgeDhcpData[dhcpId].edgeIds, clusterId] }
    await patchEdgeDhcpService({ params: pathParams, payload }).unwrap()
  }

  const handleActiveSwitch = (checked: boolean) => {
    setIsDhcpServiceActive(checked)
  }

  return (
    <StepsForm
      editMode
      form={form}
      onFinish={handleApplyDhcp}
      onCancel={() => navigate(linkToEdgeList)}
    >
      <StepsForm.StepForm>
        <Form.Item
          label={$t({ defaultMessage: 'Enable DHCP Service' })}
          children={
            <Switch checked={isDhcpServiceActive} onChange={handleActiveSwitch} />
          }
        />
        <Form.Item hidden={!isDhcpServiceActive}>
          <EdgeDhcpSelectionForm hasNsg={false} />
        </Form.Item>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

export default EdgeClusterDhcpTab