import { useParams } from '@acx-ui/react-router-dom'

import { ClusterInterfaceSettings } from './ClusterInterfaceSettings'
import { InterfaceSettings }        from './InterfaceSettings'
import { SelectType }               from './SelectType'
import { SubInterfaceSettings }     from './SubInterfaceSettings'

const contentMapping = {
  interface: InterfaceSettings,
  subInterface: SubInterfaceSettings,
  clusterInterface: ClusterInterfaceSettings
}

const ClusterConfigWizard = () => {
  const { settingType } = useParams()

  const ActiveContent = settingType
    ? contentMapping[settingType as keyof typeof contentMapping ]
    : SelectType

  return ActiveContent && <ActiveContent />
}

export default ClusterConfigWizard