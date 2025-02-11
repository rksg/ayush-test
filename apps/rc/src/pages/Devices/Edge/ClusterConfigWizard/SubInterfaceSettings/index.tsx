import { useCallback, useContext, useEffect, useState } from 'react'

import { Col, Form, Space, Typography } from 'antd'
import { useIntl }                      from 'react-intl'
import { useParams, useNavigate }       from 'react-router-dom'

import { Loader, StepsForm, StepsFormProps } from '@acx-ui/components'
import {
  CompatibilityStatusBar,
  CompatibilityStatusEnum,
  NodesTabs, TypeForm
} from '@acx-ui/rc/components'
import { usePatchEdgeClusterSubInterfaceSettingsMutation } from '@acx-ui/rc/services'
import { EdgeUrlsInfo }                                    from '@acx-ui/rc/utils'
import { useTenantLink }                                   from '@acx-ui/react-router-dom'
import { hasPermission }                                   from '@acx-ui/user'
import { getOpsApi }                                       from '@acx-ui/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import {
  SubInterfaceSettingsForm
} from './SubInterfaceSettingsForm'
import {
  CompatibilityCheckResult,
  SubInterfaceCompatibility,
  SubInterfaceSettingsFormType
} from './types'
import {
  getSubInterfaceCompatibilityFields,
  subInterfaceCompatibleCheck,
  transformFromApiToFormData,
  transformFromFormDataToApi
} from './utils'

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
  const [form] = Form.useForm<SubInterfaceSettingsFormType>()
  const [updateSubInterfaceSettings] = usePatchEdgeClusterSubInterfaceSettingsMutation()
  const {
    clusterInfo,
    clusterNetworkSettings,
    clusterSubInterfaceSettings,
    portsStatus,
    lagsStatus,
    isLoading,
    isFetching
  } = useContext(ClusterConfigWizardContext)
  const isSingleNode = (clusterInfo?.edgeList?.length ?? 0) < 2
  const [alertData, setAlertData] =
    useState<StepsFormProps<Record<string, unknown>>['alert']>({
      type: 'success',
      message: <CompatibilityStatusBar
        key='step1'
        type={CompatibilityStatusEnum.PASS}
      />
    })

  const subInterfaceSettingsFormData = transformFromApiToFormData(clusterSubInterfaceSettings)

  useEffect(() => {
    doCompatibleCheck()
  }, [form, clusterInfo])

  const content = <NodesTabs
    nodeList={clusterInfo?.edgeList}
    content={(serialNumber) => (
      <Col>
        <SubInterfaceSettingsForm
          serialNumber={serialNumber}
          ports={clusterNetworkSettings?.portSettings
            ?.find(settings => settings.serialNumber === serialNumber)
            ?.ports ?? []
          }
          portStatus={portsStatus?.[serialNumber] ?? []}
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
    const checkResult = getCompatibleCheckResult()
    if (checkResult.isError) {
      return false
    }

    await invokeUpdateApi(
      value,
      () => navigate(clusterListPage)
    )
    return true
  }

  const applyAndContinue = async (value: SubInterfaceSettingsFormType) => {
    const checkResult = getCompatibleCheckResult()
    if (checkResult.isError) {
      return false
    }

    await invokeUpdateApi(
      value,
      () => navigate(selectTypePage)
    )
    return true
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const doCompatibleCheck = (): void => {
    const checkResult = getCompatibleCheckResult()
    updateAlertMessage(checkResult)
  }

  const getCompatibleCheckResult = useCallback((): CompatibilityCheckResult => {
    const formData = form.getFieldsValue(true) as SubInterfaceSettingsFormType
    return subInterfaceCompatibleCheck(
      formData.portSubInterfaces,
      formData.lagSubInterfaces,
      clusterInfo?.edgeList,
      portsStatus,
      lagsStatus)
  }, [form, clusterInfo])

  const updateAlertMessage = (checkResult: CompatibilityCheckResult) => {
    let errorFieldsConfig = getSubInterfaceCompatibilityFields()

    setAlertData({
      type: checkResult.isError ? 'error' : 'success',
      message: <CompatibilityStatusBar<SubInterfaceCompatibility>
        key='step1'
        type={checkResult.isError
          ? CompatibilityStatusEnum.FAIL
          : CompatibilityStatusEnum.PASS
        }
        {...(checkResult.isError
          ? {
            fields: errorFieldsConfig,
            errors: checkResult.results
          }
          : undefined)}
      />
    })
  }

  const hasUpdatePermission = hasPermission({
    rbacOpsIds: [getOpsApi(EdgeUrlsInfo.patchEdgeClusterSubInterfaceSettings)] }
  )

  return (
    <Loader states={[{ isLoading: isLoading, isFetching: isFetching }]}>
      <StepsForm<SubInterfaceSettingsFormType>
        form={form}
        alert={isSingleNode ? undefined : alertData}
        onFinish={applyAndFinish}
        onCancel={handleCancel}
        initialValues={subInterfaceSettingsFormData}
        buttonLabel={{
          submit: hasUpdatePermission ? $t({ defaultMessage: 'Apply & Finish' }) : ''
        }}
        customSubmit={hasUpdatePermission ? {
          label: $t({ defaultMessage: 'Apply & Continue' }),
          onCustomFinish: applyAndContinue
        }: undefined}
      >
        <StepsForm.StepForm
          onValuesChange={doCompatibleCheck}
        >
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