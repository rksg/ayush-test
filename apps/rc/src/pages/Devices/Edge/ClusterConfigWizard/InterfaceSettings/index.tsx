import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { Form, Typography }       from 'antd'
import _, { get }                 from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { isStepsFormBackStepClicked, showActionModal, StepsForm, StepsFormProps }                               from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                               from '@acx-ui/feature-toggle'
import { CompatibilityStatusBar, CompatibilityStatusEnum, EdgeHaSettingsForm, TypeForm, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import {
  usePatchEdgeClusterNetworkSettingsMutation
} from '@acx-ui/rc/services'
import {
  ClusterHighAvailabilityModeEnum,
  convertEdgePortsConfigToApiPayload,
  EdgeIpModeEnum, EdgeLag, EdgePort, EdgePortTypeEnum, EdgeSerialNumber, EdgeUrlsInfo,
  getEdgeWanInterfaceCount
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'
import { hasPermission } from '@acx-ui/user'
import { getOpsApi }     from '@acx-ui/utils'

import { VirtualIpFormType }          from '../../EditEdgeCluster/VirtualIp'
import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { DualWanForm }        from './DualWan'
import { LagForm }            from './LagForm'
import { PortForm }           from './PortForm'
import { Summary }            from './Summary'
import {
  CompatibilityCheckResult,
  InterfacePortFormCompatibility,
  InterfaceSettingsFormType
} from './types'
import {
  getLagFormCompatibilityFields,
  getPortFormCompatibilityFields,
  interfaceCompatibilityCheck,
  lagSettingsCompatibleCheck,
  transformFromApiToFormData,
  transformFromFormToApiData
} from './utils'
import { VirtualIpForm } from './VirtualIpForm'

const lagCompatibleErrorFields = getLagFormCompatibilityFields()
const portCompatibleErrorFields = getPortFormCompatibilityFields()

const enum InterfaceSettingsTypeEnum {
  LAGS = 'lagSettings',
  PORTS = 'portSettings',
  DUAL_WAN = 'dualWanSettings',
  VIRTUAL_IP = 'virtualIpSettings',
  HA_SETTING = 'haSettings'
}

export const InterfaceSettings = () => {
  const { clusterId } = useParams()
  const isEdgeHaAaOn = useIsSplitOn(Features.EDGE_HA_AA_TOGGLE)
  const isEdgeDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const selectTypePage = useTenantLink(`/devices/edge/cluster/${clusterId}/configure`)
  const { clusterInfo, clusterNetworkSettings } = useContext(ClusterConfigWizardContext)
  const [configWizardForm] = Form.useForm()
  const [alertData, setAlertData] = useState<
  StepsFormProps<Record<string, unknown>>['alert']>({
    type: 'success',
    message: <CompatibilityStatusBar
      key='step1'
      type={CompatibilityStatusEnum.PASS}
    />
  })
  // eslint-disable-next-line max-len
  const [dynamicStepsVisible, setDynamicStepsVisible] = useState<{ [k in string]: boolean }>({ dualWanSettings: false })

  const [updateNetworkConfig] = usePatchEdgeClusterNetworkSettingsMutation()

  const isSingleNode = (clusterInfo?.edgeList?.length ?? 0) < 2
  const clusterNetworkSettingsFormData = transformFromApiToFormData(clusterNetworkSettings)

  const doCompatibleCheck = (typeKey: string): void => {
    const checkResult = getCompatibleCheckResult(typeKey)
    updateAlertMessage(checkResult, typeKey)
  }

  const getCompatibleCheckResult = useCallback((typeKey: string): CompatibilityCheckResult => {
    const formData = _.get(configWizardForm.getFieldsValue(true), typeKey)
    let checkResult: CompatibilityCheckResult
    if (typeKey === InterfaceSettingsTypeEnum.LAGS) {
      checkResult = lagSettingsCompatibleCheck(formData, clusterInfo?.edgeList)
    } else {
      const lagFormData = _.get(configWizardForm.getFieldsValue(true), 'lagSettings')
      checkResult = interfaceCompatibilityCheck(formData, lagFormData, clusterInfo?.edgeList)
    }

    return checkResult
  }, [configWizardForm, clusterInfo])

  const updateAlertMessage = (
    checkResult: CompatibilityCheckResult,
    typeKey?: string
  ) => {
    let errorFieldsConfig
    if (typeKey === InterfaceSettingsTypeEnum.LAGS) {
      errorFieldsConfig = lagCompatibleErrorFields
    } else {
      errorFieldsConfig = portCompatibleErrorFields
    }

    setAlertData({
      type: checkResult.isError?'error':'success',
      message: <CompatibilityStatusBar<InterfacePortFormCompatibility>
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

  const handlePortValueChange = (changedValues: Partial<InterfaceSettingsFormType>) => {
    const settings = changedValues.portSettings as InterfaceSettingsFormType['portSettings']
    let changedField
    let changedValue
    let targetSn: EdgeSerialNumber = ''
    let targetPortIfName: string = ''
    let field: EdgePort
    for (let sn in settings) {
      for (let portIfName in settings[sn]) {
        field = settings[sn][portIfName][0] as EdgePort
        for (let fieldKey in field) {
          if (!changedField) {
            targetSn = sn
            targetPortIfName = portIfName
            changedField = fieldKey
            changedValue = field[fieldKey as keyof typeof field]
            break
          }
        }
      }
    }

    if (changedField === 'portType' || changedField === 'corePortEnabled') {
      const targetNamePath = ['portSettings', targetSn, targetPortIfName, 0]

      if (changedField === 'corePortEnabled' && changedValue === false) {
        configWizardForm.setFieldValue(targetNamePath.concat(['ipMode']), EdgeIpModeEnum.STATIC)
      } else if (changedField === 'portType' && (changedValue === EdgePortTypeEnum.LAN)) {
        configWizardForm.setFieldValue(targetNamePath.concat(['ipMode']), EdgeIpModeEnum.STATIC)
      } else if (changedField === 'portType' && changedValue === EdgePortTypeEnum.WAN) {
        // eslint-disable-next-line max-len
        const initialPortData = clusterNetworkSettingsFormData.portSettings[targetSn][targetPortIfName][0]
        if (initialPortData?.portType !== EdgePortTypeEnum.WAN) {
          configWizardForm.setFieldValue(targetNamePath.concat(['natEnabled']), true)
        }
      }
    }
  }

  // only active-standby cluster and 2 WAN ports are configured
  const getShouldRenderDualWan = () => {
    const shouldDualWanVisible = get(dynamicStepsVisible, 'dualWanSettings')
    return shouldDualWanVisible && isSingleNode
  }

  const handleValuesChange = useCallback(_.debounce((
    typeKey: string,
    changedValues: Partial<InterfaceSettingsFormType>
  ) => {
    if (typeKey === InterfaceSettingsTypeEnum.PORTS) {
      handlePortValueChange(changedValues)
    }

    // check if has multi WAN
    if (isSingleNode) {
      const nodeSn = Object.keys(configWizardForm.getFieldValue('portSettings'))[0]
      // eslint-disable-next-line max-len
      const ports = Object.values((configWizardForm.getFieldValue('portSettings')[nodeSn]) as { [portId:string]: EdgePort[] })
        .flat()
      const lags = configWizardForm.getFieldValue('lagSettings')[0].lags ?? []
      // eslint-disable-next-line max-len
      const wanCount = getEdgeWanInterfaceCount(ports as EdgePort[], lags as EdgeLag[])
      setDynamicStepsVisible({ dualWanSettings: wanCount > 1 })
    }

    configWizardForm.validateFields()
      .then(() => doCompatibleCheck(typeKey))
      .catch(() => {/* do nothing */})
  }, 1000), [configWizardForm])

  const haSettingHeader = <Typography.Title level={2}>
    {$t({ defaultMessage: 'HA Settings' })}
  </Typography.Title>

  // initial Dual WAN check when clusterNetworkSettingsFormData is ready
  useEffect(() => {
    // eslint-disable-next-line max-len
    const wanCount = getEdgeWanInterfaceCount(clusterNetworkSettings?.portSettings[0].ports as EdgePort[], clusterNetworkSettings?.lagSettings[0].lags as EdgeLag[])
    setDynamicStepsVisible({ dualWanSettings: wanCount > 1 })
  }, [clusterNetworkSettings])

  const steps = useMemo(() => [
    {
      title: $t({ defaultMessage: 'LAG' }),
      id: InterfaceSettingsTypeEnum.LAGS,
      content: <LagForm
        onInit={() => {
          const checkResult = getCompatibleCheckResult(InterfaceSettingsTypeEnum.LAGS)
          updateAlertMessage(checkResult, InterfaceSettingsTypeEnum.LAGS)
        }}
      />,
      onValuesChange: (changedValues: Partial<InterfaceSettingsFormType>) =>
        handleValuesChange(InterfaceSettingsTypeEnum.LAGS, changedValues),
      onFinish: async (typeKey: string, event?: React.MouseEvent) => {
        const isBackBtn = isStepsFormBackStepClicked(event)

        const checkResult = getCompatibleCheckResult(typeKey)
        if (isBackBtn) {
          updateAlertMessage({ isError: false } as CompatibilityCheckResult)
          return true
        } else {
          updateAlertMessage(checkResult, typeKey)
          return !checkResult.isError
        }
      }
    },
    {
      title: $t({ defaultMessage: 'Port General' }),
      id: InterfaceSettingsTypeEnum.PORTS,
      content: <PortForm
        onInit={() => {
          const checkResult = getCompatibleCheckResult(InterfaceSettingsTypeEnum.PORTS)
          updateAlertMessage(checkResult, InterfaceSettingsTypeEnum.PORTS)
        }}
      />,
      onValuesChange: (changedValues: Partial<InterfaceSettingsFormType>) =>
        handleValuesChange(InterfaceSettingsTypeEnum.PORTS, changedValues),
      onFinish: async (typeKey: string, event?: React.MouseEvent) => {
        const isBackBtn = isStepsFormBackStepClicked(event)
        if (isBackBtn) {
          updateAlertMessage({ isError: false } as CompatibilityCheckResult)
          return true
        }

        // eslint-disable-next-line max-len
        const allValues = (configWizardForm.getFieldValue('portSettings') as InterfaceSettingsFormType['portSettings']) ?? {}

        for (let nodeSN in allValues) {
          for (let portIfName in allValues[nodeSN]) {
            allValues[nodeSN][portIfName].forEach((item, idx) => {
              // eslint-disable-next-line max-len
              allValues[nodeSN][portIfName][idx] = convertEdgePortsConfigToApiPayload(item) as EdgePort
            })
          }
        }
        configWizardForm.setFieldValue(['portSettings'], allValues)

        const checkResult = getCompatibleCheckResult(typeKey)
        updateAlertMessage(checkResult, typeKey)
        return !checkResult.isError
      }
    },
    ...(
      (isEdgeDualWanEnabled && getShouldRenderDualWan()) ?
        [{
          title: $t({ defaultMessage: 'Dual WAN' }),
          id: InterfaceSettingsTypeEnum.DUAL_WAN,
          content: <DualWanForm />
        }]:[]
    ),
    ...(
      isEdgeHaAaOn &&
      clusterInfo?.highAvailabilityMode === ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE ?
        [{
          title: $t({ defaultMessage: 'HA Settings' }),
          id: InterfaceSettingsTypeEnum.HA_SETTING,
          content: <TypeForm
            header={haSettingHeader}
            content={<EdgeHaSettingsForm />}
          />
        }]:
        [{
          title: $t({ defaultMessage: 'Cluster Virtual IP' }),
          id: InterfaceSettingsTypeEnum.VIRTUAL_IP,
          content: <VirtualIpForm />
        }]
    ),
    {
      title: $t({ defaultMessage: 'Summary' }),
      id: 'summary',
      content: <Summary />
    }
  ], [configWizardForm, getCompatibleCheckResult, handleValuesChange, dynamicStepsVisible])

  const invokeUpdateApi = async (
    value: InterfaceSettingsFormType,
    callback: () => void
  ) => {
    try {
      if(!isSingleNode && isVipConfigChanged(value.vipConfig)) {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Warning' }),
          content: $t({
            defaultMessage: `Changing any virtual IP configurations might 
            temporarily cause network disruption and alter the active/backup roles
            of this cluster. Are you sure you want to continue?`
          }),
          onOk: async () => {
            await updateNetworkConfig({
              params: {
                venueId: clusterInfo?.venueId,
                clusterId
              },
              payload: transformFromFormToApiData(value, clusterInfo?.highAvailabilityMode)
            }).unwrap()
            callback()
          }
        })
      } else {
        await updateNetworkConfig({
          params: {
            venueId: clusterInfo?.venueId,
            clusterId
          },
          payload: transformFromFormToApiData(value, clusterInfo?.highAvailabilityMode)
        }).unwrap()
        callback()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const isVipConfigChanged = (config: VirtualIpFormType['vipConfig']) => {
    return !_.isEqual(config, clusterNetworkSettingsFormData.vipConfig)
  }

  const applyAndFinish = async (value: InterfaceSettingsFormType) => {
    await invokeUpdateApi(
      value,
      () => navigate(clusterListPage)
    )
  }

  const applyAndContinue = async (value: InterfaceSettingsFormType) => {
    await invokeUpdateApi(
      value,
      () => navigate(selectTypePage)
    )
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const hasUpdatePermission = hasPermission({
    rbacOpsIds: [getOpsApi(EdgeUrlsInfo.patchEdgeClusterNetworkSettings)] }
  )

  return (
    <StepsForm<InterfaceSettingsFormType>
      form={configWizardForm}
      alert={isSingleNode ? undefined : alertData}
      onFinish={applyAndFinish}
      onCancel={handleCancel}
      initialValues={clusterNetworkSettingsFormData}
      buttonLabel={{
        submit: hasUpdatePermission ? $t({ defaultMessage: 'Apply & Finish' }) : ''
      }}
      customSubmit={hasUpdatePermission ? {
        label: $t({ defaultMessage: 'Apply & Continue' }),
        onCustomFinish: applyAndContinue
      } : undefined}
    >
      {
        steps.map((item, index) =>
          <StepsForm.StepForm
            key={`step-${index}`}
            name={index.toString()}
            title={item.title}
            onFinish={item.onFinish
              ? (_, e?: React.MouseEvent) => item.onFinish?.(item.id, e)
              : undefined}
            onValuesChange={
              item.onValuesChange
                // eslint-disable-next-line max-len
                ? (changedValues: Partial<InterfaceSettingsFormType>) => item.onValuesChange?.(changedValues)
                : undefined
            }
          >
            {item.content}
          </StepsForm.StepForm>)
      }
    </StepsForm>
  )
}