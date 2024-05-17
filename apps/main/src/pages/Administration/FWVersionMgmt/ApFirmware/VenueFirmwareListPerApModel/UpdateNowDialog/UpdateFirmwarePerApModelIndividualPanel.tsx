
import { useEffect, useRef, useState } from 'react'

import { Checkbox, Space }     from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import _                       from 'lodash'
import { useIntl }             from 'react-intl'

import { Loader }                            from '@acx-ui/components'
import { useGetAllApModelFirmwareListQuery } from '@acx-ui/rc/services'

import * as UI                                                                     from '../../VenueFirmwareList/styledComponents'
import { ApModelIndividualDisplayDataType, convertToApModelIndividualDisplayData } from '../venueFirmwareListPerApModelUtils'

import { UpdateFirmwarePerApModelIndividual } from './UpdateFirmwarePerApModelIndividual'
import { UpdateFirmwarePerApModelPanelProps } from './UpdateFirmwarePerApModelPanel'

import { UpdateFirmwarePerApModelFirmware } from '.'

// eslint-disable-next-line max-len
export function UpdateFirmwarePerApModelIndividualPanel (props: UpdateFirmwarePerApModelPanelProps) {
  const { $t } = useIntl()
  const { selectedVenuesFirmwares, updatePayload, initialPayload, isUpgrade = true } = props
  const { data: apModelFirmwares, isLoading } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 300
  })
  const updatePayloadRef = useRef<UpdateFirmwarePerApModelFirmware>()
  const [ showAvailableFirmwareOnly, setShowAvailableFirmwareOnly ] = useState(true)
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
