import { useEffect, useRef, useState } from 'react'

import {
  Col,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Tooltip,
  Typography
} from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import {
  Button,
  PageHeader,
  Loader,
  StepsForm,
  StepsFormInstance,
  TableProps,
  Table,
  showToast
} from '@acx-ui/components'
import { DeleteOutlinedIcon, QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  useLazyGetVlansByVenueQuery,
  useSaveSwitchMutation,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  Switch,
  getSwitchModel,
  SWITCH_SERIAL_PATTERN,
  SwitchTable
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { TableContainer, DisabledDeleteOutlinedIcon } from './styledComponents'

const defaultPayload = {
  fields: ['name', 'country', 'latitude', 'longitude', 'dhcp', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function StackForm () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const formRef = useRef<StepsFormInstance<Switch>>()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const { data: venuesList, isLoading: isVenuesListLoading } =
    useVenuesListQuery({ params: { tenantId }, payload: defaultPayload })

  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()

  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [apGroupOption, setApGroupOption] = useState([] as DefaultOptionType[])

  const [activeRow, setActiveRow] = useState('1')
  const [rowKey, setRowKey] = useState(3)
  const defaultArray: SwitchTable[] = [
    { key: '1', id: '', model: '', active: true },
    { key: '2', id: '', model: '' },
    { key: '3', id: '', model: '' }
  ]
  const [tableData, setTableData] = useState(defaultArray)

  useEffect(() => {
    if (!isVenuesListLoading) {
      setVenueOption(
        venuesList?.data?.map((item) => ({
          label: item.name,
          value: item.id
        })) ?? []
      )
    }
  }, [venuesList])

  const handleChange = (row: SwitchTable, index: number) => {
    const dataRows = [...tableData]
    const serialNumber = formRef.current?.getFieldValue(
      `serialNumber${row.key}`
    )
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
        model: ''
      }
    ])
  }

  const [saveSwitch] = useSaveSwitchMutation()
  const handleAddSwitchStack = async (values: Switch) => {
    try {
      const payload = {
        name: values.name || '',
        id: formRef.current?.getFieldValue(`serialNumber${activeRow}`),
        description: values.venueId,
        venueId: values.venueId,
        stackMembers: tableData.map((item) => ({ id: item.id })),
        enableStack: true,
        jumboMode: false,
        igmpSnooping: 'none',
        spanningTreePriority: '',
        initialVlanId: values.initialVlanId
      }
      await saveSwitch({ params: { tenantId } , payload }).unwrap()

      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/switch`
      })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: '{message}' }, { message: e.data.errors[0].message })
      })
    }
  }

  const handleDelete = (index: number, row: SwitchTable) => {
    setTableData(tableData.filter((item) => item.key !== row.key))
  }

  const validatorSwitchModel = (serialNumber: string) => {
    const re = new RegExp(SWITCH_SERIAL_PATTERN)
    if (serialNumber && !re.test(serialNumber)) {
      return Promise.reject($t({ defaultMessage: 'Serial number is invalid' }))
    }

    const modelNotSupportStack = ['ICX7150-C08P', 'ICX7150-C08PT']
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
    const memberExistCount = tableData.filter((item: SwitchTable) => {
      return item.id === serialNumber
    }).length
    return memberExistCount > 1
      ? Promise.reject(
        $t({
          defaultMessage:
              "Serial number is invalid since it's not unique in stack"
        })
      )
      : Promise.resolve()
  }

  const radioOnChange = (e: RadioChangeEvent) => {
    setActiveRow(e.target.value)
  }

  const columns: TableProps<SwitchTable>['columns'] = [
    {
      dataIndex: 'key',
      key: 'key',
      render: (id, record, index) => {
        return index + 1
      },
      showSorterTooltip: false
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: function (data, row, index) {
        return (
          <Form.Item
            name={`serialNumber${row.key}`}
            rules={[
              {
                required: true,
                message: $t({ defaultMessage: 'This field is required' })
              },
              { validator: (_, value) => validatorSwitchModel(value) },
              { validator: (_, value) => validatorUniqueMember(value) }
            ]}
          >
            <Input
              data-testid={`serialNumber${row.key}`}
              onChange={() => handleChange(row, index)}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Switch Model' }),
      dataIndex: 'model',
      key: 'model',
      render: function (data) {
        return <div>{data ? data : '--'}</div>
      }
    },
    {
      title: $t({ defaultMessage: 'Action' }),
      dataIndex: 'active',
      key: 'active',
      render: function (data, row) {
        return (
          <Form.Item name={'active'} initialValue={activeRow}>
            <Radio.Group onChange={radioOnChange}>
              <Radio data-testId={`active${row.key}`} key={row.key} value={row.key} />
            </Radio.Group>
          </Form.Item>
        )
      }
    },
    {
      key: 'action',
      dataIndex: 'action',
      render: (data, row, index) => (
        <Button
          data-testId={`deleteBtn${row.key}`}
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
          style={{ height: '16px' }}
          disabled={tableData.length <= 1}
          onClick={() => handleDelete(index, row)}
        />
      )
    }
  ]

  const getApGroupOptions = async (venueId: string) => {
    const list = venueId
      ? (await getVlansByVenue({ params: { tenantId, venueId } }, true)).data
      : []

    return (
      venueId &&
      list &&
      list.map((item) => ({
        label: item.vlanId,
        value: item.vlanId
      }))
    )
  }

  const handleVenueChange = async (value: string) => {
    const options = (await getApGroupOptions(value)) || []
    if (options.length === 0) {
      formRef.current?.setFieldValue('initialVlanId', null)
    }
    setApGroupOption(options as DefaultOptionType[])
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Switch Stack' })}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Switches' }),
            link: '/devices/switch'
          }
        ]}
      />
      <StepsForm
        formRef={formRef}
        onFinish={handleAddSwitchStack}
        onCancel={() =>
          navigate({
            ...basePath,
            pathname: `${basePath.pathname}/wifi`
          })
        }
        buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <Loader
                states={[
                  {
                    isLoading: isVenuesListLoading
                  }
                ]}
              >
                <Form.Item
                  name='venueId'
                  label={$t({ defaultMessage: 'Venue' })}
                  initialValue={null}
                  rules={[
                    {
                      required: true,
                      message: $t({ defaultMessage: 'This field is required' })
                    }
                  ]}
                  children={
                    <Select
                      options={[
                        {
                          label: $t({ defaultMessage: 'Select venue...' }),
                          value: null
                        },
                        ...venueOption
                      ]}
                      onChange={async (value) => await handleVenueChange(value)}
                    />
                  }
                />
                <Form.Item
                  name='name'
                  label={<>{$t({ defaultMessage: 'Stack Name' })}</>}
                  rules={[{ max: 255 }]}
                  children={<Input />}
                />
                <Form.Item
                  name='description'
                  label={$t({ defaultMessage: 'Description' })}
                  rules={[{ max: 64 }]}
                  initialValue=''
                  children={<Input.TextArea rows={4} maxLength={180} />}
                />
                <Form.Item
                  name='initialVlanId'
                  label={
                    <>
                      {$t({ defaultMessage: 'DHCP Client' })}
                      <Tooltip
                        title={$t({
                          defaultMessage:
                            // eslint-disable-next-line max-len
                            'DHCP Client interface will only be applied to factory default switches. Switches with pre-existing configuration will not get this change to prevent connectivity loss.'
                        })}
                        placement='bottom'
                      >
                        <QuestionMarkCircleOutlined />
                      </Tooltip>
                    </>
                  }
                  initialValue={null}
                  rules={[
                    {
                      required: apGroupOption?.length === 0 ? false : true,
                      message: $t({ defaultMessage: 'This field is required' })
                    }
                  ]}
                  children={
                    <Select
                      disabled={apGroupOption?.length === 0}
                      options={[
                        {
                          label: $t({ defaultMessage: 'Select VLAN...' }),
                          value: null
                        },
                        ...apGroupOption
                      ]}
                    />
                  }
                />
                <StepsForm.Title style={{ marginBottom: '0' }}>
                  {$t({ defaultMessage: 'Stack Member' })}
                  <span style={{ color: 'red' }}> *</span>
                </StepsForm.Title>
                <Typography.Text
                  type='secondary'
                  style={{ marginBottom: '20px', fontSize: '10px' }}
                >
                  {
                    $t({
                      defaultMessage:
                        // eslint-disable-next-line max-len
                        'Stack members will be ordered according to the order in which they were entered here. You can always modify this later.'
                    })
                  }
                </Typography.Text>
                <TableContainer>
                  <Table columns={columns} dataSource={tableData} type='form' />
                  {tableData.length < 12 && (
                    <Button
                      onClick={handleAddRow}
                      type='link'
                      size='small'
                      disabled={tableData.length >= 12}
                    >
                      {$t({ defaultMessage: 'Add another member' })}
                    </Button>
                  )}
                </TableContainer>
              </Loader>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}