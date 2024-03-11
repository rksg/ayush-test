import { useState } from 'react'

import { Radio, RadioChangeEvent, Space } from 'antd'
import { DefaultOptionType }              from 'antd/lib/select'
import { useIntl }                        from 'react-intl'

import { Tooltip, cssStr } from '@acx-ui/components'

import * as UI from '../styledComponents'

export interface ApFirmwareUpdateGroupProps {
  apModels: string[]
  versionOptions: DefaultOptionType[]
  update: (apModels: string[], version: string | undefined) => void
  defaultVersion: string
}

export function ApFirmwareUpdateGroup (props: ApFirmwareUpdateGroupProps) {
  const { $t } = useIntl()
  const { apModels, versionOptions, update, defaultVersion } = props
  // eslint-disable-next-line max-len
  const [ selectedVersion, setSelectedVersion ] = useState(defaultVersion)

  const onSelectedVersionChange = (e: RadioChangeEvent) => {
    setSelectedVersion(e.target.value)
    update(apModels, e.target.value)
  }

  return (<>
    <GroupTitle apModels={apModels} />
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
          <Radio key={'NONE'} value={''}>
            {$t({ defaultMessage: 'Do not update firmware on selected venue(s)' })}
          </Radio>
        </Space>
      </Radio.Group>
    </UI.ValueContainer>
  </>)
}

function GroupTitle (props: { apModels: string[] }) {
  const { $t } = useIntl()
  const { apModels } = props
  const isMoreDevicesTooltipShown = apModels.length > 2
  const apModelsForDisplay = isMoreDevicesTooltipShown
    ? apModels.slice(0, 2).join(', ') + '...'
    : apModels.join(', ')

  return <Space>
    <UI.TitleActive>
      {$t({ defaultMessage: 'Available firmware for devices {apModels}' },
        { apModels: apModelsForDisplay })}
    </UI.TitleActive>
    {isMoreDevicesTooltipShown &&
      <Tooltip
        children={
          <div style={{ color: cssStr('--acx-accents-blue-50') }}>
            {$t({ defaultMessage: 'See more devices' })}
          </div>
        }
        title={
          <ul>{apModels.map(apModel => <li key={apModel}>{apModel}</li>)}</ul>
        }
      />
    }
  </Space>
}
