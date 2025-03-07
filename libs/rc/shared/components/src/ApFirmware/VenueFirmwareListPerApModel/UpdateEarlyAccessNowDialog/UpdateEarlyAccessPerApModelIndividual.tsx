import { useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Select }                  from '@acx-ui/components'
import { FirmwareVenuePerApModel } from '@acx-ui/rc/utils'

import { isEarlyAccessOrLegacyEarlyAccess } from '../../FirmwareUtils'
import { ApModelIndividualDisplayDataType } from '../venueFirmwareListPerApModelUtils'

const { Option } = Select


interface UpdateEarlyAccessPerApModelIndividualProps extends ApModelIndividualDisplayDataType {
  update: (apModel: string, version: string) => void
  labelSize?: 'small' | 'large'
  emptyOptionLabel?: string
  noOptionsMessage?: string
  selectedVenuesFirmwares?: FirmwareVenuePerApModel[]
}

// eslint-disable-next-line max-len
export function UpdateEarlyAccessPerApModelIndividual (props: UpdateEarlyAccessPerApModelIndividualProps) {
  const { $t } = useIntl()
  const { apModel, versionOptions, update, defaultVersion, extremeFirmware,
    labelSize = 'small',
    emptyOptionLabel = $t({ defaultMessage: 'Do not update firmware' }),
    noOptionsMessage = $t({ defaultMessage: 'The AP is up-to-date' }),
    selectedVenuesFirmwares = []
  } = props
  const [ selectedVersion, setSelectedVersion ] = useState(defaultVersion)

  const resolvedVersionOptions = versionOptions

  const [ filteredOptions, setFilteredOptions ] = useState(resolvedVersionOptions)

  const refreshVersionOptions = (version: string) => {
    if (resolvedVersionOptions.find(option => option.key === version)) {
      setFilteredOptions(resolvedVersionOptions)
    } else {
      const target = versionOptions.find(option => option.key === version)
      if (target) {
        setFilteredOptions([target, ...resolvedVersionOptions])
      }
    }
  }

  const onSelectedVersionChange = (value: string) => {
    refreshVersionOptions(value)
    setSelectedVersion(value)
    update(apModel, value)
  }

  const handleSearch = (value: string) => {
    if (value) {
      setFilteredOptions(versionOptions.filter(option =>
        option.label.toLowerCase().includes(value.toLowerCase())
      ))
    } else {
      setFilteredOptions(resolvedVersionOptions)
    }
  }

  const {
    earlyAccess,
    legacyEarlyAccess
  } = isEarlyAccessOrLegacyEarlyAccess(
    selectedVenuesFirmwares, apModel, extremeFirmware
  )

  const earlyAccessContent = earlyAccess
    // eslint-disable-next-line max-len
    ? legacyEarlyAccess ? ` ${$t({ defaultMessage: 'Legacy Early Access' })}` : ` ${$t({ defaultMessage: 'Early Access' })}`
    : ''

  return (
    <Space>
      <div style={{ width: labelSize === 'small' ? 50 : 90 }}>{apModel}</div>
      {versionOptions.length === 0
        // eslint-disable-next-line max-len
        ? <div><span>{noOptionsMessage} &nbsp;<strong>({extremeFirmware}{earlyAccessContent})</strong></span></div>
        : <Select
          value={selectedVersion}
          onChange={onSelectedVersionChange}
          style={{ width: 400 }}
          showSearch
          filterOption={false}
          onSearch={handleSearch}
        >
          {filteredOptions.map(option => <Option key={option.key}>{option.label}</Option>)}
          <Option key={''}>{emptyOptionLabel}</Option>
        </Select>
      }
    </Space>
  )
}
