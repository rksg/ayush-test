
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

import { ApFirmwareUpdateIndividual, ApFirmwareUpdateIndividualProps } from './ApFirmwareUpdateIndividual'

import { ApFirmwareUpdateRequestPayload, UpdateFirmwarePerApModelPanelProps } from '.'

type DisplayDataType = Omit<ApFirmwareUpdateIndividualProps, 'update'>

export function ApFirmwareUpdateIndividualPanel (props: UpdateFirmwarePerApModelPanelProps) {
  const { $t } = useIntl()
  const { selectedVenuesFirmwares, updateUpdateRequestPayload } = props
  const { data: apModelFirmwares, isLoading } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 60
  })
  const updateRequestPayloadRef = useRef<ApFirmwareUpdateRequestPayload>()
  const [ showAvailableFirmwareOnly, setShowAvailableFirmwareOnly ] = useState(true)
  const [ displayData, setDisplayData ] = useState<DisplayDataType[]>()

  useEffect(() => {
    if (!apModelFirmwares) return

    const updatedDisplayData = convertToDisplayData(apModelFirmwares, selectedVenuesFirmwares)

    if (!updateRequestPayloadRef.current) { // Ensure that 'updateUpdateRequestPayload' only call once when the componnent intializes
      updateRequestPayloadRef.current = convertToUpdateRequestPayload(updatedDisplayData)
      updateUpdateRequestPayload(updateRequestPayloadRef.current)
    }

    setDisplayData(updatedDisplayData)
  }, [apModelFirmwares])

  const update = (apModel: string, version: string) => {
    // eslint-disable-next-line max-len
    updateRequestPayloadRef.current = patchUpdateRequestPayload(updateRequestPayloadRef.current!, apModel, version)
    updateUpdateRequestPayload(updateRequestPayloadRef.current)
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
  </UI.Section></Loader>)
}

// eslint-disable-next-line max-len
function convertToDisplayData (data: ApModelFirmware[], venuesFirmwares: FirmwareVenuePerApModel[]): DisplayDataType[] {
  const intl = getIntl()
  const result: { [apModel in string]: DisplayDataType['versionOptions'] } = {}
  const apModelMaxFirmwareFromVenues = findApModelMaxFirmwareFromVenues(venuesFirmwares)

  data.forEach((apModelFirmware: ApModelFirmware) => {
    const option = {
      key: apModelFirmware.id,
      label: getVersionLabel(intl, apModelFirmware as VersionLabelType)
    }

    apModelFirmware.supportedApModels.forEach(apModel => {
      if (!apModelMaxFirmwareFromVenues[apModel] ||
        compareVersions(apModelMaxFirmwareFromVenues[apModel], apModelFirmware.id) > 0
      ) return

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

function convertToUpdateRequestPayload (data: DisplayDataType[]): ApFirmwareUpdateRequestPayload {
  return data.map((displayDataItem: DisplayDataType) => ({
    apModel: displayDataItem.apModel,
    firmware: displayDataItem.defaultVersion
  }))
}

function getDefaultValueFromFirmwares (versionOptions: DisplayDataType['versionOptions']): string {
  return versionOptions.length === 0 ? '' : versionOptions[0].key
}

function patchUpdateRequestPayload (
  targetFirmwares: ApFirmwareUpdateRequestPayload, apModel: string, version: string
): ApFirmwareUpdateRequestPayload {

  const result: Array<ApFirmwareUpdateRequestPayload[number] | null> = [...targetFirmwares]

  const targetFirmware = version ? { apModel, firmware: version } : null
  const targetIndex = result.findIndex(existing => existing?.apModel === apModel)

  if (targetIndex === -1) {
    result.push(targetFirmware)
  } else {
    result.splice(targetIndex, 1, targetFirmware)
  }

  return _.compact(result)
}

function findApModelMaxFirmwareFromVenues (
  venuesFirmwares: FirmwareVenuePerApModel[]
): { [apModel in string]: string } {

  return venuesFirmwares.reduce((acc, curr) => {
    if (!curr.currentApFirmwares) return acc

    curr.currentApFirmwares.forEach(currentApFw => {
      if (!acc[currentApFw.apModel]) {
        acc[currentApFw.apModel] = currentApFw.firmware
      } else if (compareVersions(currentApFw.firmware, acc[currentApFw.apModel]) > 0) {
        acc[currentApFw.apModel] = currentApFw.firmware
      }
    })

    return acc
  }, {} as { [apModel in string]: string })
}
