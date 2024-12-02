import { useEffect, useRef, useState } from 'react'

import { Space }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Loader }                            from '@acx-ui/components'
import { useGetAllApModelFirmwareListQuery } from '@acx-ui/rc/services'
import { FirmwareVenuePerApModel }           from '@acx-ui/rc/utils'

import * as UI                            from '../styledComponents'
import {
  ApModelIndividualDisplayDataType,
  convertToApModelIndividualDisplayData
} from '../venueFirmwareListPerApModelUtils'


import { UpdateEarlyAccessPerApModelIndividual } from './UpdateEarlyAccessPerApModelIndividual'

import { UpdateFirmwarePerApModelFirmware } from './index'


export interface UpdateEarlyAccessPerApModelIndividualPanelProps {
  selectedVenuesFirmwares: FirmwareVenuePerApModel[]
  updatePayload: (targetFirmwares: UpdateFirmwarePerApModelFirmware) => void
  initialPayload?: UpdateFirmwarePerApModelFirmware
  isUpgrade?: boolean
}

// eslint-disable-next-line max-len
export function UpdateEarlyAccessPerApModelIndividualPanel (props: UpdateEarlyAccessPerApModelIndividualPanelProps) {
  const { $t } = useIntl()
  const { selectedVenuesFirmwares, updatePayload, initialPayload, isUpgrade = true } = props
  const { data: apModelFirmwares, isLoading } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 300
  })
  const updatePayloadRef = useRef<UpdateFirmwarePerApModelFirmware>()
  const [ displayData, setDisplayData ] = useState<ApModelIndividualDisplayDataType[]>()
  const [ labelSize, setLabelSize ] = useState<'small' | 'large'>()

  useEffect(() => {
    if (!apModelFirmwares) return
    // eslint-disable-next-line max-len
    const updatedDisplayData = convertToApModelIndividualDisplayData(apModelFirmwares, selectedVenuesFirmwares, initialPayload, isUpgrade)

    if (!updatePayloadRef.current) { // Ensure that 'updatePayload' only call once when the componnent intializes
      updatePayloadRef.current = convertToPayload(updatedDisplayData)
      updatePayload(updatePayloadRef.current)
    }

    setDisplayData(updatedDisplayData)
    setLabelSize(updatedDisplayData.some(item => item.apModel.length > 6) ? 'large' : 'small')
  }, [apModelFirmwares])

  const update = (apModel: string, version: string) => {
    updatePayloadRef.current = patchPayload(updatePayloadRef.current!, apModel, version)
    updatePayload(updatePayloadRef.current)
  }

  return (<Loader states={[{ isLoading }]}><UI.Section>
    <Space direction='vertical' size={20}>
      {/* eslint-disable-next-line max-len */}
      <span>{$t({ defaultMessage: 'Only the latest four versions are shown. Use dropdown search for more.' })}</span>
      <Space direction='vertical' size={10}>
        {displayData?.map(item => {
          if (item.versionOptions.length === 0) return null

          return <UpdateEarlyAccessPerApModelIndividual key={item.apModel}
            {...item}
            update={update}
            labelSize={labelSize}
            isUpgrade={isUpgrade}
            // eslint-disable-next-line max-len
            {...(!isUpgrade && { emptyOptionLabel: $t({ defaultMessage: 'Do not downgrade firmware' }) })}
            // eslint-disable-next-line max-len
            {...(!isUpgrade && { noOptionsMessage: $t({ defaultMessage: 'No lower firmware versions available for downgrade' }) })}
          />
        })}
      </Space>
    </Space>
  </UI.Section></Loader>)
}

// eslint-disable-next-line max-len
function convertToPayload (displayData: ApModelIndividualDisplayDataType[]): UpdateFirmwarePerApModelFirmware {
  return displayData.map((displayDataItem: ApModelIndividualDisplayDataType) => ({
    apModel: displayDataItem.apModel,
    firmware: displayDataItem.defaultVersion
  }))
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
