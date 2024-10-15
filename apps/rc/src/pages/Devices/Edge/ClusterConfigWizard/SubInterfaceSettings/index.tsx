import { useContext } from 'react'

import { Col, Form, Space, Typography } from 'antd'
import { useIntl }                      from 'react-intl'
import { useParams, useNavigate }       from 'react-router-dom'

import { Loader, StepsForm }                               from '@acx-ui/components'
import { NodesTabs, TypeForm }                             from '@acx-ui/rc/components'
import { usePatchEdgeClusterSubInterfaceSettingsMutation } from '@acx-ui/rc/services'
import { useTenantLink }                                   from '@acx-ui/react-router-dom'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { EdgeSubInterfaceSettingForm }                                                          from './EdgeSubInterfaceSettingsForm'
import { SubInterfaceSettingsFormType, transformFromApiToFormData, transformFromFormDataToApi } from './types'

const renderHeader = (title: string, description: string) => {
  return <Space direction='vertical' size={5}>
    <Typography.Title level={2}>{title}</Typography.Title>
    <Typography.Text>{description}</Typography.Text>
  </Space>
}

export const SubInterfaceSettings = () => {
  const { clusterId } = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const selectTypePage = useTenantLink(`/devices/edge/cluster/${clusterId}/configure`)
  const [form] = Form.useForm()
  const [updateSubInterfaceSettings] = usePatchEdgeClusterSubInterfaceSettingsMutation()
  const {
    clusterInfo,
    clusterNetworkSettings,
    clusterSubInterfaceSettings,
    portsStatus,
    lagsStatus
  } = useContext(ClusterConfigWizardContext)

  const subInterfaceSettingsFormData = transformFromApiToFormData(clusterSubInterfaceSettings)

  const content = <NodesTabs
    nodeList={clusterInfo?.edgeList}
    content={(serialNumber) => (
      <Col>
        <EdgeSubInterfaceSettingForm
          serialNumber={serialNumber}
          ports={clusterNetworkSettings?.portSettings
            ?.find(settings => settings.serialNumber === serialNumber)
            ?.ports ?? []
          }
          portStatus={portsStatus?.[serialNumber] ?? []}
          lags={clusterNetworkSettings?.lagSettings
            ?.find(settings => settings.serialNumber === serialNumber)
            ?.lags ?? []
          }
          lagStatus={lagsStatus?.[serialNumber] ?? []}
        />
      </Col>
    )}
  />

  const invokeUpdateApi = async (
    value: SubInterfaceSettingsFormType,
    callback: () => void
  ) => {
    await updateSubInterfaceSettings({
      params: {
        venueId: clusterInfo?.venueId,
        clusterId
      },
      payload: transformFromFormDataToApi(value)
    }).unwrap()
    callback()
  }

  const applyAndFinish = async (value: SubInterfaceSettingsFormType) => {
    await invokeUpdateApi(
      value,
      () => navigate(clusterListPage)
    )
  }

  const applyAndContinue = async (value: SubInterfaceSettingsFormType) => {
    await invokeUpdateApi(
      value,
      () => navigate(selectTypePage)
    )
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  return (
    <Loader states={[{ isLoading: false }]}>
      <StepsForm<SubInterfaceSettingsFormType>
        form={form}
        onFinish={applyAndFinish}
        onCancel={handleCancel}
        initialValues={subInterfaceSettingsFormData}
        buttonLabel={{
          submit: $t({ defaultMessage: 'Apply & Finish' })
        }}
        customSubmit={{
          label: $t({ defaultMessage: 'Apply & Continue' }),
          onCustomFinish: applyAndContinue
        }}
      >
        <StepsForm.StepForm>
          <TypeForm
            header={renderHeader(
              $t({ defaultMessage: 'Sub-interface Settings' }),
              $t({ defaultMessage: `Create and configure the sub-interfaces
                for all Edges in this cluster:` }))
            }
            content={content}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}