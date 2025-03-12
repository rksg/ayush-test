import { useState } from 'react'

import { Radio, RadioChangeEvent, Space } from 'antd'
import { DefaultOptionType }              from 'antd/lib/select'
import { useIntl }                        from 'react-intl'

import * as UI                   from '../styledComponents'
import { ExpandableApModelList } from '../venueFirmwareListPerApModelUtils'

interface UpdateFirmwarePerApModelGroupProps {
  apModels: string[]
  versionOptions: DefaultOptionType[]
  update: (apModels: string[], version: string | undefined) => void
  defaultVersion: string
}

export function UpdateFirmwarePerApModelGroup (props: UpdateFirmwarePerApModelGroupProps) {
  const { $t } = useIntl()
  const { apModels, versionOptions, update, defaultVersion } = props
  const [ selectedVersion, setSelectedVersion ] = useState(defaultVersion)

  const onSelectedVersionChange = (e: RadioChangeEvent) => {
    setSelectedVersion(e.target.value)
    update(apModels, e.target.value)
  }

  const generateLabelWrapper = (apModelsForDisplay: string) => {
    return <UI.TitleActive>
      {$t({ defaultMessage: 'Available firmware for devices {apModels}' },
        { apModels: apModelsForDisplay })}
    </UI.TitleActive>
  }

  return (<>
    <ExpandableApModelList apModels={apModels} generateLabelWrapper={generateLabelWrapper} />
    <UI.ValueContainer>
      <Radio.Group
        onChange={onSelectedVersionChange}
        value={selectedVersion}
      >
        <Space direction={'vertical'} size={12}>
          { versionOptions.map(versionOption => {
            return <Radio key={versionOption.value} value={versionOption.value}>
              {versionOption.label}
            </Radio>
          })
          }
          <Radio key={'NONE'} value={''}>{ /*eslint-disable-next-line max-len*/ }
            {$t({ defaultMessage: 'Do not update firmware on selected <venuePlural></venuePlural>' })}
          </Radio>
        </Space>
      </Radio.Group>
    </UI.ValueContainer>
  </>)
}
