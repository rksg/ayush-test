
import { useEffect, useRef, useState } from 'react'

import { Checkbox, Space }     from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'

import { Loader }                                   from '@acx-ui/components'
import { useGetAllApModelFirmwareListQuery }        from '@acx-ui/rc/services'
import { ApModelFirmware, FirmwareVenuePerApModel } from '@acx-ui/rc/utils'
import { getIntl }                                  from '@acx-ui/utils'

import { VersionLabelType, compareVersions, getVersionLabel } from '../../../FirmwareUtils'
import * as UI                                                from '../../VenueFirmwareList/styledComponents'

import { UpdateFirmwarePerApModelIndividual } from './UpdateFirmwarePerApModelIndividual'
import { UpdateFirmwarePerApModelPanelProps } from './UpdateFirmwarePerApModelPanel'

import { UpdateFirmwarePerApModelFirmware } from '.'

type DisplayDataType = {
  apModel: string
  versionOptions: { key: string, label: string }[]
  defaultVersion: string
}

// eslint-disable-next-line max-len
export function UpdateFirmwarePerApModelIndividualPanel (props: UpdateFirmwarePerApModelPanelProps) {
  const { $t } = useIntl()
  const { selectedVenuesFirmwares, updatePayload, initialPayload, isUpgrade = true } = props
  const { data: apModelFirmwares, isLoading } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 60
  })
  const updatePayloadRef = useRef<UpdateFirmwarePerApModelFirmware>()
  const [ showAvailableFirmwareOnly, setShowAvailableFirmwareOnly ] = useState(true)
  const [ displayData, setDisplayData ] = useState<DisplayDataType[]>()
  const [ labelSize, setLabelSize ] = useState<'small' | 'large'>()

  useEffect(() => {
    if (!apModelFirmwares) return

    // eslint-disable-next-line max-len
    const updatedDisplayData = convertToDisplayData(apModelFirmwares, selectedVenuesFirmwares, initialPayload, isUpgrade)

    if (!updatePayloadRef.current) { // Ensure that 'updatePayload' only call once when the componnent intializes
      updatePayloadRef.current = convertToPayload(updatedDisplayData)
      updatePayload(updatePayloadRef.current)
    }

    setDisplayData(updatedDisplayData)
    setLabelSize(updatedDisplayData.some(item => item.apModel.length > 6) ? 'large' : 'small')
  }, [apModelFirmwares])

  const update = (apModel: string, version: string) => {
    // eslint-disable-next-line max-len
    updatePayloadRef.current = patchPayload(updatePayloadRef.current!, apModel, version)
    updatePayload(updatePayloadRef.current)
  }

  const handleShowAvailableFirmwareOnlyChange = (e: CheckboxChangeEvent) => {
    setShowAvailableFirmwareOnly(e.target.checked)
  }

  return (<Loader states={[{ isLoading }]}><UI.Section>
    <Space direction='vertical' size={20}>
      <Checkbox
        onChange={handleShowAvailableFirmwareOnlyChange}
        checked={showAvailableFirmwareOnly}
      >
        {$t({ defaultMessage: 'Show APs with available firmware only' })}
      </Checkbox>
      <Space direction='vertical' size={10}>
        {displayData?.map(item => {
          if (showAvailableFirmwareOnly && item.versionOptions.length === 0) return null

          return <div key={item.apModel}>
            <UpdateFirmwarePerApModelIndividual
              apModel={item.apModel}
              versionOptions={item.versionOptions}
              update={update}
              defaultVersion={item.defaultVersion}
              labelSize={labelSize}
              emptyOptionLabel={isUpgrade
                ? $t({ defaultMessage: 'Do not update firmware' })
                : $t({ defaultMessage: 'Do not downgrade firmware' })
              }
            />
          </div>
        })}
      </Space>
    </Space>
  </UI.Section></Loader>)
}

function convertToDisplayData (
  data: ApModelFirmware[],
  venuesFirmwares: FirmwareVenuePerApModel[],
  initialPayload?: UpdateFirmwarePerApModelFirmware,
  isUpgrade = true
): DisplayDataType[] {
  const intl = getIntl()
  const result: { [apModel in string]: DisplayDataType['versionOptions'] } = {}
  const extremeFirmwareMap = findExtremeFirmwareBasedOnApModel(venuesFirmwares, isUpgrade)

  data.forEach((apModelFirmware: ApModelFirmware) => {
    if (!apModelFirmware.supportedApModels) return

    const option = {
      key: apModelFirmware.id,
      label: getVersionLabel(intl, apModelFirmware as VersionLabelType)
    }

    apModelFirmware.supportedApModels.forEach(apModel => {
      const apModelExtremeFirmware = extremeFirmwareMap[apModel]
      if (!apModelExtremeFirmware) return

      const comparisonResult = compareVersions(apModelExtremeFirmware, apModelFirmware.id)
      if (isUpgrade ? comparisonResult > 0 : comparisonResult <= 0) return

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
    defaultVersion: isUpgrade
      ? getApModelDefaultFirmware(apModel, versionOptions, initialPayload)
      : ''
  }))
}

function convertToPayload (data: DisplayDataType[]): UpdateFirmwarePerApModelFirmware {
  return data.map((displayDataItem: DisplayDataType) => ({
    apModel: displayDataItem.apModel,
    firmware: displayDataItem.defaultVersion
  }))
}

function getApModelDefaultFirmware (
  apModel: string,
  versionOptions: DisplayDataType['versionOptions'],
  initialPayload?: UpdateFirmwarePerApModelFirmware
): string {
  if (initialPayload) {
    const targetApModelFirmwares = initialPayload.find(fw => fw.apModel === apModel)
    return targetApModelFirmwares?.firmware ?? ''
  }

  return versionOptions.length === 0 ? '' : versionOptions[0].key
}

function patchPayload (
  targetFirmwares: UpdateFirmwarePerApModelFirmware, apModel: string, version: string
): UpdateFirmwarePerApModelFirmware {

  const result: Array<UpdateFirmwarePerApModelFirmware[number] | null> = [...targetFirmwares]

  const targetFirmware = version ? { apModel, firmware: version } : null
  const targetIndex = result.findIndex(existing => existing?.apModel === apModel)

  if (targetIndex === -1) {
    result.push(targetFirmware)
  } else {
    result.splice(targetIndex, 1, targetFirmware)
  }

  return _.compact(result)
}

function findExtremeFirmwareBasedOnApModel (
  venuesFirmwares: FirmwareVenuePerApModel[],
  findMax = true
): { [apModel in string]: string } {

  return venuesFirmwares.reduce((acc, curr) => {
    if (!curr.currentApFirmwares) return acc

    curr.currentApFirmwares.forEach(currentApFw => {
      if (!acc[currentApFw.apModel]) {
        acc[currentApFw.apModel] = currentApFw.firmware
      } else {
        const comparisonResult = compareVersions(currentApFw.firmware, acc[currentApFw.apModel])
        if (findMax ? comparisonResult > 0 : comparisonResult < 0) {
          acc[currentApFw.apModel] = currentApFw.firmware
        }
      }
    })

    return acc
  }, {} as { [apModel in string]: string })
}
