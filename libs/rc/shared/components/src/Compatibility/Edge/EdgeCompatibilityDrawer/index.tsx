import { useIntl } from 'react-intl'

import {
  CompatibilityDeviceEnum,
  CompatibilityType,
  EntityCompatibility,
  EntityCompatibilityV1_1,
  IncompatibilityFeatures
} from '@acx-ui/rc/utils'

import {
  useEdgeCompatibilityRequirementData,
  useVenueEdgeCompatibilitiesData
} from '../../../useEdgeActions/compatibility'
import { CompatibilityDrawer }           from '../../CompatibilityDrawer'
import { EdgeDetailCompatibilityDrawer } from '../EdgeDetailCompatibilityDrawer'

export enum EdgeCompatibilityType {
  DEVICE = 'Device',
  VENUE = 'Venue',
  ALONE = 'ALONE',
}

export type EdgeCompatibilityDrawerProps = {
  visible: boolean,
  onClose: () => void
  title?: string,
  type?: EdgeCompatibilityType,
  venueId?: string,
  venueName?: string,
  featureName?: IncompatibilityFeatures,
  edgeId?: string,
  serviceId?: string,
  data?: EntityCompatibility[] | EntityCompatibilityV1_1[],
  width?: number
}

export const EdgeCompatibilityDrawer = (props: EdgeCompatibilityDrawerProps) => {
  const { $t } = useIntl()
  const {
    visible,
    title,
    type = EdgeCompatibilityType.VENUE,
    venueId, venueName,
    featureName,
    onClose,
    width
  } = props

  // eslint-disable-next-line max-len
  const skipFetchCompatibilities = !visible || (type !== EdgeCompatibilityType.VENUE && type !== EdgeCompatibilityType.DEVICE)
  const {
    edgeCompatibilities, isLoading
  } = useVenueEdgeCompatibilitiesData(props, skipFetchCompatibilities)

  const skipFetchFeatureInfo = !visible || type !== EdgeCompatibilityType.ALONE || !featureName
  const {
    featureInfos,
    isLoading: isFeatureInfoLoading
  } = useEdgeCompatibilityRequirementData(featureName!, skipFetchFeatureInfo)

  return type === EdgeCompatibilityType.VENUE || type === EdgeCompatibilityType.DEVICE
    ? <CompatibilityDrawer
      data-testid={'edge-compatibility-drawer'}
      visible={visible}
      title={title ?? ''}
      compatibilityType={type === EdgeCompatibilityType.DEVICE
        ? CompatibilityType.DEVICE
        : (featureName ? CompatibilityType.FEATURE : CompatibilityType.VENUE)
      }
      data={edgeCompatibilities ?? []}
      onClose={onClose}
      isLoading={isLoading}
      deviceType={CompatibilityDeviceEnum.EDGE}

      venueId={venueId}
      venueName={venueName}
      featureName={featureName}
      width={width}
    />
    // type === EdgeCompatibilityType.ALONE
    : <EdgeDetailCompatibilityDrawer
      visible={visible}
      featureName={featureName!}
      title={type === EdgeCompatibilityType.ALONE
        ? $t({ defaultMessage: 'Compatibility Requirement' })
        : $t({ defaultMessage: 'Incompatibility Details' })
      }
      isLoading={isFeatureInfoLoading}
      data={featureInfos}
      onClose={onClose}
    />
}