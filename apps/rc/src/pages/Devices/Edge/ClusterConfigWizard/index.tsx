import { useIntl } from 'react-intl'

import { Button, PageHeader, PageNotFound } from '@acx-ui/components'
import { CommonCategory, Device, genUrl }   from '@acx-ui/rc/utils'
import { TenantLink, useParams }            from '@acx-ui/react-router-dom'
import { filterByAccess }                   from '@acx-ui/user'

import { ClusterConfigWizardDataProvider } from './ClusterConfigWizardDataProvider'
import { ClusterInterfaceSettings }        from './ClusterInterfaceSettings'
import { InterfaceSettings }               from './InterfaceSettings'
import { SelectType }                      from './SelectType'
import { SubInterfaceSettings }            from './SubInterfaceSettings'

const contentMapping = {
  interface: <InterfaceSettings />,
  subInterface: <SubInterfaceSettings />,
  clusterInterface: <ClusterInterfaceSettings />
}

const ClusterConfigWizard = () => {
  const { clusterId, settingType } = useParams()

  return <ClusterConfigWizardDataProvider clusterId={clusterId}>
    {
      settingType
        ? <SelectedContent />
        : <SelectType />
    }
  </ClusterConfigWizardDataProvider>
}

const SelectedContent = () => {
  const { settingType, clusterId } = useParams()
  const { $t } = useIntl()

  const activeContent = contentMapping[settingType as keyof typeof contentMapping ]

  return activeContent ?
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Cluster & SmartEdge Configuration Wizard' })}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'SmartEdges' }),
            link: '/devices/edge'
          }
        ]}
        extra={filterByAccess([
          <TenantLink to={genUrl([
            CommonCategory.Device,
            Device.EdgeCluster,
          clusterId!,
          'configure'
          ])}>
            <Button type='default'>{ $t({ defaultMessage: 'Back to Cards' }) }</Button>
          </TenantLink>
        ])}
      />
      {activeContent}
    </> : <PageNotFound />
}

export default ClusterConfigWizard