
import { useEffect, useMemo, useRef, useState } from 'react'

import { Checkbox, Space }     from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'

import { ApModelFirmwares, FirmwareCategory } from '@acx-ui/rc/utils'
import { getIntl }                            from '@acx-ui/utils'

import { VersionLabelType, getVersionLabel } from '../../../FirmwareUtils'
import * as UI                               from '../../VenueFirmwareList/styledComponents'

import { ApFirmwareUpdateIndividual, ApFirmwareUpdateIndividualProps } from './ApFirmwareUpdateIndividual'

import { TargetFirmwaresType } from '.'

type DisplayDataType = Omit<ApFirmwareUpdateIndividualProps, 'update'>

const data: ApModelFirmwares[] = [
  {
    id: '7.0.0.104.1242',
    name: '7.0.0.104.1242',
    supportedApModels: ['R770', 'R750', 'R550', 'R610', 'R700'],
    releaseDate: '2024-02-27T07:27:53.405+00:00',
    onboardDate: '2024-02-21T05:18:57.254+0000',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '7.0.0.104.1162',
    name: '7.0.0.104.1242',
    supportedApModels: ['R770', 'R750', 'R550', 'R610', 'R700'],
    releaseDate: '2024-01-24T03:29:59.824+00:00',
    onboardDate: '2024-01-21T09:24:11.636+0000',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '7.0.0.104.1154',
    name: '7.0.0.104.1154',
    supportedApModels: ['R770', 'R750', 'R550', 'R610', 'R700'],
    releaseDate: '2024-01-24T03:29:19.451+00:00',
    onboardDate: '2024-01-18T01:48:08.061+0000',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '6.2.3.103.180',
    name: '6.2.3.103.180',
    supportedApModels: ['R350', 'T310D'],
    releaseDate: '2023-10-18T01:58:00.993+00:00',
    onboardDate: '2023-08-25T07:42:49.519+0000',
    category: FirmwareCategory.RECOMMENDED
  }
]

interface ApFirmwareUpdateIndividualPanelPrpos {
  updateTargetFirmwares: (targetFirmwares: TargetFirmwaresType) => void
}

export function ApFirmwareUpdateIndividualPanel (props: ApFirmwareUpdateIndividualPanelPrpos) {
  const { $t } = useIntl()
  const { updateTargetFirmwares } = props
  const displayData: DisplayDataType[] = useMemo(() => convertToDisplayData(data), [data])
  const targetFirmwares = useRef<TargetFirmwaresType>()
  const [ showAvailableFirmwareOnly, setShowAvailableFirmwareOnly ] = useState(true)

  useEffect(() => {
    // Ensure that 'updateTargetFirmwares' only call once when the componnent intializes
    if (!data || targetFirmwares.current) return

    targetFirmwares.current = convertToTargetFirmwaresType(displayData)
    updateTargetFirmwares(targetFirmwares.current)
  }, [data])

  const update = (apModel: string, version: string) => {
    targetFirmwares.current = patchTargetFirmwares(targetFirmwares.current!, apModel, version)
    updateTargetFirmwares(targetFirmwares.current)
  }

  const handleShowAvailableFirmwareOnlyChange = (e: CheckboxChangeEvent) => {
    setShowAvailableFirmwareOnly(e.target.checked)
  }

  return (<UI.Section>
    <Space direction='vertical' size={20}>
      <Checkbox
        onChange={handleShowAvailableFirmwareOnlyChange}
        checked={showAvailableFirmwareOnly}
      >
        {$t({ defaultMessage: 'Show APs with available firmware only' })}
      </Checkbox>
      <Space direction='vertical' size={10}>
        {displayData.map(item => {
          if (showAvailableFirmwareOnly && item.versionOptions.length === 0) return null

          return <div key={item.apModel}>
            <ApFirmwareUpdateIndividual
              apModel={item.apModel}
              versionOptions={item.versionOptions}
              update={update}
              defaultVersion={item.defaultVersion}
            />
          </div>
        })}
      </Space>
    </Space>
  </UI.Section>)
}

function convertToDisplayData (data: ApModelFirmwares[]): DisplayDataType[] {
  const intl = getIntl()
  const result: { [apModel in string]: DisplayDataType['versionOptions'] } = {}

  data.forEach((apModelFirmwares: ApModelFirmwares) => {
    const option = {
      key: apModelFirmwares.id,
      label: getVersionLabel(intl, apModelFirmwares as VersionLabelType)
    }

    apModelFirmwares.supportedApModels.forEach(apModel => {
      if (result[apModel]) {
        result[apModel].push(option)
      } else {
        result[apModel] = [option]
      }
    })
  })

  return Object.entries(result).map(([ apModel, versionOptions ]) => ({
    apModel,
    versionOptions,
    defaultVersion: getDefaultValueFromFirmwares(versionOptions)
  }))
}

function convertToTargetFirmwaresType (data: DisplayDataType[]): TargetFirmwaresType {
  return data.map((displayDataItem: DisplayDataType) => ({
    apModel: displayDataItem.apModel,
    firmware: displayDataItem.defaultVersion
  }))
}

function getDefaultValueFromFirmwares (versionOptions: DisplayDataType['versionOptions']): string {
  return versionOptions.length === 0 ? '' : versionOptions[0].key
}

// eslint-disable-next-line max-len
function patchTargetFirmwares (targetFirmwares: TargetFirmwaresType, apModel: string, version: string): TargetFirmwaresType {
  const result: Array<TargetFirmwaresType[number] | null> = [...targetFirmwares]

  const targetFirmware = version ? { apModel, firmware: version } : null
  const targetIndex = result.findIndex(existing => existing?.apModel === apModel)

  if (targetIndex === -1) {
    result.push(targetFirmware)
  } else {
    result.splice(targetIndex, 1, targetFirmware)
  }

  return _.compact(result)
}
