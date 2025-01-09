
import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  PageHeader, showActionModal,
  StepsForm
} from '@acx-ui/components'
import {
  EdgeSettingForm
} from '@acx-ui/rc/components'
import { useAddEdgeClusterMutation, useAddEdgeMutation } from '@acx-ui/rc/services'
import { EdgeGeneralSetting }                            from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { CatchErrorResponse } from '@acx-ui/utils'

import { getErrorModalInfo } from './errorMessageMapping'

const AddEdge = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [addEdge] = useAddEdgeMutation()
  const [addEdgeCluster] = useAddEdgeClusterMutation()

  const handleAddEdge = async (data: EdgeGeneralSetting) => {
    const hasClusterId = !!data.clusterId

    const params = hasClusterId
      ? { venueId: data.venueId,
        edgeClusterId: data.clusterId }
      : { venueId: data.venueId }

    const clusterPayload = {
      name: data.name,
      description: '',
      highAvailabilityMode: data.highAvailabilityMode,
      smartEdges: [
        {
          name: data.name,
          description: data.description,
          serialNumber: data.serialNumber
        }
      ]
    }

    try {
      const request = hasClusterId
        ? addEdge({ params, payload: clusterPayload.smartEdges[0] })
        : addEdgeCluster({ params, payload: clusterPayload })
      await request.unwrap()

      navigate(clusterListPage)
    } catch (error) {
      if (hasClusterId) {
        showActionModal({
          type: 'error',
          ...getErrorModalInfo(error as CatchErrorResponse)
        })
        return
      }
      console.error(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add RUCKUS Edge' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'RUCKUS Edges' }), link: '/devices/edge' }
        ]}
      />
      <StepsForm
        onFinish={handleAddEdge}
        onCancel={() => navigate(clusterListPage)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <EdgeSettingForm />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default AddEdge