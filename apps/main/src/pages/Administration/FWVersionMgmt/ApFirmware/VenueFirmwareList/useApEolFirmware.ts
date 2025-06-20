
import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'

import {
  MaxABFVersionEntity,
  compactEolApFirmwares,
  compareABFSequence,
  compareVersions,
  findMaxEolABFVersions,
  getActiveApModels,
  getVersionLabel,
  isBetaFirmware
} from '@acx-ui/rc/components'
import { useGetApModelFamiliesQuery, useGetAvailableABFListQuery } from '@acx-ui/rc/services'
import {
  ABFVersion,
  ApModelFamilyType,
  EolApFirmware,
  FirmwareVenue,
  defaultApModelFamilyDisplayNames
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'


export type EolApFirmwareGroup = {
  name: string,
  latestEolVersion: string,
  apModels: string[],
  isUpgradable: boolean
}

export type UpgradableApModelsAndFamilies = {
  [abfName: string]: {
    familyNames: string[],
    apModels: string[],
    sequence?: number
  }
}

export function useApEolFirmware () {
  const intl = getIntl()

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
  const { modelToFamilyMap, apModelFamilyDisplayNames } = useGetApModelFamiliesQuery({}, {
    refetchOnMountOrArgChange: false,
    selectFromResult: ({ data }) => ({
      // eslint-disable-next-line max-len
      modelToFamilyMap: (data ?? []).reduce((result: Record<string, ApModelFamilyType>, item) => {
        item.apModels.forEach(apModel => result[apModel] = item.name)
        return result
      }, {}),
      // eslint-disable-next-line max-len
      apModelFamilyDisplayNames: (data ?? []).reduce((result: Record<ApModelFamilyType, string>, item) => {
        result[item.name] = item.displayName
        return result
      }, { ...defaultApModelFamilyDisplayNames })
    })
  })

  // eslint-disable-next-line max-len
  const getEolABFOtherVersionsOptions = (selectedRows: FirmwareVenue[]): { [abfName: string]: DefaultOptionType[] } => {
    if (!releasedABFList) return {}

    const maxEolABFVersionMap = findMaxEolABFVersions(selectedRows)
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

  // eslint-disable-next-line max-len
  const getAvailableEolApFirmwareGroups = (selectedRows?: FirmwareVenue[]): EolApFirmwareGroup[] => {
    if (!selectedRows || selectedRows.length === 0) return []

    const selectedEolApFirmwares = compactEolApFirmwares(selectedRows)
    // eslint-disable-next-line max-len
    const uniqueEolApFirmwares = selectedEolApFirmwares.reduce((acc: EolApFirmwareGroup[], cur: EolApFirmware) => {
      const currentEol = {
        ...cur,
        // ACX-33594 Disable the EOL firmware if it is already upgraded to the latest one
        // ACX-45424 Enable the EOL firmware when the ABF is greater than the current venue ABF, even if the ABF has been marked to the latest version
        // eslint-disable-next-line max-len
        isUpgradable: cur.currentEolVersion !== cur.latestEolVersion || cur.isAbfGreaterThanVenueCurrentAbf
      }
      const foundIndex = acc.findIndex(eol => eol.name === currentEol.name)
      if (foundIndex === -1) {
        acc.push(currentEol)
      } else {
        acc[foundIndex].apModels = _.uniq(acc[foundIndex].apModels.concat(currentEol.apModels))
        acc[foundIndex].isUpgradable = acc[foundIndex].isUpgradable || currentEol.isUpgradable
      }

      return acc
    }, [])

    uniqueEolApFirmwares.sort((a, b) => {
      return -compareVersions(a.latestEolVersion, b.latestEolVersion)
    })

    return uniqueEolApFirmwares
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

    return target ? getVersionLabel(intl, target, false) : ''
  }

  // eslint-disable-next-line max-len
  const findUpgradableApModelsAndFamilies = (targetVersions: string[], selectedRows: FirmwareVenue[]): UpgradableApModelsAndFamilies => {
    if (!releasedABFList || !modelToFamilyMap || targetVersions.length === 0) return {}

    const sortedTargetVersions = targetVersions.sort((v1, v2) => -compareVersions(v1, v2)) // Sort versions from high to low
    // eslint-disable-next-line max-len
    const allEolApModels = compactEolApFirmwares(selectedRows).flatMap((eolFw: EolApFirmware) => eolFw.apModels)
    const allActiveApModels = getActiveApModels(selectedRows)
    const allApModels = [...new Set([...allEolApModels, ...allActiveApModels])]
    const upgradableApModelAndFamilies: UpgradableApModelsAndFamilies = {}

    sortedTargetVersions.forEach(targetVersion => {
      const targetABFInfo = releasedABFList.find(abf => abf.id === targetVersion)

      if (!targetABFInfo?.supportedApModels) return

      const supportedApModels = targetABFInfo.supportedApModels.filter(apModel => {
        return _.remove(allApModels, (currentModel) => currentModel === apModel).length > 0
      })

      const existingData = upgradableApModelAndFamilies[targetABFInfo.abf]

      if (existingData) {
        existingData.apModels = [...new Set([...existingData.apModels, ...supportedApModels])]
      } else {
        upgradableApModelAndFamilies[targetABFInfo.abf] = {
          familyNames: [],
          apModels: supportedApModels,
          sequence: targetABFInfo.sequence
        }
      }
    })

    Object.keys(upgradableApModelAndFamilies).forEach(abf => {
      const target = upgradableApModelAndFamilies[abf]
      // eslint-disable-next-line max-len
      target.familyNames = [...new Set(target.apModels.map(model => apModelFamilyDisplayNames[modelToFamilyMap[model]]))]
    })

    return upgradableApModelAndFamilies
  }

  return {
    getAvailableEolApFirmwareGroups,
    getEolABFOtherVersionsOptions,
    canUpdateEolApFirmware,
    getDefaultEolVersionLabel,
    findUpgradableApModelsAndFamilies,
    latestEolVersionByABFs
  }
}

export function getRemainingApModels (
  currentAbfName: string,
  initialApModels: string[],
  upgradableApModelsAndFamilies?: UpgradableApModelsAndFamilies
): string[] {
  if (!upgradableApModelsAndFamilies) return initialApModels

  const currentAbfSequence = upgradableApModelsAndFamilies[currentAbfName]?.sequence
  let remainingModels = [...initialApModels]

  Object.keys(upgradableApModelsAndFamilies).forEach(existingAbfName => {
    const existingAbf = upgradableApModelsAndFamilies[existingAbfName]

    // eslint-disable-next-line max-len
    if (compareABFSequence(existingAbf.sequence, currentAbfSequence) > 0 && existingAbfName !== currentAbfName) {
      _.pull(remainingModels , ...existingAbf.apModels)
    }
  })

  return remainingModels
}

// eslint-disable-next-line max-len
function canABFVersionDisplay (maxEolABFVersionEntity: MaxABFVersionEntity, abfVersion: string): boolean {
  const comparedResult = compareVersions(abfVersion, maxEolABFVersionEntity.maxVersion)
  return (abfVersion !== maxEolABFVersionEntity.latestVersion)
    && ((comparedResult > 0) || (comparedResult === 0 && !maxEolABFVersionEntity.isAllTheSame))
}

// eslint-disable-next-line max-len
function getGreaterABFVersionList (abfVersionList: ABFVersion[], abfName: string, eolVersion: string) {
  return abfVersionList.filter(abfVersion => {
    return abfVersion.abf === abfName && compareVersions(abfVersion.id, eolVersion) > 0
  })
}
