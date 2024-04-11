import { useState } from 'react'

import { Select, Space } from 'antd'
import { useIntl }       from 'react-intl'

const { Option } = Select


export interface ApFirmwareUpdateIndividualProps {
  apModel: string
  versionOptions: { key: string, label: string }[]
  update: (apModel: string, version: string) => void
  defaultVersion: string
}

export function ApFirmwareUpdateIndividual (props: ApFirmwareUpdateIndividualProps) {
  const { $t } = useIntl()
  const { apModel, versionOptions, update, defaultVersion } = props
  const [ selectedVersion, setSelectedVersion ] = useState(defaultVersion)

  const onSelectedVersionChange = (value: string) => {
    setSelectedVersion(value)
    update(apModel, value)
  }

  return (
    <Space>
      <div style={{ width: 45 }}>{apModel}</div>
      <Select onChange={onSelectedVersionChange} value={selectedVersion} style={{ width: 400 }}>
        {versionOptions.map(option => <Option key={option.key}>{option.label}</Option>)}
        <Option key={''}>{$t({ defaultMessage: 'Do not update firmware' })}</Option>
      </Select>
    </Space>
  )
}
