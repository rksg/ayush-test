
import { useEffect, useRef, useState } from 'react'

import { Checkbox, Space }     from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { useIntl }             from 'react-intl'

import { Loader }                            from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { useGetAllApModelFirmwareListQuery } from '@acx-ui/rc/services'
import { FirmwareLabel }                     from '@acx-ui/rc/utils'

import {
  convertToPayloadForApModelFirmware,
  patchPayloadForApModelFirmware
} from '../../FirmwareUtils'
import * as UI                                                                     from '../styledComponents'
import { ApModelIndividualDisplayDataType, convertToApModelIndividualDisplayData } from '../venueFirmwareListPerApModelUtils'

import { UpdateFirmwarePerApModelIndividual } from './UpdateFirmwarePerApModelIndividual'
import { UpdateFirmwarePerApModelPanelProps } from './UpdateFirmwarePerApModelPanel'

import { UpdateFirmwarePerApModelFirmware } from '.'

// eslint-disable-next-line max-len
export function UpdateFirmwarePerApModelIndividualPanel (props: UpdateFirmwarePerApModelPanelProps) {
  const { $t } = useIntl()
  const isApFwMgmtEarlyAccess = useIsSplitOn(Features.AP_FW_MGMT_EARLY_ACCESS_TOGGLE)
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

    const updatedDisplayData = convertToApModelIndividualDisplayData(
      // eslint-disable-next-line max-len
      isApFwMgmtEarlyAccess ? apModelFirmwares.filter(d => d.labels?.includes(FirmwareLabel.GA)) : apModelFirmwares,
      selectedVenuesFirmwares,
      initialPayload,
      isUpgrade
    )
    if (!updatePayloadRef.current) { // Ensure that 'updatePayload' only call once when the componnent intializes
      updatePayloadRef.current = convertToPayloadForApModelFirmware(updatedDisplayData)
      updatePayload(updatePayloadRef.current)
    }

    setDisplayData(updatedDisplayData)
    setLabelSize(updatedDisplayData.some(item => item.apModel.length > 6) ? 'large' : 'small')
  }, [apModelFirmwares])

  const update = (apModel: string, version: string) => {
    // eslint-disable-next-line max-len
    updatePayloadRef.current = patchPayloadForApModelFirmware(updatePayloadRef.current!, apModel, version)
    updatePayload(updatePayloadRef.current)
  }

  const handleShowAvailableFirmwareOnlyChange = (e: CheckboxChangeEvent) => {
    setShowAvailableFirmwareOnly(e.target.checked)
  }

  return (<Loader states={[{ isLoading }]}><UI.Section>
    <Space direction='vertical' size={20}>
      {/* eslint-disable-next-line max-len */}
      <span>{$t({ defaultMessage: 'Only the latest four versions are shown. Use dropdown search for more.' })}</span>
      <Checkbox
        onChange={handleShowAvailableFirmwareOnlyChange}
        checked={showAvailableFirmwareOnly}
      >
        {$t({ defaultMessage: 'Show APs with available firmware only' })}
      </Checkbox>
      <Space direction='vertical' size={10}>
        {displayData?.map(item => {
          if (showAvailableFirmwareOnly && item.versionOptions.length === 0) return null

          return <UpdateFirmwarePerApModelIndividual key={item.apModel}
            {...item}
            selectedVenuesFirmwares={selectedVenuesFirmwares}
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


