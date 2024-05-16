import { useState } from 'react'

import { Select, Space } from 'antd'
import { useIntl }       from 'react-intl'

const { Option } = Select


interface UpdateFirmwarePerApModelIndividualProps {
  apModel: string
  versionOptions: { key: string, label: string }[]
  update: (apModel: string, version: string) => void
  defaultVersion: string
  labelSize?: 'small' | 'large'
}

// eslint-disable-next-line max-len
export function UpdateFirmwarePerApModelIndividual (props: UpdateFirmwarePerApModelIndividualProps) {
  const { $t } = useIntl()
  const { apModel, versionOptions, update, defaultVersion, labelSize = 'small' } = props
  const [ selectedVersion, setSelectedVersion ] = useState(defaultVersion)

  const onSelectedVersionChange = (value: string) => {
    setSelectedVersion(value)
    update(apModel, value)
  }

  return (
    <Space>
      <div style={{ width: labelSize === 'small' ? 50 : 90 }}>{apModel}</div>
      <Select onChange={onSelectedVersionChange} value={selectedVersion} style={{ width: 400 }}>
        {versionOptions.map(option => <Option key={option.key}>{option.label}</Option>)}
        <Option key={''}>{$t({ defaultMessage: 'Do not update firmware' })}</Option>
      </Select>
    </Space>
  )
}
