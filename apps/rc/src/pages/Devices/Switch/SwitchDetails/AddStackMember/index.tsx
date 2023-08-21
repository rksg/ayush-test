/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import {
  Form,
  FormInstance,
  Input
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Drawer, Table, Button, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { DeleteOutlinedIcon }                from '@acx-ui/icons'
import {
  useUpdateSwitchMutation,
  useSwitchDetailHeaderQuery,
  useGetSwitchQuery
} from '@acx-ui/rc/services'
import { Switch, SwitchTable, SWITCH_SERIAL_PATTERN, getSwitchModel, SWITCH_SERIAL_PATTERN_SUPPORT_RODAN } from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'


import { getTsbBlockedSwitch, showTsbBlockedSwitchErrorDialog } from '../../SwitchForm/blockListRelatedTsb.util'

import {
  TableContainer,
  DisabledDeleteOutlinedIcon
} from './styledComponents'

export interface AddStackMemberProps {
  visible: boolean
  setVisible: (v: boolean) => void
}

export default function AddStackMember (props: AddStackMemberProps) {
  const { $t } = useIntl()
  const { visible, setVisible } = props
  const [form] = Form.useForm<Switch>()

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
}

function AddMemberForm (props: DefaultVlanFormProps) {
  const { $t } = useIntl()
  const { tenantId, switchId, stackList } = useParams()
  const { form } = props
  const modelNotSupportStack = ['ICX7150-C08P', 'ICX7150-C08PT']
  const stackSwitches = stackList?.split('_') ?? []
  const isStackSwitches = stackSwitches?.length > 0
  const [rowKey, setRowKey] = useState(1)
  const [maxMembers, setMaxMembers] = useState(12)

  const [updateSwitch] = useUpdateSwitchMutation()
  const { data: switchData } =
    useGetSwitchQuery({ params: { tenantId, switchId } })
  const { data: switchDetail } =
    useSwitchDetailHeaderQuery({ params: { tenantId, switchId } })

  const defaultArray: SwitchTable[] = [
    { key: '1', id: '', model: '', disabled: false }
  ]
  const [tableData, setTableData] = useState(defaultArray)

  const isSupportIcx8200 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200)
  const isBlockingTsbSwitch = useIsSplitOn(Features.SWITCH_FIRMWARE_RELATED_TSB_BLOCKING_TOGGLE)

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
            { validator: (_, value) => validatorSwitchModel(value) },
            { validator: (_, value) => validatorUniqueMember(value) }
          ]}
          validateFirst
        ><Input
            data-testid={`serialNumber${row.key}`}
            onBlur={() => handleChange(row, index)}
            style={{ textTransform: 'uppercase' }}
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
          icon={
            tableData.length <= 1 ? (
              <DisabledDeleteOutlinedIcon />
            ) : (
              <DeleteOutlinedIcon />
            )
          }
          disabled={tableData.length <= 1}
          hidden={row.disabled}
          onClick={() => handleDelete(index, row)}
        />
      )
    }
  ]

  useEffect(() => {
    if(switchDetail?.stackMembers){
      setMaxMembers(12 - switchDetail?.stackMembers.length)
    }
  }, [form, switchDetail])

  const validatorSwitchModel = (serialNumber: string) => {
    const re = isSupportIcx8200 ? new RegExp(SWITCH_SERIAL_PATTERN_SUPPORT_RODAN)
      : new RegExp(SWITCH_SERIAL_PATTERN)
    if (serialNumber && !re.test(serialNumber)) {
      return Promise.reject($t({ defaultMessage: 'Serial number is invalid' }))
    }

    const model = getSwitchModel(serialNumber) || ''

    return modelNotSupportStack.indexOf(model) > -1
      ? Promise.reject(
        $t({
          defaultMessage:
            "Serial number is invalid since it's not support stacking"
        })
      )
      : Promise.resolve()
  }

  const validatorUniqueMember = (serialNumber: string) => {
    const member = switchDetail?.stackMembers || []
    const memberExistCount = member.concat(tableData).filter((item) => {
      return item.id === serialNumber
    }).length
    return memberExistCount > 1
      ? Promise.reject(
        $t({
          defaultMessage:
            'Serial number is invalid since it\'s not unique in stack'
        })
      )
      : Promise.resolve()
  }

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
    if (isBlockingTsbSwitch) {
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
          ...(switchDetail?.stackMembers.map((item) => ({ id: item.id })) ?? []),
          ...tableData.map((item) => ({ id: item.id }))
        ]
      }
      let stackPayload = _.omit(payload, [
        'dhcpClientEnabled', 'dhcpServerEnabled', 'ipAddressInterface', 'ipAddressInterfaceType', 'rearModule'])

      if (switchDetail?.ipFullContentParsed === false) {
        stackPayload = _.omit(payload, [
          'ipAddress', 'subnetMask', 'defaultGateway', 'ipAddressType'])
      }

      await updateSwitch({ params: { tenantId, switchId }, payload: stackPayload }).unwrap()
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
