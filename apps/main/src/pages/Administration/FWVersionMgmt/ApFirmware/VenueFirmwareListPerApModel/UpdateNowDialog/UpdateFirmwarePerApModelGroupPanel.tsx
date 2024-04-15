
import { useEffect, useRef, useState } from 'react'

import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'

import { Loader }                            from '@acx-ui/components'
import { useGetAllApModelFirmwareListQuery } from '@acx-ui/rc/services'
import { FirmwareVenuePerApModel }           from '@acx-ui/rc/utils'
import { getIntl }                           from '@acx-ui/utils'

import { getVersionLabel }                 from '../../../FirmwareUtils'
import * as UI                             from '../../VenueFirmwareList/styledComponents'
import {
  ApFirmwareUpdateGroupType,
  convertApModelFirmwaresToUpdateGroups
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
  const { data: apModelFirmwares, isLoading } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 60
  })
  const [ displayData, setDisplayData ] = useState<DisplayDataType[]>()
  const targetFirmwaresRef = useRef<UpdateFirmwarePerApModelFirmware>()

  useEffect(() => {
    if (!apModelFirmwares) return

    const updateGrps = convertApModelFirmwaresToUpdateGroups(apModelFirmwares)
    const venuesBasedUpdateGrps = filterByVenues(selectedVenuesFirmwares, updateGrps)
    const displayData = convertToDisplayData(venuesBasedUpdateGrps, initialPayload)

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
function convertToDisplayData (data: ApFirmwareUpdateGroupType[], initialPayload?: UpdateFirmwarePerApModelFirmware): DisplayDataType[] {
  const intl = getIntl()

  return data.map((item: ApFirmwareUpdateGroupType) => ({
    apModels: item.apModels,
    versionOptions: item.firmwares.map(firmware => ({
      value: firmware.name,
      label: getVersionLabel(intl, firmware)
    })),
    defaultVersion: getInitialFirmwareValue(item, initialPayload)
  }))
}

// Returns the firmware if all AP models in the initialValues have the same firmware version.
// If not, it returns the first firmware in the update group.
// eslint-disable-next-line max-len
function getInitialFirmwareValue (updateGroup: ApFirmwareUpdateGroupType, initialValues?: UpdateFirmwarePerApModelFirmware): string {
  if (!initialValues || initialValues.length === 0) return updateGroup.firmwares[0].name

  const targetFirmwares = initialValues.filter(fw => updateGroup.apModels.includes(fw.apModel))
  if (targetFirmwares.length === 0) {
    return ''
  } else if (targetFirmwares.length === updateGroup.apModels.length
    && new Set([...targetFirmwares.map(tf => tf.firmware)]).size === 1) {
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
  updateGroups: ApFirmwareUpdateGroupType[]
): ApFirmwareUpdateGroupType[] {
  const allVenueApModels = _.uniq(
    _.compact(venuesFirmwares.map(venueFw => venueFw.currentApFirmwares))
      .flat().map(currentApFw => currentApFw.apModel)
  )

  const result: ApFirmwareUpdateGroupType[] = []
  updateGroups.forEach(updateGroup => {
    const intersectionApModels = _.intersection(updateGroup.apModels, allVenueApModels)
    if (intersectionApModels.length > 0) {
      result.push({
        ...updateGroup,
        apModels: intersectionApModels
      })
    }
  })

  return result
}
