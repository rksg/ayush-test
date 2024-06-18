import { useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Select } from '@acx-ui/components'

import { ApModelIndividualDisplayDataType } from '../venueFirmwareListPerApModelUtils'

const { Option } = Select

interface UpdateFirmwarePerApModelIndividualProps extends ApModelIndividualDisplayDataType {
  update: (apModel: string, version: string) => void
  labelSize?: 'small' | 'large'
  emptyOptionLabel?: string
  noOptionsMessage?: string
}

// eslint-disable-next-line max-len
export function UpdateFirmwarePerApModelIndividual (props: UpdateFirmwarePerApModelIndividualProps) {
  const { $t } = useIntl()
  const { apModel, versionOptions, update, defaultVersion, extremeFirmware,
    labelSize = 'small',
    emptyOptionLabel = $t({ defaultMessage: 'Do not update firmware' }),
    noOptionsMessage = $t({ defaultMessage: 'The AP is up-to-date' })
  } = props
  const [ selectedVersion, setSelectedVersion ] = useState(defaultVersion)

  const onSelectedVersionChange = (value: string) => {
    setSelectedVersion(value)
    update(apModel, value)
  }

  return (
    <Space>
      <div style={{ width: labelSize === 'small' ? 50 : 90 }}>{apModel}</div>
      {versionOptions.length > 0
        ? <Select onChange={onSelectedVersionChange} value={selectedVersion} style={{ width: 400 }}>
          {versionOptions.map(option => <Option key={option.key}>{option.label}</Option>)}
          <Option key={''}>{emptyOptionLabel}</Option>
        </Select>
        : <div>{noOptionsMessage} (<strong>{extremeFirmware}</strong>)</div>
      }
    </Space>
  )
}
