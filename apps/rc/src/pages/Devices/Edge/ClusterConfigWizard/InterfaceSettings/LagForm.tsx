import { useContext, useEffect, useMemo } from 'react'

import { Form, Space, Typography } from 'antd'
import { omit, get, isNil }        from 'lodash'
import { useIntl }                 from 'react-intl'

import { useStepFormContext }                from '@acx-ui/components'
import { Features }                          from '@acx-ui/feature-toggle'
import { EdgeLagTable, NodesTabs, TypeForm } from '@acx-ui/rc/components'
import {
  EdgeLag, EdgePortTypeEnum, SubInterface,
  edgePhysicalPortInitialConfigs,
  validateEdgeAllPortsEmptyLag,
  natPoolRangeClusterLevelValidator,
  useIsEdgeFeatureReady,
  getMergedLagTableDataFromLagForm,
  edgeWanSyncIpModeValidator,
  getEdgeWanInterfaces,
  EdgePort
} from '@acx-ui/rc/utils'
import { EdgeScopes } from '@acx-ui/types'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import * as UI                                                            from './styledComponents'
import { InterfaceSettingFormStepCommonProps, InterfaceSettingsFormType } from './types'
import { getAllPhysicalInterfaceFormData }                                from './utils'

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
  const { value: lagSettings, onChange } = props
  const isMultiNatIpEnabled = useIsEdgeFeatureReady(Features.EDGE_MULTI_NAT_IP_TOGGLE)
  const isEdgeDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  const {
    clusterInfo, isSupportAccessPort, clusterNetworkSettings
  } = useContext(ClusterConfigWizardContext)
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

  const allSubInterfaceMap = useMemo(() => {
    const subInterfaceMap = {} as {
      [serialNumber: string]: {
        portSubInterface?: { [portId: string]: SubInterface[] }
        lagSubInterface?: { [lagId: string]: SubInterface[] }
      }
    }
    Object.entries(portSubInterfaces ?? {}).forEach(([serialNumber, portSubInterface]) => {
      subInterfaceMap[serialNumber] = { portSubInterface }
    })
    Object.entries(lagSubInterfaces ?? {}).forEach(([serialNumber, lagSubInterface]) => {
      subInterfaceMap[serialNumber] = { ...subInterfaceMap[serialNumber], lagSubInterface }
    })
    return subInterfaceMap
  }, [portSubInterfaces, lagSubInterfaces])

  const cleanupLagMemberPortConfig = (lagData: EdgeLag, serialNumber: string) => {
    // reset physical port config when it is selected as LAG member
    lagData.lagMembers.forEach(member => {
      let portInterfaceName: (string | undefined)
      for (let ifName in portSettings?.[serialNumber]) {
        if (portSettings?.[serialNumber][ifName][0].id === member.portId) {
          portInterfaceName = ifName
        }
      }

      const isUnconfigPort = get(portSettings, serialNumber)
        ?.[member.portId]?.[0]?.portType === EdgePortTypeEnum.UNCONFIGURED

      if (!isUnconfigPort && portInterfaceName) {
        const data = {
          ...(get(portSettings, [serialNumber, portInterfaceName, '0'])),
          ...edgePhysicalPortInitialConfigs
        }

        // update Form.List need to use setFieldValue
        form.setFieldValue(['portSettings', serialNumber, portInterfaceName], [data])
      }
    })
  }

  const deleteLagSubInterface = (serialNumber: string, lagId: string) => {
    // should also delete the lag sub interface
    const updatedLagSubInterfaces = omit(lagSubInterfaces?.[serialNumber], lagId)

    // update Form.List need to use setFieldValue
    form.setFieldValue(['lagSubInterfaces', serialNumber], updatedLagSubInterfaces)
  }

  const handleAdd = async (serialNumber: string, lagData: EdgeLag) => {
    const targetLagSettings = lagSettings?.find(item => item.serialNumber === serialNumber)
    onChange?.([
      ...(lagSettings?.filter(item => item.serialNumber !== serialNumber) ?? []),
      {
        serialNumber,
        lags: [...(targetLagSettings?.lags ?? []), lagData]
      }
    ])

    // reset physical port config when it is selected as LAG member
    cleanupLagMemberPortConfig(lagData, serialNumber)
  }

  const handleEdit = async (serialNumber: string, lagData: EdgeLag) => {
    const targetLagSettings = lagSettings?.find(item => item.serialNumber === serialNumber)
    onChange?.([
      ...(lagSettings?.filter(item => item.serialNumber !== serialNumber) ?? []),
      {
        serialNumber,
        lags: [...(targetLagSettings?.lags.filter(item => item.id !== lagData.id) ?? []), lagData]
      }
    ])

    // reset physical port config when it is selected as LAG member
    cleanupLagMemberPortConfig(lagData, serialNumber)
  }

  const handleDelete = async (serialNumber: string, lagId: string) => {
    const targetLagSettings = lagSettings?.find(item => item.serialNumber === serialNumber)

    onChange?.([
      ...(lagSettings?.filter(item => item.serialNumber !== serialNumber) ?? []),
      {
        serialNumber,
        lags: targetLagSettings?.lags.filter(item => item.id !== Number(lagId))
      }
    ])

    deleteLagSubInterface(serialNumber, lagId)
  }

  return (
    <NodesTabs
      nodeList={clusterInfo?.edgeList}
      content={
        (serialNumber) => {
          const lagList = lagSettings?.find(item => item.serialNumber === serialNumber)?.lags
          const portList = portSettings?.[serialNumber]
            ? Object.values(portSettings?.[serialNumber]).flat()
            : []
          // eslint-disable-next-line max-len
          const lagMemberIds = lagList?.map(lag => lag.lagMembers.map(member => member.portId)).flat()
          // eslint-disable-next-line max-len
          const portSubInterfaceList = Object.entries(allSubInterfaceMap?.[serialNumber]?.portSubInterface ?? {})
            .flatMap(([portId, subInterfaceList]) => {
              return lagMemberIds?.includes(portId) ? [] : subInterfaceList
            })
          // eslint-disable-next-line max-len
          const lagSubInterfaceList = Object.entries(allSubInterfaceMap?.[serialNumber]?.lagSubInterface ?? {})
            .flatMap(([lagId, subInterfaceList]) => {
              return lagList?.some(lag => String(lag.id) === lagId) ? subInterfaceList : []
            })
          const allSubInterface = portSubInterfaceList.concat(lagSubInterfaceList)
          // eslint-disable-next-line max-len
          const originalPortData = clusterNetworkSettings?.portSettings.find(item => item.serialNumber === serialNumber)?.ports
          // eslint-disable-next-line max-len
          const originalLagData = clusterNetworkSettings?.lagSettings.find(item => item.serialNumber === serialNumber)?.lags

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
              isSupportAccessPort={isSupportAccessPort}
              formFieldsProps={{
                natStartIp: {
                  rules: isMultiNatIpEnabled
                    ? [{ validator: (_, currentData: EdgeLag) => {
                      // eslint-disable-next-line max-len
                      const { ports: allPortsData, lags: allLagsData } = getAllPhysicalInterfaceFormData(form)

                      // eslint-disable-next-line max-len
                      const mergedData = getMergedLagTableDataFromLagForm(allLagsData[serialNumber], currentData as EdgeLag)
                      allLagsData[serialNumber] = mergedData

                      // eslint-disable-next-line max-len
                      return natPoolRangeClusterLevelValidator(allPortsData, allLagsData, clusterInfo?.edgeList)
                    } }] : []
                }
              }}
              originalInterfaceData={{
                portSettings: originalPortData,
                lagSettings: originalLagData
              }}
            />
            <Form.Item
              name='multiWanIpModeCheck'
              rules={[
                ...(isEdgeDualWanEnabled
                  ? [{ validator: () => {
                    // only check when all WAN is LAG
                    const allWans = getEdgeWanInterfaces(portList, lagList)
                    // eslint-disable-next-line max-len
                    const isAllLagWan = allWans.every((wan: EdgePort | EdgeLag) => !isNil((wan as EdgeLag).lagEnabled))
                    if (!isAllLagWan) return Promise.resolve()

                    return edgeWanSyncIpModeValidator(portList ?? [], lagList ?? [])
                  } }]
                  : [])
              ]}
              children={<></>}
            />
          </>
        }
      }
    />
  )
}