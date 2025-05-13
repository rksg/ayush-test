import { useContext, useEffect, useMemo } from 'react'

import { Form, Space, Typography } from 'antd'
import _                           from 'lodash'
import { useIntl }                 from 'react-intl'

import { useStepFormContext }                                                                      from '@acx-ui/components'
import { EdgeLagTable, NodesTabs, TypeForm }                                                       from '@acx-ui/rc/components'
import { EdgeLag, EdgePortTypeEnum, edgePhysicalPortInitialConfigs, validateEdgeAllPortsEmptyLag } from '@acx-ui/rc/utils'
import { EdgeScopes }                                                                              from '@acx-ui/types'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import * as UI                                                            from './styledComponents'
import { InterfaceSettingFormStepCommonProps, InterfaceSettingsFormType } from './types'

export const LagForm = ({ onInit }: InterfaceSettingFormStepCommonProps) => {
  const { $t } = useIntl()

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'LAG Settings' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Create and configure the LAG for all RUCKUS Edges in this cluster 
      if needed, or click 'Next' to skip:` })}
    </Typography.Text>
  </Space>

  const content = <Form.Item
    name='lagSettings'
    children={<LagSettingView />}
  />

  useEffect(() => onInit?.(), [onInit])

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
  const vipConfig = form.getFieldValue('vipConfig') as InterfaceSettingsFormType['vipConfig']
  const timeout = form.getFieldValue('timeout')
  const vipConfigArr = vipConfig?.map(item => ({
    virtualIp: item.vip,
    ports: item.interfaces,
    timeoutSeconds: timeout
  }))
  // eslint-disable-next-line max-len
  const portSubInterfaces = form.getFieldValue('portSubInterfaces') as InterfaceSettingsFormType['portSubInterfaces']
  // eslint-disable-next-line max-len
  const lagSubInterfaces = form.getFieldValue('lagSubInterfaces') as InterfaceSettingsFormType['lagSubInterfaces']

  const allSubInterface = useMemo(() =>[
    ...Object.values(portSubInterfaces ?? {}).flat().flatMap(item => Object.values(item)).flat(),
    ...Object.values(lagSubInterfaces ?? {}).flat().flatMap(item => Object.values(item)).flat()
  ], [portSubInterfaces, lagSubInterfaces])

  const cleanupLagMemberPortConfig = (lagData: EdgeLag, serialNumber: string) => {
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
    cleanupLagMemberPortConfig(lagData, serialNumber)
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

    // reset physical port config when it is selected as LAG member
    cleanupLagMemberPortConfig(lagData, serialNumber)
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
        (serialNumber) => {
          const lagList = value?.find(item => item.serialNumber === serialNumber)?.lags
          const portList = portSettings?.[serialNumber]
            ? Object.values(portSettings?.[serialNumber]).flat()
            : []

          return <>
            <UI.StyledHiddenFormItem
              name='validate'
              rules={[
                { validator: () => {
                  return validateEdgeAllPortsEmptyLag(portList, lagList ?? [])
                } }
              ]}
              children={<input hidden/>}
            />
            <EdgeLagTable
              clusterId={clusterInfo?.clusterId}
              serialNumber={serialNumber}
              lagList={lagList}
              portList={portList}
              vipConfig={vipConfigArr}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              actionScopes={{
                add: [EdgeScopes.UPDATE],
                edit: [EdgeScopes.UPDATE],
                delete: [EdgeScopes.UPDATE]
              }}
              subInterfaceList={allSubInterface}
              isClusterWizard
              clusterInfo={clusterInfo!}
            />
          </>
        }
      }
    />
  )
}