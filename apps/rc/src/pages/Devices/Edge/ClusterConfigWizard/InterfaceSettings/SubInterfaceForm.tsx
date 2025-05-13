import { useContext } from 'react'

import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { useStepFormContext }  from '@acx-ui/components'
import { NodesTabs, TypeForm } from '@acx-ui/rc/components'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'
import { SubInterfaceSettingsForm }   from '../SubInterfaceSettings/SubInterfaceSettingsForm'

import { getAllInterfaceAsPortInfoFromForm } from './utils'

export const SubInterfaceForm = () => {
  const { $t } = useIntl()
  const {
    clusterInfo,
    clusterNetworkSettings
  } = useContext(ClusterConfigWizardContext)
  const { form } = useStepFormContext()

  const allInterface = getAllInterfaceAsPortInfoFromForm(form)

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'Sub-interface Settings' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Create and configure the sub-interfaces
        for all Edges in this cluster:` })}
    </Typography.Text>
  </Space>

  const content = <NodesTabs
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
      />
    )}
  />

  return <TypeForm
    header={header}
    content={content}
  />
}
