
import { useEffect, useRef, useState } from 'react'

import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'

import { Loader }                                 from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { useGetAllApModelFirmwareListQuery }      from '@acx-ui/rc/services'
import { FirmwareLabel, FirmwareVenuePerApModel } from '@acx-ui/rc/utils'
import { getIntl }                                from '@acx-ui/utils'

import { compareVersions, getVersionLabel } from '../../FirmwareUtils'
import * as UI                              from '../styledComponents'
import {
  ApFirmwareUpdateGroupType,
  convertApModelFirmwaresToUpdateGroups,
  findExtremeFirmwareBasedOnApModel
} from '../venueFirmwareListPerApModelUtils'

import { UpdateFirmwarePerApModelGroup }      from './UpdateFirmwarePerApModelGroup'
import { UpdateFirmwarePerApModelPanelProps } from './UpdateFirmwarePerApModelPanel'

import { UpdateFirmwarePerApModelFirmware } from '.'

type DisplayDataType = {
  apModels: string[]
  versionOptions: DefaultOptionType[]
  defaultVersion: string
}

export function UpdateFirmwarePerApModelGroupPanel (props: UpdateFirmwarePerApModelPanelProps) {
  const { selectedVenuesFirmwares, updatePayload, initialPayload } = props
  const isApFwMgmtEarlyAccess = useIsSplitOn(Features.AP_FW_MGMT_EARLY_ACCESS_TOGGLE)
  const { data: apModelFirmwares, isLoading } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 300
  })
  const [ displayData, setDisplayData ] = useState<DisplayDataType[]>()
  const targetFirmwaresRef = useRef<UpdateFirmwarePerApModelFirmware>()

  useEffect(() => {
    if (!apModelFirmwares) return

    const updateGrps = convertApModelFirmwaresToUpdateGroups(
      isApFwMgmtEarlyAccess
        ? apModelFirmwares.filter(d => d.labels?.includes(FirmwareLabel.GA))
        : apModelFirmwares
    )
    const venuesBasedUpdateGrps = filterByVenues(selectedVenuesFirmwares, updateGrps)
    const displayData = convertToApModelGroupDisplayData(venuesBasedUpdateGrps, initialPayload)

    if (!targetFirmwaresRef.current) { // Ensure that 'updatePayload' only call once when the componnent intializes
      targetFirmwaresRef.current = convertToPayload(displayData)
      updatePayload(targetFirmwaresRef.current)
    }

    setDisplayData(displayData)
  }, [apModelFirmwares])

  const update = (apModels: string[], version: string | undefined) => {
    // eslint-disable-next-line max-len
    targetFirmwaresRef.current = patchPayload(targetFirmwaresRef.current!, apModels, version)
    updatePayload(targetFirmwaresRef.current)
  }

  return <Loader states={[{ isLoading }]}>
    {displayData?.map(item => {
      return <UI.Section key={item.apModels.join('')}>
        <UpdateFirmwarePerApModelGroup
          apModels={item.apModels}
          versionOptions={item.versionOptions}
          update={update}
          defaultVersion={item.defaultVersion}
        />
      </UI.Section>
    })}
  </Loader>
}

// eslint-disable-next-line max-len
function convertToApModelGroupDisplayData (data: ApFirmwareUpdateGroupType[], initialPayload?: UpdateFirmwarePerApModelFirmware): DisplayDataType[] {
  const intl = getIntl()

  return data.map((item: ApFirmwareUpdateGroupType) => ({
    apModels: item.apModels,
    versionOptions: item.firmwares.map(firmware => ({
      value: firmware.name,
      label: getVersionLabel(intl, firmware)
    })),
    defaultVersion: getDefaultFirmwareFromPayload(item, initialPayload)
  }))
}

// Returns the firmware if all AP models in the initialValues have the same firmware version.
// If not, it returns the first firmware in the update group.
// eslint-disable-next-line max-len
function getDefaultFirmwareFromPayload (updateGroup: ApFirmwareUpdateGroupType, initialValues?: UpdateFirmwarePerApModelFirmware): string {
  if (!initialValues || initialValues.length === 0) return updateGroup.firmwares[0].name

  // eslint-disable-next-line max-len
  const targetFirmwares = initialValues.filter(initValue => updateGroup.apModels.includes(initValue.apModel))
  const uniqueInitialFirmware = new Set([...targetFirmwares.map(tf => tf.firmware)])

  if (targetFirmwares.length === 0) {
    return ''
  } else if (targetFirmwares.length === updateGroup.apModels.length
    && uniqueInitialFirmware.size === 1
    && updateGroup.firmwares.some(fw => fw.name === Array.from(uniqueInitialFirmware)[0])) {
    return targetFirmwares[0].firmware
  }

  return updateGroup.firmwares[0].name
}

function convertToPayload (data: DisplayDataType[]): UpdateFirmwarePerApModelFirmware {
  return data.map((displayData: DisplayDataType) => {
    return displayData.apModels.map(apModel => ({ apModel, firmware: displayData.defaultVersion }))
  }).flat()
}

function patchPayload (
  targetFirmwares: UpdateFirmwarePerApModelFirmware, apModels: string[], version: string | undefined
): UpdateFirmwarePerApModelFirmware {

  const result = [...targetFirmwares]

  if (version) {
    apModels.forEach(apModel => {
      const targetIndex = result.findIndex(existing => existing.apModel === apModel)
      // eslint-disable-next-line max-len
      result.splice((targetIndex === -1 ? result.length : targetIndex), 1, { apModel, firmware: version })
    })
  } else {
    _.remove(result, (fw) => apModels.includes(fw.apModel))
  }

  return result
}

function filterByVenues (
  venuesFirmwares: FirmwareVenuePerApModel[],
  updateGroupList: ApFirmwareUpdateGroupType[]
): ApFirmwareUpdateGroupType[] {

  const unhandledApModels = _.uniq(
    _.compact(venuesFirmwares.flatMap(venueFw => venueFw.currentApFirmwares))
      .map(currentApFw => currentApFw.apModel)
  )

  const result: ApFirmwareUpdateGroupType[] = []

  for (const updateGroup of updateGroupList) {
    if (unhandledApModels.length === 0) break

    const intersectionApModels = _.intersection(updateGroup.apModels, unhandledApModels)
    if (intersectionApModels.length > 0) {
      result.push({
        ...updateGroup,
        apModels: intersectionApModels
      })
    }
    _.pullAll(unhandledApModels, intersectionApModels)
  }

  const maxFirmwareBasedOnApModel = findExtremeFirmwareBasedOnApModel(venuesFirmwares)
  return result.filter(updateGroup => {
    return updateGroup.apModels.some(apModel => {
      const maxFirmware = maxFirmwareBasedOnApModel[apModel]

      if (!maxFirmware) return false

      // eslint-disable-next-line max-len
      const comparisonResult = compareVersions(updateGroup.firmwares[0].name, maxFirmware.extremeFirmware)
      return comparisonResult > 0 || (!maxFirmware.isAllTheSame && comparisonResult === 0)
    })
  })
}
