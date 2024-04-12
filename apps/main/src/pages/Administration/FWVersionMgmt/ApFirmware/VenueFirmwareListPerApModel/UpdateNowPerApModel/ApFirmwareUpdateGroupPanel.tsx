
import { useEffect, useRef, useState } from 'react'

import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'

import { Loader }                            from '@acx-ui/components'
import { useGetAllApModelFirmwareListQuery } from '@acx-ui/rc/services'
import { FirmwareVenuePerApModel }           from '@acx-ui/rc/utils'
import { getIntl }                           from '@acx-ui/utils'

import { getVersionLabel }                from '../../../FirmwareUtils'
import * as UI                            from '../../VenueFirmwareList/styledComponents'
import {
  ApFirmwareUpdateGroupType,
  convertApModelFirmwaresToUpdateGroups
} from '../venueFirmwareListPerApModelUtils'

import { ApFirmwareUpdateGroup } from './ApFirmwareUpdateGroup'

import { ApFirmwareUpdateRequestPayload, UpdateFirmwarePerApModelPanelProps } from '.'

type DisplayDataType = {
  apModels: string[]
  versionOptions: DefaultOptionType[]
  defaultVersion: string
}

export function ApFirmwareUpdateGroupPanel (props: UpdateFirmwarePerApModelPanelProps) {
  const { selectedVenuesFirmwares, updateUpdateRequestPayload } = props
  const { data: apModelFirmwares, isLoading } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 60
  })
  const [ displayData, setDisplayData ] = useState<DisplayDataType[]>()
  const targetFirmwaresRef = useRef<ApFirmwareUpdateRequestPayload>()

  useEffect(() => {
    if (!apModelFirmwares) return

    const updateGrps = convertApModelFirmwaresToUpdateGroups(apModelFirmwares)
    const venuesBasedUpdateGrps = filterByVenues(selectedVenuesFirmwares, updateGrps)
    const displayData = convertToDisplayData(venuesBasedUpdateGrps)

    if (!targetFirmwaresRef.current) { // Ensure that 'updateUpdateRequestPayload' only call once when the componnent intializes
      targetFirmwaresRef.current = convertToUpdateRequestPayload(displayData)
      updateUpdateRequestPayload(targetFirmwaresRef.current)
    }

    setDisplayData(displayData)
  }, [apModelFirmwares])

  const update = (apModels: string[], version: string | undefined) => {
    // eslint-disable-next-line max-len
    targetFirmwaresRef.current = patchUpdateRequestPayload(targetFirmwaresRef.current!, apModels, version)
    updateUpdateRequestPayload(targetFirmwaresRef.current)
  }

  return <Loader states={[{ isLoading }]}>
    {displayData?.map(item => {
      return <UI.Section key={item.apModels.join('')}>
        <ApFirmwareUpdateGroup
          apModels={item.apModels}
          versionOptions={item.versionOptions}
          update={update}
          defaultVersion={item.defaultVersion}
        />
      </UI.Section>
    })}
  </Loader>
}

function convertToDisplayData (data: ApFirmwareUpdateGroupType[]): DisplayDataType[] {
  const intl = getIntl()

  return data.map(item => ({
    apModels: item.apModels,
    versionOptions: item.firmwares.map(firmware => ({
      value: firmware.name,
      label: getVersionLabel(intl, firmware)
    })),
    defaultVersion: getDefaultValueFromFirmwares(item.firmwares)
  }))
}

function getDefaultValueFromFirmwares (firmwares: ApFirmwareUpdateGroupType['firmwares']): string {
  return firmwares[0].name
}

function convertToUpdateRequestPayload (data: DisplayDataType[]): ApFirmwareUpdateRequestPayload {
  return data.map((displayData: DisplayDataType) => {
    return displayData.apModels.map(apModel => ({ apModel, firmware: displayData.defaultVersion }))
  }).flat()
}

function patchUpdateRequestPayload (
  targetFirmwares: ApFirmwareUpdateRequestPayload, apModels: string[], version: string | undefined
): ApFirmwareUpdateRequestPayload {

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
