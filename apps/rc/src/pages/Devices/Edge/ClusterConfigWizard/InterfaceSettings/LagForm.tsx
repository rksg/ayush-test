import { useContext } from 'react'

import { Form, Space, Typography } from 'antd'
import _                           from 'lodash'
import { useIntl }                 from 'react-intl'

import { useStepFormContext }                                        from '@acx-ui/components'
import { EdgeLagTable, NodesTabs, TypeForm }                         from '@acx-ui/rc/components'
import { EdgeLag, EdgePortTypeEnum, edgePhysicalPortInitialConfigs } from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { InterfaceSettingsFormType } from './types'

export const LagForm = () => {
  const { $t } = useIntl()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'LAG Settings' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Create and configure the LAG for all SmartEdges in this cluster 
      ({clusterName}) if needed, or click 'Next' to skip:` },
      { clusterName: clusterInfo?.name })}
    </Typography.Text>
  </Space>

  const content = <Form.Item
    name='lagSettings'
    children={<LagSettingView />}
  />

  return (
    <TypeForm
      header={header}
      content={content}
    />
  )
}

interface LagSettingViewProps {
  value?: InterfaceSettingsFormType['lagSettings']
  onChange?: (data: unknown) => void
}

const LagSettingView = (props: LagSettingViewProps) => {
  const { value, onChange } = props
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const { form } = useStepFormContext()
  // eslint-disable-next-line max-len
  const portSettings = form.getFieldValue('portSettings') as (InterfaceSettingsFormType['portSettings'] | undefined)

  const handleAdd = async (serialNumber: string, lagData: EdgeLag) => {
    const targetLagSettings = value?.find(item => item.serialNumber === serialNumber)
    onChange?.([
      ...(value?.filter(item => item.serialNumber !== serialNumber) ?? []),
      {
        serialNumber,
        lags: [...(targetLagSettings?.lags ?? []), lagData]
      }
    ])

    // reset physical port config when it is selected as LAG member
    lagData.lagMembers.forEach(member => {
      let portInterfaceName: (string | undefined)
      for (let ifName in portSettings?.[serialNumber]) {
        if (portSettings?.[serialNumber][ifName][0].id === member.portId) {
          portInterfaceName = ifName
        }
      }

      const isUnconfigPort = _.get(portSettings, serialNumber)
        ?.[member.portId]?.[0]?.portType === EdgePortTypeEnum.UNCONFIGURED

      if (!isUnconfigPort && portInterfaceName) {
        const data = {
          ...(_.get(portSettings, [serialNumber, portInterfaceName, '0'])),
          ...edgePhysicalPortInitialConfigs
        }

        // update Form.List need to use setFieldValue
        form.setFieldValue(['portSettings', serialNumber, portInterfaceName], [data])
      }
    })

  }

  const handleEdit = async (serialNumber: string, lagData: EdgeLag) => {
    const targetLagSettings = value?.find(item => item.serialNumber === serialNumber)
    onChange?.([
      ...(value?.filter(item => item.serialNumber !== serialNumber) ?? []),
      {
        serialNumber,
        lags: [...(targetLagSettings?.lags.filter(item => item.id !== lagData.id) ?? []), lagData]
      }
    ])
  }

  const handleDelete = async (serialNumber: string, id: string) => {
    const targetLagSettings = value?.find(item => item.serialNumber === serialNumber)
    onChange?.([
      ...(value?.filter(item => item.serialNumber !== serialNumber) ?? []),
      {
        serialNumber,
        lags: targetLagSettings?.lags.filter(item => item.id !== Number(id))
      }
    ])
  }

  return (
    <NodesTabs
      nodeList={clusterInfo?.edgeList}
      content={
        (serialNumber) => (
          <EdgeLagTable
            clusterId={clusterInfo?.clusterId}
            serialNumber={serialNumber}
            lagList={value?.find(item => item.serialNumber === serialNumber)?.lags}
            portList={
              portSettings?.[serialNumber] ?
                Object.values(portSettings?.[serialNumber]).flat() :
                []
            }
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      }
    />
  )
}