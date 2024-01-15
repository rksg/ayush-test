import { useIntl } from 'react-intl'

import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { useGetApModelFamiliesQuery } from '@acx-ui/rc/services'
import { ApModelFamilyType }          from '@acx-ui/rc/utils'

interface Wifi66eToWifi7OnlyFwVersionInfoProps {
  targetVenueVersion: string
  apModel: string
  apFirmwareVersion: string
}

export function Wifi66eToWifi7OnlyFwVersionInfo (props: Wifi66eToWifi7OnlyFwVersionInfoProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const isBranchLevelSupportedModelsEnabled = useIsSplitOn(Features.WIFI_EDA_BRANCH_LEVEL_SUPPORTED_MODELS_TOGGLE)
  const { targetVenueVersion, apModel, apFirmwareVersion } = props
  const { modelToFamilyMap } = useGetApModelFamiliesQuery({}, {
    skip: !isBranchLevelSupportedModelsEnabled,
    refetchOnMountOrArgChange: false,
    selectFromResult: ({ data }) => ({
      // eslint-disable-next-line max-len
      modelToFamilyMap: (data ?? []).reduce((result: { [key: string]: ApModelFamilyType }, item) => {
        item.apModels.forEach(apModel => result[apModel] = item.name)
        return result
      }, {})
    })
  })

  if (!isBranchLevelSupportedModelsEnabled || !modelToFamilyMap) return null
  if (![ApModelFamilyType.WIFI_6, ApModelFamilyType.WIFI_6E].includes(modelToFamilyMap[apModel])) {
    return null
  }
  // FIXME: only check if the version is from 7.0.0..104.xxx to 7.0.0.103.xxx, this condition currently hardcoded and needs enhancement later
  if (!apFirmwareVersion.startsWith('7.0.0.104') || !targetVenueVersion.startsWith('7.0.0.103')) {
    return null
  }

  return <span>{
    // eslint-disable-next-line max-len
    $t({ defaultMessage: '{apModel} may not be compatible with the venue\'s version.' }, { apModel })
  }</span>
}
