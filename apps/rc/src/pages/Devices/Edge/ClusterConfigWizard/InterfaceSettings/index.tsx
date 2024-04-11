import { useContext, useState } from 'react'

import { Form }                   from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, showActionModal, StepsForm, StepsFormProps } from '@acx-ui/components'
import { CompatibilityStatusBar, CompatibilityStatusEnum }    from '@acx-ui/rc/components'
import {
  useGetEdgeClusterNetworkSettingsQuery,
  usePatchEdgeClusterNetworkSettingsMutation
} from '@acx-ui/rc/services'
import { convertEdgePortsConfigToApiPayload, EdgeIpModeEnum, EdgePort, EdgePortTypeEnum, EdgeSerialNumber } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                                    from '@acx-ui/react-router-dom'

import { VirtualIpFormType }          from '../../EditEdgeCluster/VirtualIp'
import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

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

export const InterfaceSettings = () => {
  const { clusterId } = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const selectTypePage = useTenantLink(`/devices/edge/cluster/${clusterId}/configure`)
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const [configWizardForm] = Form.useForm()
  const [alertData, setAlertData] = useState<
  StepsFormProps<Record<string, unknown>>['alert']>({
    type: 'success',
    message: <CompatibilityStatusBar
      key='step1'
      type={CompatibilityStatusEnum.PASS}
    />
  })

  const { clusterNetworkSettings, isFetching } = useGetEdgeClusterNetworkSettingsQuery({
    params: {
      venueId: clusterInfo?.venueId,
      clusterId: clusterInfo?.clusterId
    }
  },{
    skip: !Boolean(clusterInfo),
    selectFromResult: ({ data, isFetching }) => ({
      clusterNetworkSettings: transformFromApiToFormData(data),
      isFetching
    })
  })
  const [updateNetworkConfig] = usePatchEdgeClusterNetworkSettingsMutation()

  const isSingleNode = (clusterInfo?.edgeList?.length ?? 0) < 2

  const doCompatibleCheck = (typeKey: string): CompatibilityCheckResult => {
    const formData = _.get(configWizardForm.getFieldsValue(true), typeKey)
    let checkResult: CompatibilityCheckResult
    let errorFieldsConfig
    if (typeKey === 'lagSettings') {
      errorFieldsConfig = lagCompatibleErrorFields
      checkResult = lagSettingsCompatibleCheck(formData, clusterInfo?.edgeList)
    } else {
      errorFieldsConfig = portCompatibleErrorFields
      const lagFormData = _.get(configWizardForm.getFieldsValue(true), 'lagSettings')
      checkResult = interfaceCompatibilityCheck(formData, lagFormData, clusterInfo?.edgeList)
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

    return checkResult
  }

  const handlePortValueChange = (changedValues: Partial<InterfaceSettingsFormType>) => {
    const settings = changedValues.portSettings as InterfaceSettingsFormType['portSettings']
    let changedField
    let changedValue
    let targetSn: EdgeSerialNumber = ''
    let targetPortIfNaem: string = ''
    let field: EdgePort
    for (let sn in settings) {
      for (let portIfName in settings[sn]) {
        field = settings[sn][portIfName][0] as EdgePort
        for (let fieldKey in field) {
          if (!changedField) {
            targetSn = sn
            targetPortIfNaem = portIfName
            changedField = fieldKey
            changedValue = field[fieldKey as keyof typeof field]
            break
          }
        }
      }
    }

    if (changedField === 'portType' || changedField === 'corePortEnabled') {
      const targetNamePath = ['portSettings', targetSn, targetPortIfNaem, 0]

      if (changedField === 'corePortEnabled' && changedValue === false) {
        configWizardForm.setFieldValue(targetNamePath.concat(['ipMode']), EdgeIpModeEnum.STATIC)
      } else if (changedField === 'portType'
        && (changedValue === EdgePortTypeEnum.LAN)) {
        configWizardForm.setFieldValue(targetNamePath.concat(['ipMode']), EdgeIpModeEnum.STATIC)
      } else if (changedField === 'portType' && changedValue === EdgePortTypeEnum.WAN) {
        const initialPortData = clusterNetworkSettings.portSettings[targetSn][targetPortIfNaem][0]
        if (initialPortData?.portType !== EdgePortTypeEnum.WAN) {
          configWizardForm.setFieldValue(targetNamePath.concat(['natEnabled']), true)
        }
      }
    }
  }

  const handleValuesChange = _.debounce((
    typeKey: string,
    changedValues: Partial<InterfaceSettingsFormType>
  ) => {
    if (typeKey === 'portSettings') {
      handlePortValueChange(changedValues)
    }

    configWizardForm.validateFields()
      .then(() => doCompatibleCheck(typeKey))
      .catch(() => {/* do nothing */})
  }, 1000)

  const steps = [
    {
      title: $t({ defaultMessage: 'LAG' }),
      id: 'lagSettings',
      content: <LagForm />,
      onValuesChange: (changedValues: Partial<InterfaceSettingsFormType>) =>
        handleValuesChange('lagSettings', changedValues),
      onFinish: async (typeKey: string) => {
        const checkResult = doCompatibleCheck(typeKey)
        return !checkResult.isError
      }
    },
    {
      title: $t({ defaultMessage: 'Port General' }),
      id: 'portSettings',
      content: <PortForm />,
      onValuesChange: (changedValues: Partial<InterfaceSettingsFormType>) =>
        handleValuesChange('portSettings', changedValues),
      onFinish: async (typeKey: string) => {
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

        const checkResult = doCompatibleCheck(typeKey)
        return !checkResult.isError
      }
    },
    {
      title: $t({ defaultMessage: 'Cluster Virtual IP' }),
      id: 'virtualIpSettings',
      content: <VirtualIpForm />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      id: 'summary',
      content: <Summary />
    }
  ]

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
              payload: transformFromFormToApiData(value)
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
          payload: transformFromFormToApiData(value)
        }).unwrap()
        callback()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const isVipConfigChanged = (config: VirtualIpFormType['vipConfig']) => {
    return !_.isEqual(config, clusterNetworkSettings.vipConfig)
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

  return (
    <Loader states={[{ isLoading: isFetching }]}>
      <StepsForm<InterfaceSettingsFormType>
        form={configWizardForm}
        alert={isSingleNode ? undefined : alertData}
        onFinish={applyAndFinish}
        onCancel={handleCancel}
        initialValues={clusterNetworkSettings}
        buttonLabel={{
          submit: $t({ defaultMessage: 'Apply & Finish' })
        }}
        customSubmit={{
          label: $t({ defaultMessage: 'Apply & Continue' }),
          onCustomFinish: applyAndContinue
        }}
      >
        {
          steps.map((item, index) =>
            <StepsForm.StepForm
              key={`step-${index}`}
              name={index.toString()}
              title={item.title}
              onFinish={item.onFinish
                ? () => item.onFinish?.(item.id)
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
    </Loader>
  )
}