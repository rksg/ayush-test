import { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { StepsForm }                                       from '@acx-ui/components'
import { EdgeDhcpSelectionForm, useEdgeDhcpActions }       from '@acx-ui/rc/components'
import { useGetDhcpPoolStatsQuery }                        from '@acx-ui/rc/services'
import { DhcpPoolStats, EdgeClusterStatus, useTableQuery } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }           from '@acx-ui/react-router-dom'
import { RequestPayload }                                  from '@acx-ui/types'

interface EdgeClusterDhcpProps {
  currentClusterStatus?: EdgeClusterStatus
}

export const EdgeClusterDhcp = (props: EdgeClusterDhcpProps) => {
  const { currentClusterStatus } = props
  const navigate = useNavigate()
  const params = useParams()
  const { clusterId } = params
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const [isDhcpServiceActive, setIsDhcpServiceActive] = useState(false)
  const [currentDhcpId, setCurrentDhcpId] = useState('')
  const { activateEdgeDhcp, deactivateEdgeDhcp } = useEdgeDhcpActions()
  const { $t } = useIntl()

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
    const isActive = (poolTableQuery.data?.totalCount || 0) > 0
    setIsDhcpServiceActive(isActive)

    const dhcpId = poolTableQuery.data?.data[0]?.dhcpId
    if (dhcpId) {
      setCurrentDhcpId(dhcpId)
      form.setFieldValue('dhcpId', dhcpId)
    }
  }, [poolTableQuery.data?.totalCount])

  const handleApplyDhcp = async () => {
    const selectedDhcpId = form.getFieldValue('dhcpId') || null

    if (!isDhcpServiceActive) {
      removeDhcpService()
    } else if (selectedDhcpId) {
      applyDhcpService(selectedDhcpId)
    }
  }

  const applyDhcpService = async (dhcpId: string) => {
    try {
      await activateEdgeDhcp(
        dhcpId,
        currentClusterStatus?.venueId ?? '',
        clusterId ?? ''
      )
      setCurrentDhcpId(dhcpId)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const removeDhcpService = async () => {
    try {
      await deactivateEdgeDhcp(
        currentDhcpId,
        currentClusterStatus?.venueId ?? '',
        clusterId ?? ''
      )
      setCurrentDhcpId('')
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
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
            <Switch checked={isDhcpServiceActive} onChange={setIsDhcpServiceActive} />
          }
        />
        {isDhcpServiceActive &&
        <Form.Item>
          <EdgeDhcpSelectionForm hasNsg={false} />
        </Form.Item>}
      </StepsForm.StepForm>
    </StepsForm>
  )
}
