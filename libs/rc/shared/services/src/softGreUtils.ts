import { cloneDeep } from 'lodash'

import {
  SoftGreViewData,
  SoftGreActivation
} from '@acx-ui/rc/utils'

const SPECIFIC_NETWORK_ID = 'usedByVenueApActivation'

const consolidateActivations = (
  profile: SoftGreViewData,
  venueId: string
):SoftGreActivation[] => {

  let finalActivations = cloneDeep(profile.activations ?? [])

  const isExistVenueActivation = profile.venueActivations?.some(v => v.venueId === venueId) || false
  const isExistApActivation = profile.apActivations?.some(a => a.venueId === venueId) || false

  if (!isExistVenueActivation && !isExistApActivation) {
    return finalActivations
  }

  const existingActivation = finalActivations.some(va => va.venueId === venueId)

  if (existingActivation) {
    finalActivations.forEach(activation => {
      if (activation.venueId === venueId) {
        activation.wifiNetworkIds.push(SPECIFIC_NETWORK_ID)
      }
    })
    return finalActivations
  }

  const newActivation: SoftGreActivation = {
    venueId: venueId,
    wifiNetworkIds: [SPECIFIC_NETWORK_ID]
  }

  return [...finalActivations, newActivation]
}

export default consolidateActivations