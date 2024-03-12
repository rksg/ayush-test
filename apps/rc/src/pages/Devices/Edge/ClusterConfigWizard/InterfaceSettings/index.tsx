import { useContext, useState } from 'react'

import { Form }                   from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, StepsForm, StepsFormProps }               from '@acx-ui/components'
import { CompatibilityStatusBar, CompatibilityStatusEnum } from '@acx-ui/rc/components'
import {
  useGetEdgeClusterNetworkSettingsQuery,
  usePatchEdgeClusterNetworkSettingsMutation
} from '@acx-ui/rc/services'
import { convertEdgePortsConfigToApiPayload, EdgePort } from '@acx-ui/rc/utils'
import { useTenantLink }                                from '@acx-ui/react-router-dom'

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
      clusterNetworkSettings: transformFromApiToFormData(data, clusterInfo),
      isFetching
    })
  })
  const [updateNetworkConfig] = usePatchEdgeClusterNetworkSettingsMutation()

  const doCompatibleCheck = (typeKey: string): CompatibilityCheckResult => {
    const formData = _.get(configWizardForm.getFieldsValue(true), typeKey)
    let checkResult: CompatibilityCheckResult
    let errorFieldsConfig
    if (typeKey === 'lagSettings') {
      errorFieldsConfig = lagCompatibleErrorFields
      checkResult = lagSettingsCompatibleCheck(formData, clusterInfo?.edgeList)
    } else {
      errorFieldsConfig = portCompatibleErrorFields
      checkResult = interfaceCompatibilityCheck(formData, clusterInfo?.edgeList)
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

  const handleValuesChange = _.debounce((typeKey: string) => {
    configWizardForm.validateFields()
      .then(() => doCompatibleCheck(typeKey))
      .catch(() => {/* no nothing */})
  }, 1000)

  const steps = [
    {
      title: $t({ defaultMessage: 'LAG' }),
      id: 'lagSettings',
      content: <LagForm />,
      onValuesChange: (type: string) => handleValuesChange(type),
      onFinish: async (typeKey: string) => {
        const checkResult = doCompatibleCheck(typeKey)
        return !checkResult.isError
      }
    },
    {
      title: $t({ defaultMessage: 'Port General' }),
      id: 'portSettings',
      content: <PortForm />,
      onValuesChange: (type: string) => handleValuesChange(type),
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
      await updateNetworkConfig({
        params: {
          venueId: clusterInfo?.venueId,
          clusterId
        },
        payload: transformFromFormToApiData(value)
      }).unwrap()
      callback()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const applyAndFinish = async (value: InterfaceSettingsFormType) => {
    invokeUpdateApi(
      value,
      () => navigate(clusterListPage)
    )
  }

  const applyAndContinue = async (value: InterfaceSettingsFormType) => {
    invokeUpdateApi(
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
        alert={alertData}
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
                  ? () => item.onValuesChange?.(item.id)
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