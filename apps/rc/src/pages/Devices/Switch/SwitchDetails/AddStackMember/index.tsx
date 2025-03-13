/* eslint-disable max-len */
import { useContext, useState } from 'react'

import {
  Form,
  FormInstance,
  Input
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Drawer, Table, Button, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { DeleteOutlined }                    from '@acx-ui/icons-new'
import {
  useUpdateSwitchMutation,
  useGetSwitchQuery
} from '@acx-ui/rc/services'
import {
  Switch,
  SwitchTable,
  getSwitchModel,
  checkVersionAtLeast09010h,
  SwitchViewModel,
  convertInputToUppercase
} from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'

import { SwitchDetailsContext }                        from '..'
import { validatorSwitchModel, validatorUniqueMember } from '../../StackForm'
import {
  getTsbBlockedSwitch,
  showTsbBlockedSwitchErrorDialog
} from '../../SwitchForm/blockListRelatedTsb.util'

import {
  TableContainer
} from './styledComponents'

import type { SwitchModelParams } from '../../StackForm'

export interface AddStackMemberProps {
  visible: boolean
  setVisible: (v: boolean) => void
  maxMembers: number
  venueFirmwareVersion: string
}

export default function AddStackMember (props: AddStackMemberProps) {
  const { $t } = useIntl()
  const { visible, setVisible, maxMembers, venueFirmwareVersion } = props
  const [form] = Form.useForm<Switch>()

  const { switchDetailsContextData } = useContext(SwitchDetailsContext)
  const { switchDetailHeader, switchQuery, switchDetailViewModelQuery } = switchDetailsContextData

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Member to Stack' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      width={400}
      children={
        <AddMemberForm
          form={form}
          maxMembers={maxMembers}
          switchDetail={switchDetailHeader}
          venueFirmwareVersion={venueFirmwareVersion}
        />
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Add' })
          }}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              form.submit()
              onClose()

              setTimeout(() => {
                switchDetailViewModelQuery?.refetch()
                switchQuery?.refetch()
              }, 1500)

            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    />
  )
}

interface DefaultVlanFormProps {
  form: FormInstance<Switch>
  maxMembers: number
  switchDetail: SwitchViewModel
  venueFirmwareVersion: string
}

