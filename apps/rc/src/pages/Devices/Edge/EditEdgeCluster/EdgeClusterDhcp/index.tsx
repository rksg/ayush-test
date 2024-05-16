import { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { StepsForm }                                 from '@acx-ui/components'
import { EdgeDhcpSelectionForm, useEdgeDhcpActions } from '@acx-ui/rc/components'
import { useGetDhcpStatsQuery }                      from '@acx-ui/rc/services'
import { EdgeClusterStatus }                         from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }     from '@acx-ui/react-router-dom'

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

  const { currentDhcp } = useGetDhcpStatsQuery({
    payload: {
      fields: [
        'id'
      ],
      filters: { edgeClusterIds: [clusterId] }
    }
  },
  {
    skip: !Boolean(clusterId),
    selectFromResult: ({ data }) => ({
      currentDhcp: data?.data[0]
    })
  })

  useEffect(() => {
    setIsDhcpServiceActive(Boolean(currentDhcp))

    if (currentDhcp) {
      setCurrentDhcpId(currentDhcp.id)
      form.setFieldValue('dhcpId', currentDhcp.id)
    }
  }, [currentDhcp])

  const handleApplyDhcp = async () => {
    const selectedDhcpId = form.getFieldValue('dhcpId') || null

    if (!isDhcpServiceActive) {
      await removeDhcpService()
    } else if (selectedDhcpId) {
      await applyDhcpService(selectedDhcpId)
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
