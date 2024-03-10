import { useContext, useState } from 'react'

import { Form, Typography }                               from 'antd'
import { CompatibilityNodeError, SingleNodeDetailsField } from 'libs/rc/shared/components/src/EdgeCluster/CompatibilityErrorDetails/types'
import _                                                  from 'lodash'
import { useIntl }                                        from 'react-intl'
import { useNavigate }                                    from 'react-router-dom'

import { Loader, StepsForm, StepsFormProps }                                                               from '@acx-ui/components'
import { CompatibilityStatusBar, CompatibilityStatusEnum }                                                 from '@acx-ui/rc/components'
import { useGetEdgeClusterNetworkSettingsQuery }                                                           from '@acx-ui/rc/services'
import { ClusterNetworkSettings, EdgeLag, EdgePort, EdgePortTypeEnum, EdgeSerialNumber, VirtualIpSetting } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                                   from '@acx-ui/react-router-dom'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { LagForm }  from './LagForm'
import { PortForm } from './PortForm'

export interface InterfaceSettingsFormType {
  portSettings: Record<EdgeSerialNumber, { [portId:string]: EdgePort[] }>
  lagSettings: Record<EdgeSerialNumber, EdgeLag[]>
  virtualIpSettings: VirtualIpSetting[]
}

interface InterfacePortFormCompatibility {
    ports: number,
    corePorts: number,
    portTypes: Record<string, number>
}

const transformFromApiToFormData =
 (apiData?: ClusterNetworkSettings):InterfaceSettingsFormType => {
   return {
     portSettings: _.reduce(apiData?.portSettings,
       (result, port) => {
         result[port.serialNumber] = _.groupBy(port.ports, 'interfaceName')
         return result
       }, {} as InterfaceSettingsFormType['portSettings']),
     lagSettings: _.reduce(apiData?.lagSettings,
       (result, lag) => {
         result[lag.serialNumber] = lag.lags
         return result
       }, {} as InterfaceSettingsFormType['lagSettings']),
     virtualIpSettings: apiData?.virtualIpSettings ?? []
   } as InterfaceSettingsFormType
 }


const getPortFormCompatibilityFields = () => {
  return [{
    key: 'ports',
    title: 'Number of Ports',
    render: (errors:CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
    //TODO:
      <Typography.Text type='danger' children={errors.ports}/>
  }, {
    key: 'corePorts',
    title: 'Number of Core Ports',
    render: (errors:
      CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) =>
      <Typography.Text children={errors.corePorts}/>
  }, {
    key: 'portTypes',
    title: 'Port Types',
    render: (errors:
      CompatibilityNodeError<InterfacePortFormCompatibility>['errors']) => {
      return Object.keys(errors.portTypes)
        .map((portType) => {
          <Typography.Text
          //TODO:
            type={'danger'}
            children={portType}
          />
        })
    }
  }] as SingleNodeDetailsField<InterfacePortFormCompatibility>[]
}

const interfaceCompatibilityCheck = (portSettings: InterfaceSettingsFormType) => {
  // eslint-disable-next-line max-len
  const checkResult: Record<EdgeSerialNumber, CompatibilityNodeError<InterfacePortFormCompatibility>> = {}

  Object.entries(portSettings).map(([serialNumber, portsData]) => {
    let result = {
      nodeId: '',
      errors: {
        ports: 0,
        corePorts: 0,
        portTypes: {}
      }
    } as CompatibilityNodeError<InterfacePortFormCompatibility>

    _.values(portsData).flat().forEach(port => {
      result.nodeId = serialNumber
      result.errors.ports++
      if (port.corePortEnabled) result.errors.corePorts++
      result.errors.portTypes[port.portType] = (result.errors.portTypes[port.portType]??0)+1
    })

    checkResult[serialNumber] = result
  })

  let results = _.values(checkResult)
  return {
    results,
    ports: _.every(results, 'ports'),
    corePorts: _.every(results, 'corePorts'),
    portTypes: _.every(results, 'portTypes')
  }
}

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

  const handleValuesChange = _.debounce((typeKey: string) => {
    const formData = _.get(configWizardForm.getFieldsValue(true), typeKey)

    const hasError = 1
    if (hasError) {
      const checkResult = interfaceCompatibilityCheck(formData)

      setAlertData({
        type: 'error',
        message: <CompatibilityStatusBar<InterfacePortFormCompatibility>
          key='step1'
          type={CompatibilityStatusEnum.FAIL}
          fields={errorFieldsConfig}
          errors={checkResult.results}
        />
      })
    }
  }, 1000)

  const steps = [
    {
      title: $t({ defaultMessage: 'LAG' }),
      id: 'lagSettings',
      content: <LagForm />,
      onValuesChange: (type: string) => handleValuesChange(type),
      onFinish: async (typeKey: string) => {
        const lagData = _.get(configWizardForm.getFieldsValue(true), typeKey)

        // TODO: LAG setting CompatibilityCheck
        return true
      }
    },
    {
      title: $t({ defaultMessage: 'Port General' }),
      id: 'portSettings',
      content: <PortForm />,
      onValuesChange: (type: string) => handleValuesChange(type),
      onFinish: async (typeKey: string) => {
        const formData = _.get(configWizardForm.getFieldsValue(true), typeKey)

        // TODO
        const checkResult = interfaceCompatibilityCheck(formData)
        if (checkResult) {
          return false
        }
        return true
      }
    },
    {
      title: $t({ defaultMessage: 'Cluster Virtual IP' }),
      id: 'virtualIpSettings',
      content: <>Cluster Virtual IP</>,
      onValuesChange: (type: string) => handleValuesChange(type),
      onFinish: async (typeKey: string) => {
        const virtualIPData = _.get(configWizardForm.getFieldsValue(true), typeKey)

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