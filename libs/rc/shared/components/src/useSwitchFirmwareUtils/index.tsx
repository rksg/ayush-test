import { IntlShape } from 'react-intl'

import {
  useGetSwitchCurrentVersionsQuery
} from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
  FirmwareVersion,
  convertSwitchVersionFormat,
  firmwareTypeTrans
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export function useSwitchFirmwareUtils () {
  const switchVersions = useGetSwitchCurrentVersionsQuery({ params: useParams() })

  // const { parseSwitchVersion } = useSwitchFirmwareUtils()
  const parseSwitchVersion = (version: string) => {
    const defaultVersion = switchVersions?.data?.generalVersions

    if (defaultVersion?.includes(version)) {
      return convertSwitchVersionFormat(version.replace(/_[^_]*$/, ''))
    }
    return convertSwitchVersionFormat(version)
  }
  // const { getSwitchVersionLabel } = useSwitchFirmwareUtils()
  const getSwitchVersionLabel = (intl: IntlShape, version: FirmwareVersion): string => {
    const transform = firmwareTypeTrans(intl.$t)
    const versionName = parseSwitchVersion(version?.name)
    const versionType = transform(version?.category)

    let displayVersion = `${versionName} (${versionType})`
    if(version.inUse){
      // eslint-disable-next-line max-len
      displayVersion = `${displayVersion} - ${intl.$t({ defaultMessage: 'Selected Venues are already on this release' })}`
    }
    return displayVersion
  }

  // const { getSwitchNextScheduleTplTooltip } = useSwitchFirmwareUtils()
  const getSwitchNextScheduleTplTooltip = (venue: FirmwareSwitchVenue): string | undefined => {
    if (venue.nextSchedule) {
      const versionName = venue.nextSchedule.version?.name
      const versionAboveTenName = venue.nextSchedule.versionAboveTen?.name
      let names = []

      if (versionName) {
        names.push(parseSwitchVersion(versionName))
      }

      if (versionAboveTenName) {
        names.push(parseSwitchVersion(versionAboveTenName))
      }
      return names.join(', ')
    }
    return ''
  }



  return {
    parseSwitchVersion,
    getSwitchVersionLabel,
    getSwitchNextScheduleTplTooltip
  }
}
