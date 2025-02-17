import { useEffect } from 'react'

import { Form }        from 'antd'
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader, StepsForm }          from '@acx-ui/components'
import {
  EdgeHaSettingsForm,
  EdgeHaSettingsFormType,
  transformEdgeHaSettingsFormToApiPayload,
  transformEdgeHaSettingsToFormType
} from '@acx-ui/rc/components'
import {
  useGetEdgeClusterNetworkSettingsQuery,
  usePatchEdgeClusterNetworkSettingsMutation
} from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { useTenantLink }                   from '@acx-ui/react-router-dom'
import { EdgeScopes }                      from '@acx-ui/types'
import { hasPermission }                   from '@acx-ui/user'
import { getOpsApi }                       from '@acx-ui/utils'

interface HaSettingsProps {
  currentClusterStatus?: EdgeClusterStatus
}

export const HaSettings = (props: HaSettingsProps) => {
  const { currentClusterStatus } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const [patchNetworkConfig] = usePatchEdgeClusterNetworkSettingsMutation()

  const {
    data: networkSettings,
    isLoading: isClusterNetworkSettingsLoading,
    isFetching: isClusterNetworkSettingsFetching
  } = useGetEdgeClusterNetworkSettingsQuery({
    params: {
      venueId: currentClusterStatus?.venueId,
      clusterId: currentClusterStatus?.clusterId
    }
  },{
    skip: !Boolean(currentClusterStatus)
  })

  useEffect(() => {
    if(networkSettings?.highAvailabilitySettings) {
      const formData = transformEdgeHaSettingsToFormType(networkSettings.highAvailabilitySettings)
      form.setFieldsValue(formData)
    }
  }, [networkSettings?.highAvailabilitySettings])

  const handleFinish = async (values: EdgeHaSettingsFormType) => {
    try {
      const params = {
        venueId: currentClusterStatus?.venueId,
        clusterId: currentClusterStatus?.clusterId
      }
      const payload = transformEdgeHaSettingsFormToApiPayload(values)

      await patchNetworkConfig({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const hasUpdatePermission = hasPermission({
    scopes: [EdgeScopes.UPDATE],
    rbacOpsIds: [getOpsApi(EdgeUrlsInfo.patchEdgeClusterNetworkSettings)]
  })

  return (
    <Loader states={[{
      isLoading: isClusterNetworkSettingsLoading,
      isFetching: isClusterNetworkSettingsFetching
    }]}>
      <StepsForm
        onFinish={handleFinish}
        onCancel={handleCancel}
        form={form}
        buttonLabel={{ submit: hasUpdatePermission ? $t({ defaultMessage: 'Apply' }) : '' }}
      >
        <StepsForm.StepForm>
          <EdgeHaSettingsForm />
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}