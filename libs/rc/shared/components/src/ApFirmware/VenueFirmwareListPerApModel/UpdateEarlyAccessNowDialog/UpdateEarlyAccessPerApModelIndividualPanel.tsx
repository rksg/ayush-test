import { useEffect, useRef, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Loader }                                                  from '@acx-ui/components'
import { useGetAllApModelFirmwareListQuery }                       from '@acx-ui/rc/services'
import { ApModelFirmware, FirmwareLabel, FirmwareVenuePerApModel } from '@acx-ui/rc/utils'
import { compareVersions }                                         from '@acx-ui/utils'

import {
  convertToPayloadForApModelFirmware,
  patchPayloadForApModelFirmware
} from '../../FirmwareUtils'
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
  isAlpha: boolean,
  isBeta: boolean
}

// eslint-disable-next-line max-len
export function UpdateEarlyAccessPerApModelIndividualPanel (props: UpdateEarlyAccessPerApModelIndividualPanelProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { selectedVenuesFirmwares, updatePayload, isAlpha, isBeta } = props
  const { data: apModelFirmwares, isLoading } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 300
  })
  const updatePayloadRef = useRef<UpdateFirmwarePerApModelFirmware>()
  // eslint-disable-next-line max-len
  const [apModelEarlyAccessFirmwares, setApModelEarlyAccessFirmwares] = useState<ApModelFirmware[]>()
  const [ displayData, setDisplayData ] = useState<ApModelIndividualDisplayDataType[]>()
  const [ labelSize, setLabelSize ] = useState<'small' | 'large'>()

  useEffect(() => {
    if (!apModelFirmwares) return

    let updateGroups = [] as ApModelFirmware[]
    // eslint-disable-next-line max-len
    let updateAlphaGroups = apModelFirmwares.filter(data => data.labels?.includes(FirmwareLabel.ALPHA))
    // eslint-disable-next-line max-len
    let updateBetaGroups = apModelFirmwares.filter(data => data.labels?.includes(FirmwareLabel.BETA))

    updateGroups = [
      ...updateGroups,
      ...(isAlpha ? updateAlphaGroups : []),
      ...((isBeta || isAlpha) ? updateBetaGroups : [])
    ]

    updateGroups.sort((a, b) => compareVersions(b.id, a.id))
    setApModelEarlyAccessFirmwares(updateGroups)
  }, [apModelFirmwares])

  useEffect(() => {
    if (!apModelEarlyAccessFirmwares) return
    // eslint-disable-next-line max-len
    const updatedDisplayData = convertToApModelIndividualDisplayData(
      apModelEarlyAccessFirmwares,
      selectedVenuesFirmwares,
      undefined,
      true
    )

    if (!updatePayloadRef.current) { // Ensure that 'updatePayload' only call once when the componnent intializes
      updatePayloadRef.current = convertToPayloadForApModelFirmware(updatedDisplayData)
      updatePayload(updatePayloadRef.current)
    }

    setDisplayData(updatedDisplayData)
    setLabelSize(updatedDisplayData.some(item => item.apModel.length > 6) ? 'large' : 'small')
  }, [apModelEarlyAccessFirmwares])

  const update = (apModel: string, version: string) => {
    // eslint-disable-next-line max-len
    updatePayloadRef.current = patchPayloadForApModelFirmware(updatePayloadRef.current!, apModel, version)
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
          />
        })}
      </Space>
    </Space>
  </UI.Section></Loader>)
}

