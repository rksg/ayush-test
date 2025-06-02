import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import { ApCompatibility, Compatibility } from '@acx-ui/rc/utils'

import { ApCompatibilityType, InCompatibilityFeatures } from '../constants'

import { ApModelCompatibilityDrawer } from './ApModelCompatibilityDrawer'
import { OldApCompatibilityDrawer }   from './OldApCompatibilityDrawer'

export type ApCompatibilityDrawerProps = {
    visible: boolean,
    type?: ApCompatibilityType,
    isMultiple?: boolean,
    isRequirement?: boolean,
    venueId?: string,
    venueName?: string,
    networkId?: string,
    apName?: string,
    featureNames?: InCompatibilityFeatures[],
    networkIds?: string[],
    apIds?: string[],
    venueIds?: string[],
    data?: Compatibility[] | ApCompatibility[],
    onClose: () => void
  }


export const ApCompatibilityDrawer = (props: ApCompatibilityDrawerProps) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)

  return (
    isApCompatibilitiesByModel ?
      <ApModelCompatibilityDrawer {...props} /> :
      <OldApCompatibilityDrawer {...props} />
  )
}