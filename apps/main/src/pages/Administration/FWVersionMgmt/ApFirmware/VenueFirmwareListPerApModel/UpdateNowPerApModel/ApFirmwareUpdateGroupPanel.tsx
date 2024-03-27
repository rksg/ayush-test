
import { useEffect, useRef, useState } from 'react'

import _ from 'lodash'

import { Loader }                             from '@acx-ui/components'
import { ApModelFirmwares, FirmwareCategory } from '@acx-ui/rc/utils'
import { getIntl }                            from '@acx-ui/utils'

import { getVersionLabel }     from '../../../FirmwareUtils'
import * as UI                 from '../../VenueFirmwareList/styledComponents'
import {
  ApFirmwareUpdateGroupType,
  convertApModelFirmwaresToUpdateGroups,
  filterUpdateGroupsByVenues
} from '../venueFirmwareListPerApModelUtils'

import { ApFirmwareUpdateGroup, ApFirmwareUpdateGroupProps } from './ApFirmwareUpdateGroup'

import { TargetFirmwaresType, VenueIdAndCurrentApFirmwares } from '.'

type DisplayDataType = Omit<ApFirmwareUpdateGroupProps, 'update'>

interface ApFirmwareUpdateGroupPanelPrpos {
  updateTargetFirmwares: (targetFirmwares: TargetFirmwaresType) => void
  selectedVenuesFirmwares: VenueIdAndCurrentApFirmwares[]
}

export function ApFirmwareUpdateGroupPanel (props: ApFirmwareUpdateGroupPanelPrpos) {
  const { selectedVenuesFirmwares, updateTargetFirmwares } = props
  const [ updateGroups, setUpdateGroups ] = useState<ApFirmwareUpdateGroupType[]>()
  const [ displayData, setDisplayData ] = useState<DisplayDataType[]>()
  const [ isLoading, setIsLoading ] = useState(true)
  const targetFirmwares = useRef<TargetFirmwaresType>()

  useEffect(() => {
    setTimeout(() => {
      const updateGrps = convertApModelFirmwaresToUpdateGroups(getTestData())
      setUpdateGroups(filterUpdateGroupsByVenues(selectedVenuesFirmwares, updateGrps))
      setDisplayData(convertToDisplayData(updateGrps))
      setIsLoading(false)
    }, 2000)
  }, [])

  useEffect(() => {
    // Ensure that 'updateTargetFirmwares' only call once when the componnent intializes
    if (!updateGroups || targetFirmwares.current) return

    targetFirmwares.current = convertToTargetFirmwaresType(updateGroups)
    updateTargetFirmwares(targetFirmwares.current)
  }, [updateGroups])

  const update = (apModels: string[], version: string | undefined) => {
    targetFirmwares.current = patchTargetFirmwares(targetFirmwares.current!, apModels, version)
    updateTargetFirmwares(targetFirmwares.current)
  }

  return (<Loader states={[{ isLoading }]}>
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
  </Loader>)
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

function convertToTargetFirmwaresType (data: ApFirmwareUpdateGroupType[]): TargetFirmwaresType {
  return data.map(initTargetFirmwares).flat()
}

function getDefaultValueFromFirmwares (firmwares: ApFirmwareUpdateGroupType['firmwares']): string {
  return firmwares[0].name
}

function initTargetFirmwares (data: ApFirmwareUpdateGroupType): TargetFirmwaresType {
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

function getTestData (): ApModelFirmwares[] {
  return [
    {
      id: '7.0.0.104.1242',
      name: '7.0.0.104.1242',
      supportedApModels: [
        'R550', 'R770', 'R750', 'R350'
      ],
      releaseDate: '2024-02-27T07:27:53.405+00:00',
      onboardDate: '2024-02-21T05:18:57.254+0000',
      category: FirmwareCategory.RECOMMENDED
    },
    {
      id: '7.0.0.104.1240',
      name: '7.0.0.104.1240',
      supportedApModels: [
        'R550', 'R770', 'R750', 'R350'
      ],
      releaseDate: '2024-02-27T07:55:30.500+00:00',
      onboardDate: '2024-02-17T09:36:43.742+0000',
      category: FirmwareCategory.RECOMMENDED
    },
    {
      id: '6.2.4.103.244',
      name: '6.2.4.103.244',
      supportedApModels: [
        'R550', 'R720'
      ],
      releaseDate: '2023-12-25T07:19:26.919+00:00',
      onboardDate: '2023-12-21T03:09:32.204+0000',
      category: FirmwareCategory.RECOMMENDED
    },
    {
      id: '6.2.3.103.249',
      name: '6.2.3.103.249',
      supportedApModels: [
        'R550', 'R720'
      ],
      releaseDate: '2024-02-22T06:51:52.115+00:00',
      onboardDate: '2024-02-05T08:10:35.886+0000',
      category: FirmwareCategory.RECOMMENDED
    },
    {
      id: '6.2.2.103.143',
      name: '6.2.2.103.143',
      supportedApModels: [
        'R550', 'R720'
      ],
      releaseDate: '2023-11-16T09:13:48.863+00:00',
      onboardDate: '2023-07-22T05:49:47.774+0000',
      category: FirmwareCategory.RECOMMENDED
    },
    {
      id: '6.2.0.103.554',
      name: '6.2.0.103.554',
      supportedApModels: [
        'R500', 'R550'
      ],
      releaseDate: '2024-02-27T07:29:28.160+00:00',
      onboardDate: '2023-11-14T10:36:14.119+0000',
      category: FirmwareCategory.RECOMMENDED
    },
    {
      id: '6.2.0.103.548',
      name: '6.2.0.103.548',
      supportedApModels: [
        'R500', 'R550'
      ],
      releaseDate: '2023-11-01T08:59:36.189+00:00',
      onboardDate: '2023-06-07T02:51:42.317+0000',
      category: FirmwareCategory.RECOMMENDED
    }
  ]
}