function AddMemberForm (props: DefaultVlanFormProps) {
  const { $t } = useIntl()
  const { tenantId, switchId, stackList } = useParams()
  const { form, maxMembers, switchDetail, venueFirmwareVersion } = props
  const stackSwitches = stackList?.split('_') ?? []
  const isStackSwitches = stackSwitches?.length > 0
  const [rowKey, setRowKey] = useState(1)

  const [updateSwitch] = useUpdateSwitchMutation()

  const defaultArray: SwitchTable[] = [
    { key: '1', id: '', model: '', disabled: false }
  ]
  const [tableData, setTableData] = useState(defaultArray)

  const isBlockingTsbSwitch = useIsSplitOn(Features.SWITCH_FIRMWARE_RELATED_TSB_BLOCKING_TOGGLE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSupport8200AV = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200AV)
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)
  const isSupport8100X = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100X)

  const { data: switchData } =
    useGetSwitchQuery({
      params: { tenantId, switchId, venueId: switchDetail?.venueId },
      enableRbac: isSwitchRbacEnabled
    }, {
      skip: !switchDetail?.venueId
    })

  const columns: TableProps<SwitchTable>['columns'] = [
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: function (_, row, index) {
        return (<Form.Item
          name={`serialNumber${row.key}`}
          validateTrigger={['onKeyUp', 'onFocus', 'onBlur']}
          rules={[
            {
              required: true,
              message: $t({ defaultMessage: 'This field is required' })
            },
            { validator: (_, value) => {
              const switchModelParams: SwitchModelParams = {
                serialNumber: value,
                isSupport8200AV: isSupport8200AV,
                isSupport8100: isSupport8100,
                isSupport8100X: isSupport8100X,
                activeSerialNumber: switchDetail?.activeSerial
              }
              return validatorSwitchModel(switchModelParams)}
            },
            { validator: (_, value) => validatorUniqueMember(value, [
              ...tableData.map(d => ({ id: (d.key === row.key) ? value : d.id })),
              ...(switchData?.stackMembers || [])
            ]) }
          ]}
          validateFirst
        ><Input
            data-testid={`serialNumber${row.key}`}
            onBlur={() => handleChange(row, index)}
            onInput={convertInputToUppercase}
            disabled={row.disabled}
          />
        </Form.Item>)
      }
    },
    ...(!isStackSwitches ? [{
      title: $t({ defaultMessage: 'Switch Model' }),
      dataIndex: 'model',
      key: 'model',
      render: function (_: React.ReactNode, row: SwitchTable) {
        return <div>{row.model ? row.model : '--'}</div>
      }
    }] : []),
    {
      key: 'action',
      dataIndex: 'action',
      render: (_, row, index) => (
        <Button
          data-testid={`deleteBtn${row.key}`}
          type='link'
          key='delete'
          role='deleteBtn'
          icon={<DeleteOutlined size='sm' />}
          disabled={tableData.length <= 1}
          hidden={row.disabled}
          onClick={() => handleDelete(index, row)}
        />
      )
    }
  ]

  const handleDelete = (index: number, row: SwitchTable) => {
    setTableData(tableData.filter((item) => item.key !== row.key))
  }

  const handleChange = (row: SwitchTable, index: number) => {
    const dataRows = [...tableData]
    const serialNumber = form.getFieldValue(
      `serialNumber${row.key}`
    )?.toUpperCase()
    dataRows[index].id = serialNumber
    dataRows[index].model = serialNumber && getSwitchModel(serialNumber)
    setTableData(dataRows)
  }

  const handleAddRow = () => {
    setRowKey(rowKey + 1)
    setTableData([
      ...tableData,
      {
        key: (rowKey + 1).toString(),
        id: '',
        model: '',
        disabled: false
      }
    ])
  }

  const onSaveStackMember = async () => {
    if (!checkVersionAtLeast09010h(venueFirmwareVersion) && isBlockingTsbSwitch) {
      if (getTsbBlockedSwitch(tableData.map(item=>item.id))?.length > 0) {
        showTsbBlockedSwitchErrorDialog()
        return
      }
    }
    try {
      const payload = {
        ...switchData,
        enableStack: true,
        spanningTreePriority: switchData?.spanningTreePriority || '', //Backend need the default value
        stackMembers: [
          ...(switchData?.stackMembers?.map((item) => ({ id: item.id })) ?? []),
          ...tableData.map((item) => ({ id: item.id }))
        ]
      }
      let stackPayload = _.omit(payload, [
        'dhcpClientEnabled', 'dhcpServerEnabled', 'ipAddressInterface', 'ipAddressInterfaceType', 'rearModule'])

      if (switchDetail?.ipFullContentParsed === false) {
        stackPayload = _.omit(payload, [
          'ipAddress', 'subnetMask', 'defaultGateway', 'ipAddressType'])
      }

      await updateSwitch({
        params: { tenantId, switchId, venueId: switchDetail.venueId },
        payload: stackPayload,
        enableRbac: isSwitchRbacEnabled
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Form
      layout='vertical'
      form={form}
      onFinish={() => {
        onSaveStackMember()
        form.resetFields()
      }}
    >
      <TableContainer data-testid='dropContainer'>
        <Table
          columns={columns}
          dataSource={tableData}
          type='form'
        />
        {tableData.length < maxMembers && (
          <Button
            onClick={handleAddRow}
            type='link'
            size='small'
          >
            {$t({ defaultMessage: 'Add another member' })}
          </Button>
        )}
      </TableContainer>
    </Form>
  )
}
