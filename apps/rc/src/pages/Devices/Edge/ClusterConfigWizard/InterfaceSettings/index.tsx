import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { Form }                           from 'antd'
import { get, reduce, debounce, isEqual } from 'lodash'
import { useIntl }                        from 'react-intl'
import { useNavigate, useParams }         from 'react-router-dom'

import { isStepsFormBackStepClicked, showActionModal, StepsForm, StepsFormProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                 from '@acx-ui/feature-toggle'
import { CompatibilityStatusBar, CompatibilityStatusEnum, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import {
  usePatchEdgeClusterNetworkSettingsMutation
} from '@acx-ui/rc/services'
import {
  ClusterHighAvailabilityModeEnum,
  EdgeIpModeEnum,
  EdgeLag,
  EdgeNodesPortsInfo,
  EdgePort,
  EdgePortTypeEnum,
  EdgeSerialNumber, EdgeUrlsInfo,
  getEdgeWanInterfaceCount
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'
import { hasPermission } from '@acx-ui/user'
import { getOpsApi }     from '@acx-ui/utils'

import { VirtualIpFormType }                                               from '../../EditEdgeCluster/VirtualIp'
import { ClusterConfigWizardContext }                                      from '../ClusterConfigWizardDataProvider'
import { getSubInterfaceCompatibilityFields, subInterfaceCompatibleCheck } from '../SubInterfaceSettings/utils'

import { DualWanForm }                     from './DualWan'
import { getDualWanDataFromClusterWizard } from './DualWan/utils'
import { HaSettingForm }                   from './HaSettingForm'
import { LagForm }                         from './LagForm'
import { PortForm }                        from './PortForm'
import { SubInterfaceForm }                from './SubInterfaceForm'
import { Summary }                         from './Summary'
import {
  CompatibilityCheckResult,
  InterfacePortFormCompatibility,
  InterfaceSettingsFormStepProps,
  InterfaceSettingsFormType,
  InterfaceSettingsTypeEnum
} from './types'
import {
  getAllInterfaceAsPortInfoFromForm,
  getLagFormCompatibilityFields,
  getPortFormCompatibilityFields,
  interfaceCompatibilityCheck,
  lagSettingsCompatibleCheck,
  transformFromApiToFormData,
  transformFromFormToApiData
} from './utils'
import { VirtualIpForm } from './VirtualIpForm'


const subInterfaceCompatibleErrorFields = getSubInterfaceCompatibilityFields()

export const InterfaceSettings = () => {
  const { clusterId } = useParams()
  const isEdgeHaAaOn = useIsSplitOn(Features.EDGE_HA_AA_TOGGLE)
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
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
  const validateResultRef = useRef<boolean>(true)

  const [updateNetworkConfig] = usePatchEdgeClusterNetworkSettingsMutation()

  const isSingleNode = (clusterInfo?.edgeList?.length ?? 0) < 2
  const clusterNetworkSettingsFormData = transformFromApiToFormData(clusterNetworkSettings)

  // After removing core/access FF, move the following code outside the component
  const lagCompatibleErrorFields = getLagFormCompatibilityFields(isEdgeCoreAccessSeparationReady)
  const portCompatibleErrorFields = getPortFormCompatibilityFields(isEdgeCoreAccessSeparationReady)

  const doCompatibleCheck = (typeKey: string): void => {
    const checkResult = getCompatibleCheckResult(typeKey)
    updateAlertMessage(checkResult, typeKey)
  }

  const getCompatibleCheckResult = useCallback((typeKey: string): CompatibilityCheckResult => {
    const formData = get(configWizardForm.getFieldsValue(true), typeKey)
    let checkResult: CompatibilityCheckResult
    if (typeKey === InterfaceSettingsTypeEnum.LAGS) {
      // eslint-disable-next-line max-len
      checkResult = lagSettingsCompatibleCheck(formData, clusterInfo?.edgeList, isEdgeCoreAccessSeparationReady)
    } else if (typeKey === InterfaceSettingsTypeEnum.SUB_INTERFACE) {
      const allInterfaces = getAllInterfaceAsPortInfoFromForm(configWizardForm)
      checkResult = subInterfaceCompatibleCheck(
        get(configWizardForm.getFieldsValue(true), 'portSubInterfaces'),
        get(configWizardForm.getFieldsValue(true), 'lagSubInterfaces'),
        clusterInfo?.edgeList,
        reduce(Object.entries(allInterfaces), (result, [serialNumber, interfaces]) => {
          result[serialNumber] = interfaces.filter((item) => !item.isLag)
          return result
        }, {} as EdgeNodesPortsInfo),
        reduce(Object.entries(allInterfaces), (result, [serialNumber, interfaces]) => {
          result[serialNumber] = interfaces.filter((item) => item.isLag)
          return result
        }, {} as EdgeNodesPortsInfo)) as unknown as CompatibilityCheckResult
    } else {
      const lagFormData = get(configWizardForm.getFieldsValue(true), 'lagSettings')
      // eslint-disable-next-line max-len
      checkResult = interfaceCompatibilityCheck(formData, lagFormData, clusterInfo?.edgeList, isEdgeCoreAccessSeparationReady)
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
    } else if(typeKey === InterfaceSettingsTypeEnum.SUB_INTERFACE) {
      errorFieldsConfig = subInterfaceCompatibleErrorFields
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

  const getShouldRenderDualWan = () => {
    return get(dynamicStepsVisible, 'dualWanSettings')
  }

  const updateDynamicStepsDualWan = useCallback((ports: EdgePort[], lags: EdgeLag[]) => {
    // check if has multi WAN
    const wanCount = getEdgeWanInterfaceCount(ports, lags)
    // valid Dual WAN: single-node cluster and 2 WAN ports are configured
    const isDualWan = isSingleNode && wanCount > 1

    setDynamicStepsVisible((prevState) => {
      return {
        ...prevState,
        dualWanSettings: isDualWan
      }
    })
  }, [isSingleNode])

  const handleValuesChange = useCallback(debounce((
    typeKey: string,
    changedValues: Partial<InterfaceSettingsFormType>
  ) => {
    if (typeKey === InterfaceSettingsTypeEnum.PORTS) {
      handlePortValueChange(changedValues)
    }

    // check if has multi WAN
    const nodeSn = Object.keys(configWizardForm.getFieldValue('portSettings'))[0]
    // eslint-disable-next-line max-len
    const ports = Object.values((configWizardForm.getFieldValue('portSettings')[nodeSn]) as { [portId:string]: EdgePort[] })
      .flat()
    const lags = configWizardForm.getFieldValue('lagSettings')[0].lags ?? []
    updateDynamicStepsDualWan(ports, lags)

    configWizardForm.validateFields()
      .catch(() => {/* do nothing */})
      .finally(() => doCompatibleCheck(typeKey))
  }, 1000), [configWizardForm, updateDynamicStepsDualWan])

  // initial Dual WAN check when clusterNetworkSettings is ready
  useEffect(() => {
    // eslint-disable-next-line max-len
    updateDynamicStepsDualWan(clusterNetworkSettings?.portSettings[0].ports as EdgePort[], clusterNetworkSettings?.lagSettings[0].lags as EdgeLag[])
  }, [clusterNetworkSettings, updateDynamicStepsDualWan])

  const onPortStepFinish = useCallback(async () => {
    // dual WAN check
    if (isEdgeDualWanEnabled) {
      // clear dualWanSettings if cluster is multi-nodes
      const configWizardFormData = configWizardForm.getFieldsValue(true)
      // eslint-disable-next-line max-len
      configWizardForm.setFieldValue(['multiWanSettings'], getDualWanDataFromClusterWizard(configWizardFormData))
    }
  }, [configWizardForm, isEdgeDualWanEnabled])

  const steps = useMemo(() => {
    return [
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
        onFinish: true
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
        onFinish: onPortStepFinish
      },
      ...(
        isEdgeCoreAccessSeparationReady ?
          [{
            title: $t({ defaultMessage: 'Sub-interface Settings' }),
            id: InterfaceSettingsTypeEnum.SUB_INTERFACE,
            content: <SubInterfaceForm />,
            onValuesChange: (changedValues: Partial<InterfaceSettingsFormType>) =>
              handleValuesChange(InterfaceSettingsTypeEnum.SUB_INTERFACE, changedValues),
            onFinish: true
          }] : []
      ),
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
            content: <HaSettingForm />
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
    ] as InterfaceSettingsFormStepProps[]
  // eslint-disable-next-line max-len
  }, [configWizardForm, getCompatibleCheckResult, handleValuesChange, onPortStepFinish, dynamicStepsVisible])

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
              payload: transformFromFormToApiData(
                value,
                clusterInfo?.highAvailabilityMode,
                isEdgeCoreAccessSeparationReady
              )
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
          payload: transformFromFormToApiData(
            value,
            clusterInfo?.highAvailabilityMode,
            isEdgeCoreAccessSeparationReady
          )
        }).unwrap()
        callback()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const isVipConfigChanged = (config: VirtualIpFormType['vipConfig']) => {
    return !isEqual(config, clusterNetworkSettingsFormData.vipConfig)
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

  const handleStepFinish = async (
    item: InterfaceSettingsFormStepProps,
    event?: React.MouseEvent
  ) => {
    const isBackBtn = isStepsFormBackStepClicked(event)
    if (isBackBtn) {
      updateAlertMessage({ isError: false } as CompatibilityCheckResult)
      return Promise.resolve(true)
    }

    const typeKey = item.id as InterfaceSettingsTypeEnum
    const checkResult = getCompatibleCheckResult(typeKey)
    updateAlertMessage(checkResult, typeKey)

    // if current step has invalid fields, do not allow to go to next step
    if (!validateResultRef.current) {
      return Promise.resolve(false)
    }

    validateResultRef.current = true

    if (typeof item.onFinish === 'function') {
      await item.onFinish?.(item.id, event)
    }

    return Promise.resolve(!checkResult.isError)
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
              ? (_, e?: React.MouseEvent) => handleStepFinish(item, e)
              : undefined}
            onFinishFailed={() => {
              validateResultRef.current = false
            }}
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