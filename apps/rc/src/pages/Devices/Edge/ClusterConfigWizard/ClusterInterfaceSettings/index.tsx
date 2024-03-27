import { useContext } from 'react'

import { Col, Form, Row, Space, Typography } from 'antd'
import _                                     from 'lodash'
import { useIntl }                           from 'react-intl'
import { useNavigate, useParams }            from 'react-router-dom'

import { Loader, StepsForm }   from '@acx-ui/components'
import {
  NodesTabs,
  TypeForm,
  useClusterInterfaceActions
} from '@acx-ui/rc/components'
import { EdgePortTypeEnum, EdgeSerialNumber } from '@acx-ui/rc/utils'
import { useTenantLink }                      from '@acx-ui/react-router-dom'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { EdgeClusterInterfaceSettingForm, EdgeClusterInterfaceSettingFormType } from './EdgeClusterInterfaceSettingForm'

type ClusterInterfaceSettingsFormType = Record<
EdgeSerialNumber,
EdgeClusterInterfaceSettingFormType
>

export const ClusterInterfaceSettings = () => {
  const { clusterId } = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const selectTypePage = useTenantLink(`/devices/edge/cluster/${clusterId}/configure`)
  const [form] = Form.useForm()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const {
    allInterfaceData,
    isInterfaceDataFetching,
    updateClusterInterface
  } = useClusterInterfaceActions(clusterInfo)

  const getTargetInterfaceConfig = (serialNumber: string) => {
    return allInterfaceData?.[serialNumber]?.find(
      interfaceData => interfaceData.portType === EdgePortTypeEnum.CLUSTER &&
      interfaceData.portEnabled
    )
  }

  const clusterInterfaceSettings = _.reduce(clusterInfo?.edgeList,
    (result, edgeNode) => {
      const currentcClusterInterface = getTargetInterfaceConfig(edgeNode.serialNumber)
      result[edgeNode.serialNumber] = {
        interfaceName: currentcClusterInterface?.portName ?? '',
        ip: currentcClusterInterface?.ip?.split('/')[0] ?? '',
        subnet: currentcClusterInterface?.subnet ?? ''
      }
      return result
    }, {} as ClusterInterfaceSettingsFormType)

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'Cluster Interface' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Cluster interface will be used as a communication channel 
      between SmartEdges. Please select the cluster interfaces for all SmartEdges in 
      this cluster ({clusterName}):` },
      { clusterName: clusterInfo?.name })}
    </Typography.Text>
  </Space>

  const content = <NodesTabs
    nodeList={clusterInfo?.edgeList}
    content={
      (serialNumber) => (
        <Row>
          <Col span={10}>
            <EdgeClusterInterfaceSettingForm
              form={form}
              interfaceList={allInterfaceData?.[serialNumber]}
              rootNamePath={[serialNumber]}
            />
          </Col>
        </Row>
      )
    }
  />

  const invokeUpdateApi = async (
    value: ClusterInterfaceSettingsFormType,
    callback: () => void
  ) => {
    try {
      const clusterSettings = Object.entries(value).map(([k, v]) => {
        const nodeInfo = clusterInfo?.edgeList?.find(item => item.serialNumber === k)
        return {
          nodeName: nodeInfo?.name ?? '',
          serialNumber: k,
          interfaceName: v.interfaceName,
          ip: v.ip,
          subnet: v.subnet
        }
      })
      await updateClusterInterface(clusterSettings, callback)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const applyAndFinish = async (value: ClusterInterfaceSettingsFormType) => {
    await invokeUpdateApi(
      value,
      () => navigate(clusterListPage)
    )
  }

  const applyAndContinue = async (value: ClusterInterfaceSettingsFormType) => {
    await invokeUpdateApi(
      value,
      () => navigate(selectTypePage)
    )
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  return (
    <Loader states={[{ isLoading: isInterfaceDataFetching }]}>
      <StepsForm<ClusterInterfaceSettingsFormType>
        form={form}
        onFinish={applyAndFinish}
        onCancel={handleCancel}
        initialValues={clusterInterfaceSettings}
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
            header={header}
            content={content}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}