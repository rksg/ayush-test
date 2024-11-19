import { useIntl } from 'react-intl'

import {
  Drawer,
  Table,
  Tooltip,
  TableProps
} from '@acx-ui/components'
import { defaultSort, sortProp } from '@acx-ui/rc/utils'


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

  const columns: TableProps<SwitchSettings>['columns'] = [{
    title: $t({ defaultMessage: 'Switch' }),
    dataIndex: 'name',
    key: 'name',
    sorter: { compare: sortProp('name', defaultSort) },
    defaultSortOrder: 'ascend'
  },
  {
    title: type === VariableType.ADDRESS
      ? $t({ defaultMessage: 'IP Address' })
      : (type === VariableType.RANGE
        ? $t({ defaultMessage: 'Value' }) : $t({ defaultMessage: 'String' })
      ),
    dataIndex: 'value',
    key: 'value',
    sorter: { compare: sortProp('value', defaultSort) },
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
    title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
    dataIndex: 'venueName',
    key: 'venueName',
    sorter: { compare: sortProp('venueName', defaultSort) }
  }]

  return <Drawer
    title={$t({ defaultMessage: 'Switches with custom settings' })}
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