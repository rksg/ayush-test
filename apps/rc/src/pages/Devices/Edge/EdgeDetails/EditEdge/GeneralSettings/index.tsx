import { useContext, useEffect } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { StepsForm }                                                         from '@acx-ui/components'
import { EdgeSettingForm }                                                   from '@acx-ui/rc/components'
import { useUpdateEdgeMutation }                                             from '@acx-ui/rc/services'
import { EdgeGeneralSetting, EdgeUrlsInfo, ClusterHighAvailabilityModeEnum } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { hasPermission } from '@acx-ui/user'
import { getOpsApi }     from '@acx-ui/utils'

import { EditEdgeDataContext } from '../EditEdgeDataProvider'

const GeneralSettings = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [form] = Form.useForm()
  const {
    generalSettings,
    clusterInfo
  } = useContext(EditEdgeDataContext)
  const [upadteEdge, { isLoading: isEdgeUpdating }] = useUpdateEdgeMutation()

  useEffect(() => {
    if(generalSettings) {
      form.setFieldsValue(generalSettings)
    }
  }, [generalSettings])

  // display HA mode data on SettingForm
  useEffect(() => {
    if(clusterInfo) {
      // eslint-disable-next-line max-len
      form.setFieldValue('highAvailabilityMode', clusterInfo?.highAvailabilityMode ?? ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY)
    }
  }, [clusterInfo])

  const handleUpdateEdge = async (data: EdgeGeneralSetting) => {
    try {
      const params = {
        edgeClusterId: data.clusterId,
        venueId: data.venueId,
        serialNumber: data.serialNumber
      }

      // Following config cannot be sent in update API's payload
      delete data.venueId
      delete data.clusterId
      delete data.serialNumber
      await upadteEdge({ params, payload: data }).unwrap()
      navigate(linkToEdgeList)

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const hasUpdatePermission = hasPermission({ rbacOpsIds: [getOpsApi(EdgeUrlsInfo.updateEdge)] })

  return (
    <StepsForm
      editMode
      form={form}
      onFinish={handleUpdateEdge}
      onCancel={() => navigate(linkToEdgeList)}
      buttonLabel={{ apply: hasUpdatePermission ? $t({ defaultMessage: 'Apply' }) : '' }}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <EdgeSettingForm isFetching={isEdgeUpdating} isEdit />
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

export default GeneralSettings
