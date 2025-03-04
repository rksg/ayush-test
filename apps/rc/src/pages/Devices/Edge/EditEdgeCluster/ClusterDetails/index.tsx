import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { StepsForm }                                          from '@acx-ui/components'
import { EdgeClusterSettingForm, EdgeClusterSettingFormType } from '@acx-ui/rc/components'
import { usePatchEdgeClusterMutation }                        from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeUrlsInfo }                    from '@acx-ui/rc/utils'
import { useTenantLink }                                      from '@acx-ui/react-router-dom'
import { EdgeScopes }                                         from '@acx-ui/types'
import { hasPermission }                                      from '@acx-ui/user'
import { getOpsApi }                                          from '@acx-ui/utils'

interface ClusterDetailsProps {
  currentClusterStatus?: EdgeClusterStatus
}

export const ClusterDetails = (props: ClusterDetailsProps) => {
  const { currentClusterStatus } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [patchEdgeCluster] = usePatchEdgeClusterMutation()

  const handleFinish = async (values: EdgeClusterSettingFormType) => {
    try {
      const params = {
        venueId: values.venueId,
        clusterId: currentClusterStatus?.clusterId
      }
      const payload = {
        name: values.name,
        description: values.description,
        smartEdges: values.smartEdges?.map(item => ({
          serialNumber: item.serialNumber,
          name: item.name
        }))
      }
      await patchEdgeCluster({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const hasUpdatePermission = hasPermission({
    scopes: [EdgeScopes.UPDATE],
    rbacOpsIds: [getOpsApi(EdgeUrlsInfo.patchEdgeCluster)]
  })

  return (
    <StepsForm
      onFinish={handleFinish}
      onCancel={handleCancel}
      buttonLabel={{ submit: hasUpdatePermission ? $t({ defaultMessage: 'Apply' }) : '' }}
    >
      <StepsForm.StepForm>
        <EdgeClusterSettingForm
          editData={currentClusterStatus}
        />
      </StepsForm.StepForm>
    </StepsForm>
  )
}