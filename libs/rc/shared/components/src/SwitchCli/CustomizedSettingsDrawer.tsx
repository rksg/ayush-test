import { useIntl } from 'react-intl'

import {
  Drawer,
  Table,
  Tooltip
} from '@acx-ui/components'

import { formatContentWithLimit, MAX_LINES, MAX_CONTENT_LENGTH, VariableType } from './CliVariableUtils'
import * as UI                                                                 from './styledComponents'

import { SwitchSettings } from './'

export const CustomizedSettingsDrawer = (props: {
  type: string
  switchSettings: SwitchSettings[],
  switchSettingDrawerVisible: boolean,
  setSwitchSettingDrawerVisible: (visible: boolean) => void,
}) => {
  const { $t } = useIntl()
  const { type, switchSettings, switchSettingDrawerVisible, setSwitchSettingDrawerVisible } = props

  const columns = [{
    title: $t({ defaultMessage: 'Switch' }),
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: type === VariableType.ADDRESS
      ? $t({ defaultMessage: 'IP Address' })
      : (type === VariableType.RANGE
        ? $t({ defaultMessage: 'Value' }) : $t({ defaultMessage: 'String' })
      ),
    dataIndex: 'value',
    key: 'value',
    render: (data: React.ReactNode) => {
      return type !== VariableType.STRING
        ? data
        : <Tooltip title={
          formatContentWithLimit(data as string, MAX_LINES, MAX_CONTENT_LENGTH)
        }
        dottedUnderline>
          <UI.CliVariableContent style={{ maxWidth: '180px' }}>{ data }</UI.CliVariableContent>
        </Tooltip>
    }
  },
  {
    title: 'Venue',
    dataIndex: 'venueName',
    key: 'venueName'
  }]

  return <Drawer
    title={$t({ defaultMessage: 'Switches with their own settings' })}
    visible={switchSettingDrawerVisible}
    onClose={() => setSwitchSettingDrawerVisible(false)}
    width='440px'
    destroyOnClose={true}
  >
    <Table
      rowKey='name'
      type='form'
      style={{ marginTop: '4px' }}
      columns={columns}
      dataSource={switchSettings}
    />
  </Drawer>
}