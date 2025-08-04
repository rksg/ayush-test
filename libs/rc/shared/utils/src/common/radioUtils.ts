/* eslint-disable max-len */
import { isEmpty, omit } from 'lodash'
import { useIntl }       from 'react-intl'

import { TierFeatures, useIsTierAllowed } from '@acx-ui/feature-toggle'

import { ExternalAntenna }            from '../models'
import { VenueApAntennaTypeSettings } from '../types'

export function useSupportedApModelTooltip () {
  const { $t } = useIntl()
  const ap70BetaFlag = useIsTierAllowed(TierFeatures.AP_70)

  return ap70BetaFlag ?
    $t({ defaultMessage: 'These settings apply only to AP models that support tri-band, such as R770, R760 and R560' }) :
    $t({ defaultMessage: 'These settings apply only to AP models that support tri-band, such as R760 and R560' })
}

export function getExternalAntennaPayload (apModels: { [index: string]: ExternalAntenna }) {
  function cleanExtModel (model: ExternalAntenna) {
    let data = JSON.parse(JSON.stringify(model))

    if (data.enable24G !== undefined && data.enable24G === false) {
      delete data.gain24G
    }
    if (data.enable50G !== undefined && data.enable50G === false) {
      delete data.gain50G
    }
    return data
  }
  const extPayload = [] as ExternalAntenna[]
  Object.keys(apModels).forEach(key => {
    const model = cleanExtModel(apModels[key] as ExternalAntenna)
    extPayload.push(model)
  })
  return extPayload
}

// eslint-disable-next-line max-len
export function getAntennaTypePayload (antTypeModels: { [index: string]: VenueApAntennaTypeSettings }) {
  return isEmpty(antTypeModels)? [] : Object.values(antTypeModels)
}

export function cleanExtModel (model: ExternalAntenna) {
  let data = JSON.parse(JSON.stringify(model))
  const removeFields = ['coupled', 'supportDisable', 'model']
  if (!data.enable24G) {
    removeFields.push('gain24G')
  }
  if (!data.enable50G) {
    removeFields.push('gain50G')
  }
  data = omit(data, removeFields)
  return data
}
