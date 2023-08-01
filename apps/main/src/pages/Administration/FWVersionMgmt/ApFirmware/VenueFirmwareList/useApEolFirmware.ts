
import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'

import { useGetAvailableABFListQuery }              from '@acx-ui/rc/services'
import { ABFVersion, EolApFirmware, FirmwareVenue } from '@acx-ui/rc/utils'
import { getIntl }                                  from '@acx-ui/utils'

import { compareVersions, getVersionLabel, isBetaFirmware } from '../../FirmwareUtils'

type MaxEolABFVersionEntity = {
  maxVersion: string,
  isAllTheSame: boolean,
  latestVersion: string,
}
type MaxEolABFVersionMap = {
  [abfName: string]: MaxEolABFVersionEntity
}

export function useApEolFirmware () {
  const { releasedABFList, latestEolVersionByABFs } = useGetAvailableABFListQuery({}, {
    refetchOnMountOrArgChange: false,
    selectFromResult: ({ data }) => {
      return {
        releasedABFList: data,
        latestEolVersionByABFs: data
          ? _.uniqBy(data, 'abf')
            .filter(abfVersion => abfVersion.abf !== 'active')
            .sort((abfVersionA, abfVersionB) => -compareVersions(abfVersionA.id, abfVersionB.id))
          : []
      }
    }
  })
  const intl = getIntl()

  const compactEolApFirmwares = (selectedRows: FirmwareVenue[]): EolApFirmware[] => {
    return _.compact(selectedRows.map(row => row.eolApFirmwares)).flat()
  }

  const findMaxEolABFVersion = (selectedRows: FirmwareVenue[]): MaxEolABFVersionMap => {
    const eolFirmwares = compactEolApFirmwares(selectedRows)
    let result: MaxEolABFVersionMap = {}

    eolFirmwares.forEach((eol: EolApFirmware) => {
      if (result.hasOwnProperty(eol.name)) {
        const current = result[eol.name]
        const comparedResult = compareVersions(current.maxVersion, eol.currentEolVersion)

        result[eol.name] = {
          maxVersion: comparedResult >= 0 ? current.maxVersion : eol.currentEolVersion,
          isAllTheSame: current.isAllTheSame && comparedResult === 0,
          latestVersion: eol.latestEolVersion
        }
      } else {
        result[eol.name] = {
          maxVersion: eol.currentEolVersion,
          isAllTheSame: true,
          latestVersion: eol.latestEolVersion
        }
      }
    })

    return result
  }

  // eslint-disable-next-line max-len
  const canABFVersionDisplay = (maxEolABFVersionEntity: MaxEolABFVersionEntity, abfVersion: string): boolean => {
    const comparedResult = compareVersions(abfVersion, maxEolABFVersionEntity.maxVersion)
    return (abfVersion !== maxEolABFVersionEntity.latestVersion)
      && ((comparedResult > 0) || (comparedResult === 0 && !maxEolABFVersionEntity.isAllTheSame))
  }

  // eslint-disable-next-line max-len
  const getEolABFOtherVersionsOptions = (selectedRows: FirmwareVenue[]): { [abfName: string]: DefaultOptionType[] } => {
    if (!releasedABFList) return {}

    const maxEolABFVersionMap = findMaxEolABFVersion(selectedRows)
    let result: { [abfName: string]: DefaultOptionType[] } = {}

    releasedABFList
      .filter((abfVersion: ABFVersion) => {
        if (abfVersion.abf === 'active') return false

        const maxEolABFVersion = maxEolABFVersionMap[abfVersion.abf]

        return !maxEolABFVersion || canABFVersionDisplay(maxEolABFVersion, abfVersion.id)
      })
      .forEach((abfVersion: ABFVersion) => {
        const option = {
          label: getVersionLabel(intl, abfVersion, isBetaFirmware(abfVersion.category)),
          value: abfVersion.id
        }

        if (result.hasOwnProperty(abfVersion.abf)) {
          result[abfVersion.abf].push(option)
        } else {
          result[abfVersion.abf] = [option]
        }
      })

    return result
  }

  const getAvailableEolApFirmwares = (selectedRows?: FirmwareVenue[]): EolApFirmware[] => {
    if (!selectedRows || selectedRows.length === 0) return []

    const selectedEolApFirmwares = compactEolApFirmwares(selectedRows)
    // eslint-disable-next-line max-len
    const uniqueEolApFirmwares = selectedEolApFirmwares.reduce((acc: EolApFirmware[], cur: EolApFirmware) => {
      if (cur.currentEolVersion === cur.latestEolVersion) return acc //ACX-33594 Ignore the EOL firmware if it is already upgraded to the latest one

      let currentEol = { ...cur }
      const foundIndex = acc.findIndex(eol => eol.name === currentEol.name)
      if (foundIndex === -1) {
        acc.push(currentEol)
      } else {
        acc[foundIndex].apModels = _.uniq(acc[foundIndex].apModels.concat(currentEol.apModels))
      }

      return acc
    }, [])

    uniqueEolApFirmwares.sort((a, b) => {
      return -compareVersions(a.latestEolVersion, b.latestEolVersion)
    })

    return uniqueEolApFirmwares
  }

  // eslint-disable-next-line max-len
  const getGreaterABFVersionList = (abfVersionList: ABFVersion[], abfName: string, eolVersion: string) => {
    return abfVersionList.filter(abfVersion => {
      return abfVersion.abf === abfName && compareVersions(abfVersion.id, eolVersion) > 0
    })
  }

  const canUpdateEolApFirmware = (selectedRows?: FirmwareVenue[]): boolean => {
    if (!selectedRows || !releasedABFList) return false

    return compactEolApFirmwares(selectedRows).some((eolApFirmware: EolApFirmware) => {
      if (eolApFirmware.currentEolVersion === eolApFirmware.latestEolVersion) return false

      // eslint-disable-next-line max-len
      return getGreaterABFVersionList(releasedABFList, eolApFirmware.name, eolApFirmware.currentEolVersion).length > 0
    })
  }

  const getDefaultEolVersionLabel = (eolVersion: string): string => {
    if (!releasedABFList) return ''

    const target = releasedABFList.find(abf => abf.id === eolVersion)

    return target ? getVersionLabel(intl, target) : ''
  }

  return {
    getAvailableEolApFirmwares,
    getEolABFOtherVersionsOptions,
    canUpdateEolApFirmware,
    getDefaultEolVersionLabel,
    latestEolVersionByABFs
  }
}
