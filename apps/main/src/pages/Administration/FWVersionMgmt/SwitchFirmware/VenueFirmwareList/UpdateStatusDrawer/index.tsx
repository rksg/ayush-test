import { useEffect, useState } from 'react'

import { FormattedMessage, useIntl } from 'react-intl'

import {
  Button,
  Table,
  TableProps,
  Loader,
  Drawer,
  Subtitle
} from '@acx-ui/components'
import { useGetSwitchAclsQuery, useGetSwitchFirmwareStatusListQuery, useLazyGetSwitchFirmwareStatusListQuery }                                       from '@acx-ui/rc/services'
import { Acl, FirmwareSwitchVenue, SwitchFirmwareStatus, transformTitleCase, useTableQuery } from '@acx-ui/rc/utils'
import { Typography } from 'antd'
import { parseSwitchVersion } from '../../../FirmwareUtils'

export interface UpdateStatusDrawerProps {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  data: FirmwareSwitchVenue
}


export function UpdateStatusDrawer (props: UpdateStatusDrawerProps) {
  const { $t } = useIntl()
  const [currentRow, setCurrentRow] = useState({} as Acl)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const [switchFimwareStatusList, setSwitchFirmwareStatusList] =
    useState([] as SwitchFirmwareStatus[])

  // eslint-disable-next-line no-console
  console.log(props.data)

  const [ getSwitchFirmwareStatusList ] = useLazyGetSwitchFirmwareStatusListQuery()


  // const tableQuery = useTableQuery({
  //   useQuery: useLazyGetSwitchFirmwareStatusListQuery,
  //   defaultPayload: { venueId: 'test' },
  //   sorter: {
  //     sortField: 'name',
  //     sortOrder: 'ASC'
  //   }
  // })

  // const switchList = record.id
  // ? (await getSwitchList({
  //   params: { tenantId: tenantId }, payload: switchListPayload
  // }, true)).data?.data
  // : []


  const setSwitchList = async () => {
    const switchList = (await getSwitchFirmwareStatusList({
      payload: { venueId: props.data.id }
    }, true)).data?.data
    setSwitchFirmwareStatusList(switchList as unknown as SwitchFirmwareStatus[])
  }

  useEffect(() => {
    if(props.data.id){
      setSwitchList()
    }
  }, [props.data.id])


  const onClose = () => {
    props.setVisible(false)
  }

  const columns: TableProps<SwitchFirmwareStatus>['columns'] = [
    {
      key: 'switchName',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left'
    }, {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: true
    }, {
      key: 'targetFirmware',
      title: $t({ defaultMessage: 'Target Firmware' }),
      dataIndex: 'targetFirmware',
      sorter: true,
      render: function (_, row) {
        if (row.targetFirmware) {
          return parseSwitchVersion(row.targetFirmware)
        } else {
          return '--'
        }
      }
    }
  ]
  return (<Drawer
    title={$t({ defaultMessage: 'Firmware update status' })}
    visible={props.visible}
    onClose={onClose}
    width={580}
    children={<>
      <Typography.Text>
        <b> Venue:</b> {props.data.name}
      </Typography.Text>
      <Table
        columns={columns}
        type={'tall'}
        dataSource={switchFimwareStatusList}
        rowKey='id'
      />
    </>
    }
  />
  )
}
