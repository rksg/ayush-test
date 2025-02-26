import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { PageHeader, StepsForm }                              from '@acx-ui/components'
import { EdgeClusterSettingForm, EdgeClusterSettingFormType } from '@acx-ui/rc/components'
import { useAddEdgeClusterMutation }                          from '@acx-ui/rc/services'
import { EdgeUrlsInfo }                                       from '@acx-ui/rc/utils'
import { useTenantLink }                                      from '@acx-ui/react-router-dom'
import { hasPermission }                                      from '@acx-ui/user'
import { getOpsApi }                                          from '@acx-ui/utils'

const AddEdgeCluster = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [addEdgeCluster] = useAddEdgeClusterMutation()

  const handleFinish = async (values: EdgeClusterSettingFormType) => {
    try {
      const params = {
        venueId: values.venueId
      }
      const payload = {
        name: values.name,
        description: values.description,
        highAvailabilityMode: values.highAvailabilityMode,
        smartEdges: values.smartEdges?.map(item => ({
          serialNumber: item.serialNumber,
          name: item.name
        }))
      }
      await addEdgeCluster({ params, payload }).unwrap()
      navigate(clusterListPage)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const hasAddPermission = hasPermission({ rbacOpsIds: [getOpsApi(EdgeUrlsInfo.addEdgeCluster)] })

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Cluster' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'RUCKUS Edges' }), link: '/devices/edge' }
        ]}
      />
      <StepsForm
        onFinish={handleFinish}
        onCancel={handleCancel}
        buttonLabel={{ submit: hasAddPermission ? $t({ defaultMessage: 'Add' }) : '' }}
      >
        <StepsForm.StepForm>
          <EdgeClusterSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default AddEdgeCluster