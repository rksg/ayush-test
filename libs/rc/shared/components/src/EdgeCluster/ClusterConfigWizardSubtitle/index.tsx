import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { ClusterHighAvailabilityModeEnum, EdgeClusterStatus } from '@acx-ui/rc/utils'

import { SubTitle1 } from './styledComponents'

interface ClusterConfigWizardSubtitleProps {
  clusterInfo: EdgeClusterStatus | undefined;
}

export const ClusterConfigWizardSubtitle = ({
  clusterInfo
}: ClusterConfigWizardSubtitleProps) => {
  const { $t } = useIntl()

  const getHaModeDisplayStr = (highAvailabilityMode?: ClusterHighAvailabilityModeEnum) => {
    switch(highAvailabilityMode) {
      case ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE:
        return $t({ defaultMessage: '(Active-Active HA mode)' })
      case ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY:
      default:
        return $t({ defaultMessage: '(Active-Standby HA mode)' })
    }
  }

  return (
    <Space>
      <SubTitle1>{$t({ defaultMessage: 'Cluster: ' })}</SubTitle1>
      {
        $t({ defaultMessage: '{clusterName} {haMode}' },
          {
            clusterName: clusterInfo?.name,
            haMode: getHaModeDisplayStr(clusterInfo?.highAvailabilityMode)
          }
        )
      }
    </Space>
  )
}
