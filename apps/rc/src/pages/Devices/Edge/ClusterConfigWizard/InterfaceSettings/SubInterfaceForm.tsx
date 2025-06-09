import { useContext, useMemo } from 'react'

import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { useStepFormContext }                         from '@acx-ui/components'
import { Features }                                   from '@acx-ui/feature-toggle'
import { NodesTabs, TypeForm, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { validateEdgeClusterLevelGateway }            from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'
import { SubInterfaceSettingsForm }   from '../SubInterfaceSettings/SubInterfaceSettingsForm'

import { StyledHiddenFormItem }              from './styledComponents'
import { InterfaceSettingsFormType }         from './types'
import { getAllInterfaceAsPortInfoFromForm } from './utils'

export const SubInterfaceForm = () => {
  const { $t } = useIntl()

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'Sub-interface Settings' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Create and configure the sub-interfaces
        for all Edges in this cluster:` })}
    </Typography.Text>
  </Space>

  const content = <SubInterfaceSettingView />

  return <TypeForm
    header={header}
    content={content}
  />
}

const SubInterfaceSettingView = () => {
  const {
    clusterInfo,
    clusterNetworkSettings,
    isSupportAccessPort
  } = useContext(ClusterConfigWizardContext)
  const { form } = useStepFormContext()
  const isDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)

  // eslint-disable-next-line max-len
  const portSettings = form.getFieldValue('portSettings') as InterfaceSettingsFormType['portSettings']
  const lagSettings = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
  // eslint-disable-next-line max-len
  const portSubInterfaceSettings = form.getFieldValue('portSubInterfaces') as InterfaceSettingsFormType['portSubInterfaces']
  // eslint-disable-next-line max-len
  const lagSubInterfaceSettings = form.getFieldValue('lagSubInterfaces') as InterfaceSettingsFormType['lagSubInterfaces']
  const allInterface = getAllInterfaceAsPortInfoFromForm(form)

  const {
    allPortsData,
    allLagsData,
    allSubInterfaceData
  } = useMemo(() => {
    // eslint-disable-next-line max-len
    const allPortsData = portSettings?Object.values(portSettings).flatMap(port => Object.values(port)).flat():[]
    const allLagsData = lagSettings?.flatMap(lag => lag.lags) ?? []
    // eslint-disable-next-line max-len
    const allLagMemberIds = allLagsData.flatMap(lag => lag.lagMembers.map(member => member.portId))
    const allPortSubInterfaceValues = portSubInterfaceSettings ?
      Object.values(portSubInterfaceSettings)
        .flatMap(subInterfaceData => Object.entries(subInterfaceData)
          .flatMap(([portId, subInterfaces]) => {
            return allLagMemberIds.includes(portId) ? [] : subInterfaces
          })): []
    const allLagSubInterfaceValues = lagSubInterfaceSettings ?
      Object.values(lagSubInterfaceSettings)
        .flatMap(subInterfaceData => Object.values(subInterfaceData))
        .flat() : []
    const allSubInterfaceData = allPortSubInterfaceValues.concat(allLagSubInterfaceValues)
    return {
      allPortsData,
      allLagsData,
      allSubInterfaceData
    }
  }, [portSettings, lagSettings, portSubInterfaceSettings, lagSubInterfaceSettings])

  return <>
    <StyledHiddenFormItem
      name='clusterGatewayValidate'
      rules={[
        { validator: () => {
          return validateEdgeClusterLevelGateway(
            allPortsData, allLagsData, allSubInterfaceData,
            clusterInfo?.edgeList ?? [], isDualWanEnabled, isEdgeCoreAccessSeparationReady
          )
        } }
      ]}
      children={<input hidden/>}
    />
    <NodesTabs
      nodeList={clusterInfo?.edgeList}
      content={(serialNumber) => (
        <SubInterfaceSettingsForm
          serialNumber={serialNumber}
          ports={clusterNetworkSettings?.portSettings
            ?.find(settings => settings.serialNumber === serialNumber)
            ?.ports ?? []
          }
          portStatus={allInterface[serialNumber]?.filter(item => !item.isLag)}
          lagStatus={allInterface[serialNumber]?.filter(item => item.isLag)}
          isSupportAccessPort={isSupportAccessPort}
        />
      )}
    />
  </>
}
