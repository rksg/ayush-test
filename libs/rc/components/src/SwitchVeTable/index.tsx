import { useState } from 'react'

import { Form, Space } from 'antd'
import _               from 'lodash'
import { useIntl }     from 'react-intl'

import {
  Table,
  TableProps,
  Tooltip,
  Loader,
  Drawer
} from '@acx-ui/components'
import { useGetSwitchRoutedListQuery, useGetVenueRoutedListQuery, useSwitchPortlistQuery } from '@acx-ui/rc/services'
import {
  getSwitchModel,
  isOperationalSwitch,
  SwitchPortViewModel,
  useTableQuery,
  VeViewModel
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

import * as UI          from './styledComponents'
import { SwitchVeForm } from './switchVeForm'


export function SwitchVeTable ({ isVenueLevel } : {
  isVenueLevel: boolean
}) {
  const { $t } = useIntl()
  const { serialNumber } = useParams()


  const defaultPayload = {
    fields: [
      'portNumber',
      'id',
      'switchId',
      'clientVlan',
      'venueId',
      'deviceStatus',
      'veId',
      'syncedSwitchConfig',
      'defaultVlan',
      'veId',
      'vlanId',
      'name',
      'portType',
      'switchName',
      'ipAddress',
      'ipSubnetMask',
      'ingressAclName',
      'egressAclName']
  }


  const tableQuery = useTableQuery({
    useQuery: isVenueLevel ? useGetSwitchRoutedListQuery: useGetSwitchRoutedListQuery,
    defaultPayload,
    sorter: {
      sortField: 'veId',
      sortOrder: 'ASC'
    }
  })

  const columns: TableProps<VeViewModel>['columns'] = [{
    key: 'veId',
    title: $t({ defaultMessage: 'VE' }),
    dataIndex: 'veId',
    sorter: true,
    render: function (data) {
      return `VE-${data}`
    }
  }, {
    key: 'vlanId',
    title: $t({ defaultMessage: 'VLAN ID' }),
    dataIndex: 'vlanId',
    sorter: true
  }, {
    key: 'name',
    title: $t({ defaultMessage: 'Name' }),
    dataIndex: 'name',
    sorter: true
  }, {
    key: 'portType',
    title: $t({ defaultMessage: 'Port Type' }),
    dataIndex: 'portType',
    sorter: true
  }, {
    key: 'switchName',
    title: $t({ defaultMessage: 'Switch' }),
    dataIndex: 'switchName',
    sorter: true
  }, {
    key: 'ipAddress',
    title: $t({ defaultMessage: 'IP Address' }),
    dataIndex: 'ipAddress',
    sorter: true
  }, {
    key: 'ipSubnetMask',
    title: $t({ defaultMessage: 'IP Subnet Mask' }),
    dataIndex: 'ipSubnetMask',
    sorter: true
  }, {
    key: 'ingressAclName',
    title: $t({ defaultMessage: 'Ingress ACL' }),
    dataIndex: 'ingressAclName',
    sorter: true
  }, {
    key: 'egressAclName',
    title: $t({ defaultMessage: 'Egress ACL' }),
    dataIndex: 'egressAclName',
    sorter: true
  }]

  const [deleteButtonTooltip, setDeleteButtonTooltip] = useState('')
  const [disabledDelete, setDisabledDelete] = useState(false)

  const onSelectChange = (keys: React.Key[], rows: VeViewModel[]) => {
    setDeleteButtonTooltip('')
    setDisabledDelete(false)
  }


  const rowActions: TableProps<VeViewModel>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setDrawerVisible(true)
        // setIsEditMode(true)
        // setEditData(selectedRows[0])
        // setVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: disabledDelete,
      tooltip: deleteButtonTooltip,
      onClick: (rows, clearSelection) => {
        let disableDeleteList:string[] = []
        // if ((tableQuery.data?.totalCount === rows.length) &&
        // (type === AAAServerTypeEnum.TACACS || type === AAAServerTypeEnum.RADIUS)) {
        //   disableDeleteList = checkAAASetting(type)
        // }
        if (disableDeleteList.length) {}
        //   showActionModal({
        //     type: 'info',
        //     title: $t({ defaultMessage: '{serverType} Server Required' },
        //       { serverType: $t(serversTypeDisplayText[type]) }),
        //     content: (<FormattedMessage
        //       defaultMessage={`
        //           {serverType} servers are prioritized for the following: <br></br>
        //           {disabledList}. <br></br>
        //           In order to delete {count, plural, one {this} other {these}}
        //           {serverType} {count, plural, one {server} other {servers}}
        //           you must define a different method.
        //         `}
        //       values={{
        //         serverType: $t(serversTypeDisplayText[type]),
        //         disabledList: disableDeleteList.join($t({ defaultMessage: ', ' })),
        //         count: rows.length,
        //         br: () => <br />
        //       }}
        //     />)
        //   })
        // } else {
        //   showActionModal({
        //     type: 'confirm',
        //     customContent: {
        //       action: 'DELETE',
        //       entityName: $t(serversDisplayText[type]),
        //       entityValue: rows.length === 1 ? rows[0].name : undefined,
        //       numOfEntities: rows.length
        //     },
        //     onOk: () => { rows.length === 1 ?
        //       deleteAAAServer({ params: { tenantId, aaaServerId: rows[0].id } })
        //         .then(clearSelection) :
        //       bulkDeleteAAAServer({ params: { tenantId }, payload: rows.map(item => item.id) })
        //         .then(clearSelection)
        //     }
        //   })
        // }


      }
    }
  ]
  const [editMode, setEditMode] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const onClose = () => {
    setDrawerVisible(false)
  }

  const [form] = Form.useForm()

  return <Loader states={[tableQuery]}>
    <Table
      columns={columns}
      dataSource={(tableQuery.data?.data)}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='veId'
      rowActions={rowActions}
      rowSelection={{ type: 'checkbox', onChange: onSelectChange }}
      actions={[{
        label: $t({ defaultMessage: 'Add VLAN interface (VE)' }),
        onClick: () => {setDrawerVisible(true) }
      }]
      }
    />


    <Drawer
      title={$t({ defaultMessage: 'View VLAN' })}
      visible={drawerVisible}
      onClose={onClose}
      width={443}
      footer={
        <Drawer.FormFooter
          buttonLabel={({
            save: editMode ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              form.submit()
              onClose()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
      children={
        <SwitchVeForm
          form={form}

        />}
    />
  </Loader>


}
