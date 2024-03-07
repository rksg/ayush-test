
import { useState } from 'react'

import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'

import { FirmwareCategory, VenueApModelFirmwaresUpdatePayload } from '@acx-ui/rc/utils'
import { getIntl }                                              from '@acx-ui/utils'

import { VersionLabelType, getVersionLabel } from '../../../FirmwareUtils'
import * as UI                               from '../styledComponents'

import { ApFirmwareUpdateGroup } from './ApFirmwareUpdateGroup'

type RowDataType = { apModels: string[], firmwares: VersionLabelType[] }
type DisplayDataType = { apModels: string[], firmwares: DefaultOptionType[], defaultValue: string }
type TargetFirmwaresType = VenueApModelFirmwaresUpdatePayload['targetFirmwares']

const data: RowDataType[] = [
  {
    apModels: ['R770', 'R750', 'R550', 'R610', 'R700'],
    firmwares: [
      {
        name: '7.0.0.104.1162',
        category: FirmwareCategory.RECOMMENDED,
        onboardDate: '2024-01-21T09:24:11.636+0000',
        releaseDate: '2024-01-24T03:29:59.824+00:00'
      },
      {
        name: '7.0.0.104.1154',
        category: FirmwareCategory.RECOMMENDED,
        onboardDate: '2024-01-18T01:48:08.061+0000',
        releaseDate: '2024-01-24T03:29:19.451+00:00'
      }
    ]
  },
  {
    apModels: ['R350', 'T310D'],
    firmwares: [
      {
        name: '6.2.3.103.180',
        category: FirmwareCategory.RECOMMENDED,
        onboardDate: '2023-08-25T07:42:49.519+0000',
        releaseDate: '2023-10-18T01:58:00.993+00:00'
      }
    ]
  }
]

export function ApFirmwareUpdateGroupPanel () {
  const displayData: DisplayDataType[] = convertToDisplayData(data)
  const [ targetFirmwares, setTargetFirmwares ] = useTargetFirmwares(data)

  const updatePayload = (apModels: string[], version: string | undefined) => {
    setTargetFirmwares(updateTargetFirmwares(targetFirmwares, apModels, version))
  }

  return (<>
    {displayData.map(item => {
      return <UI.Section key={item.apModels.join('')}>
        <ApFirmwareUpdateGroup
          apModels={item.apModels}
          versionOptions={item.firmwares}
          update={updatePayload}
          defaultVersion={item.defaultValue}
        />
      </UI.Section>
    })}
  </>)
}

function convertToDisplayData (data: RowDataType[]): DisplayDataType[] {
  const intl = getIntl()

  return data.map(item => ({
    apModels: item.apModels,
    firmwares: item.firmwares.map(firmware => ({
      value: firmware.name,
      label: getVersionLabel(intl, firmware)
    })),
    defaultValue: getDefaultValueFromDataFirmwares(item.firmwares)
  }))
}

function useTargetFirmwares (data: RowDataType[]) {
  const defaultTargetFirmwares = data.map(initTargetFirmwares).flat()
  return useState<TargetFirmwaresType>(defaultTargetFirmwares)
}

function getDefaultValueFromDataFirmwares (firmwares: RowDataType['firmwares']): string {
  return firmwares[0].name
}

function initTargetFirmwares (data: RowDataType): TargetFirmwaresType {
  return data.apModels.map(apModel => {
    return { apModel, firmware: getDefaultValueFromDataFirmwares(data.firmwares) }
  })
}

function updateTargetFirmwares (
  targetFirmwares: TargetFirmwaresType,
  apModels: string[],
  version: string | undefined
): TargetFirmwaresType {
  const result = [...targetFirmwares]

  if (version) {
    result.forEach(fw => apModels.includes(fw.apModel) && (fw.firmware = version))
  } else {
    _.remove(result, (fw) => apModels.includes(fw.apModel))
  }

  return result
}
