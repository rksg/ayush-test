
import { useEffect, useRef } from 'react'

import _ from 'lodash'

import { FirmwareCategory } from '@acx-ui/rc/utils'
import { getIntl }          from '@acx-ui/utils'

import { VersionLabelType, getVersionLabel } from '../../../FirmwareUtils'
import * as UI                               from '../../VenueFirmwareList/styledComponents'

import { ApFirmwareUpdateGroup, ApFirmwareUpdateGroupProps } from './ApFirmwareUpdateGroup'

import { TargetFirmwaresType } from '.'

type RowDataType = { apModels: string[], firmwares: VersionLabelType[] }
type DisplayDataType = Omit<ApFirmwareUpdateGroupProps, 'update'>

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

interface ApFirmwareUpdateGroupPanelPrpos {
  updateTargetFirmwares: (targetFirmwares: TargetFirmwaresType) => void
}

export function ApFirmwareUpdateGroupPanel (props: ApFirmwareUpdateGroupPanelPrpos) {
  const { updateTargetFirmwares } = props
  const displayData: DisplayDataType[] = convertToDisplayData(data)
  const targetFirmwares = useRef<TargetFirmwaresType>()

  useEffect(() => {
    // Ensure that 'updateTargetFirmwares' only call once when the componnent intializes
    if (!data || targetFirmwares.current) return

    targetFirmwares.current = convertToTargetFirmwaresType(data)
    updateTargetFirmwares(targetFirmwares.current)
  }, [data])

  const update = (apModels: string[], version: string | undefined) => {
    targetFirmwares.current = patchTargetFirmwares(targetFirmwares.current!, apModels, version)
    updateTargetFirmwares(targetFirmwares.current)
  }

  return (<>
    {displayData.map(item => {
      return <UI.Section key={item.apModels.join('')}>
        <ApFirmwareUpdateGroup
          apModels={item.apModels}
          versionOptions={item.versionOptions}
          update={update}
          defaultVersion={item.defaultVersion}
        />
      </UI.Section>
    })}
  </>)
}

function convertToDisplayData (data: RowDataType[]): DisplayDataType[] {
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

function convertToTargetFirmwaresType (data: RowDataType[]): TargetFirmwaresType {
  return data.map(initTargetFirmwares).flat()
}

function getDefaultValueFromFirmwares (firmwares: RowDataType['firmwares']): string {
  return firmwares[0].name
}

function initTargetFirmwares (data: RowDataType): TargetFirmwaresType {
  return data.apModels.map(apModel => {
    return { apModel, firmware: getDefaultValueFromFirmwares(data.firmwares) }
  })
}

// eslint-disable-next-line max-len
function patchTargetFirmwares (targetFirmwares: TargetFirmwaresType, apModels: string[], version: string | undefined): TargetFirmwaresType {
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
