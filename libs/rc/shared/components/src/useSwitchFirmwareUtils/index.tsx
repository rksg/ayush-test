import {
  useGetSwitchCurrentVersionsQuery
} from '@acx-ui/rc/services'
import {
  convertSwitchVersionFormat
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export function useSwitchFirmwareUtils () {
  const switchVersions = useGetSwitchCurrentVersionsQuery({ params: useParams() })


  const parseSwitchVersion = (version: string) => {
    const defaultVersion = switchVersions?.data?.generalVersions

    if (defaultVersion?.includes(version)) {
      return convertSwitchVersionFormat(version.replace(/_[^_]*$/, ''))
    }
    return convertSwitchVersionFormat(version)
  }


  return {
    parseSwitchVersion
  }
}
