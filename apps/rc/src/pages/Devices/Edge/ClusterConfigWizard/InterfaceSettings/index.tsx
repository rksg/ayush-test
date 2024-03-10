import { useContext, useState } from 'react'

import { Form }        from 'antd'
import _               from 'lodash'
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader, StepsForm, StepsFormProps }               from '@acx-ui/components'
import { CompatibilityStatusBar, CompatibilityStatusEnum } from '@acx-ui/rc/components'
import { useGetEdgeClusterNetworkSettingsQuery }           from '@acx-ui/rc/services'
import { useTenantLink }                                   from '@acx-ui/react-router-dom'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { LagForm }                                                                                 from './LagForm'
import { PortForm }                                                                                from './PortForm'
import { InterfacePortFormCompatibility, InterfaceSettingsFormType }                               from './types'
import { getPortFormCompatibilityFields, interfaceCompatibilityCheck, transformFromApiToFormData } from './utils'

export const InterfaceSettings = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const [configWizardForm] = Form.useForm()
  const errorFieldsConfig = getPortFormCompatibilityFields()

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

  const doCompatibleCheck = (typeKey: string) => {
    const formData = _.get(configWizardForm.getFieldsValue(true), typeKey)
    const checkResult = interfaceCompatibilityCheck(formData)

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
      content: <LagForm
        setAlertBarData={setAlertData}
        compatibilityCheck={interfaceCompatibilityCheck}
      />,
      onValuesChange: (type: string) => handleValuesChange(type),
      onFinish: async (typeKey: string) => {
        const lagData = _.get(configWizardForm.getFieldsValue(true), typeKey)
        // eslint-disable-next-line no-console
        console.log('lagData', lagData)
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
        const checkResult = doCompatibleCheck(typeKey)
        return !checkResult.isError
      }
    },
    {
      title: $t({ defaultMessage: 'Cluster Virtual IP' }),
      id: 'virtualIpSettings',
      content: <>Cluster Virtual IP</>,
      onValuesChange: (type: string) => handleValuesChange(type),
      onFinish: async (typeKey: string) => {
        const virtualIPData = _.get(configWizardForm.getFieldsValue(true), typeKey)
        // eslint-disable-next-line no-console
        console.log('virtualIPData', virtualIPData)
        // TODO: Virtual IP CompatibilityCheck
        return true
      }
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      id: 'summary',
      content: <>Summary</>
    }
  ]

  const handleFinish = async (value: unknown) => {
    // TODO
    // eslint-disable-next-line no-console
    console.log(value)
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  return (
    <Loader states={[{ isLoading: isFetching }]}>
      <StepsForm<InterfaceSettingsFormType>
        form={configWizardForm}
        alert={alertData}
        onFinish={handleFinish}
        onCancel={handleCancel}
        initialValues={clusterNetworkSettings}
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