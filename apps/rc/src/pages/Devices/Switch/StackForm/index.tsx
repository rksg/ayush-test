import { useEffect, useRef, useState } from 'react'

import {
  Col,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Tooltip
} from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'
import { useIntl }           from 'react-intl'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortableElementProps,
  SortableContainerProps
} from 'react-sortable-hoc'

import {
  Button,
  PageHeader,
  Loader,
  StepsForm,
  StepsFormInstance,
  TableProps,
  Table,
  showToast,
  Tabs,
  Alert
} from '@acx-ui/components'
import { DeleteOutlinedIcon, QuestionMarkCircleOutlined, Drag } from '@acx-ui/icons'
import {
  useGetSwitchQuery,
  useSwitchDetailHeaderQuery,
  useLazyGetVlansByVenueQuery,
  useSaveSwitchMutation,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  Switch,
  getSwitchModel,
  SWITCH_SERIAL_PATTERN,
  SwitchTable,
  SwitchStatusEnum,
  isOperationalSwitch
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { SwitchStackSetting }                                          from '../SwitchStackSetting'
import { SwitchUpgradeNotification, SWITCH_UPGRADE_NOTIFICATION_TYPE } from '../SwitchUpgradeNotification'

import {
  TableContainer,
  DisabledDeleteOutlinedIcon,
  RequiredDotSpan,
  StepFormTitle,
  TypographyText
} from './styledComponents'



const defaultPayload = {
  fields: ['name', 'country', 'latitude', 'longitude', 'dhcp', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function StackForm () {
  const { $t } = useIntl()
  const { tenantId, switchId, action } = useParams()
  const editMode = action === 'edit'
  const formRef = useRef<StepsFormInstance<Switch>>()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const modelNotSupportStack = ['ICX7150-C08P', 'ICX7150-C08PT']

  const { data: venuesList, isLoading: isVenuesListLoading } =
    useVenuesListQuery({ params: { tenantId }, payload: defaultPayload })
  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()
  const { data: switchData } =
    useGetSwitchQuery({ params: { tenantId, switchId } }, { skip: action === 'add' })
  const { data: switchDetail } =
    useSwitchDetailHeaderQuery({ params: { tenantId, switchId } }, { skip: action === 'add' })

  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [apGroupOption, setApGroupOption] = useState([] as DefaultOptionType[])

  const [validateModel, setValidateModel] = useState([] as string[])
  const [visibleNotification, setVisibleNotification] = useState(false)
  const [deviceOnline, setDeviceOnline] = useState(false)
  const [isIcx7650, setIsIcx7650] = useState(false)
  const [readOnly, setReadOnly] = useState(false)

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
    if(switchData && switchDetail){
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue({ ...switchData, ...switchDetail })

      console.log(!!switchDetail.model?.includes('ICX7650'))
      setIsIcx7650(!!switchDetail.model?.includes('ICX7650'))
      setReadOnly(!!switchDetail.cliApplied)
      setDeviceOnline(
        isOperationalSwitch(
          switchDetail.deviceStatus as SwitchStatusEnum, switchDetail.syncedSwitchConfig)
      )

      const stackMembers = switchDetail.stackMembers.map((item, index) => {
        const key: string = (index+1).toString()
        formRef?.current?.setFieldValue(`serialNumber${key}`, item.id)
        if(_.get(switchDetail, 'activeSerial') === item.id){
          formRef?.current?.setFieldValue('active', key)
          setActiveRow(key)
        }
        setVisibleNotification(true)
        return {
          ...item,
          key,
          model: `${item.model === undefined ? getSwitchModel(item.id) : item.model}
            ${_.get(switchDetail, 'activeSerial') === item.id ? '(Active)' : ''}`,
          active: _.get(switchDetail, 'activeSerial') === item.id
        }
      })

      stackMembers.sort((a, b) => Number(b.active) - Number(a.active))
      setTableData(stackMembers)
    }
  }, [venuesList, switchData, switchDetail])

  const handleChange = (row: SwitchTable, index: number) => {
    const dataRows = [...tableData]
    const serialNumber = formRef.current?.getFieldValue(
      `serialNumber${row.key}`
    )
    dataRows[index].id = serialNumber
    dataRows[index].model = serialNumber && getSwitchModel(serialNumber)
    setTableData(dataRows)

    const modelList = dataRows
      .filter(
        row => row.model &&
        modelNotSupportStack.indexOf(row.model) === -1)
      .map(row => row.model)
    setValidateModel(modelList)
    setVisibleNotification (modelList.length > 0)
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
        description: values.description,
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
        $t({ defaultMessage:
            'Serial number is invalid since it\'s not unique in stack'
        })
      )
      : Promise.resolve()
  }

  const radioOnChange = (e: RadioChangeEvent) => {
    setActiveRow(e.target.value)
  }

  const DragHandle = SortableHandle(() =>
    <Drag style={{ cursor: 'grab', color: '#6e6e6e' }} />
  )

  const columns: TableProps<SwitchTable>['columns'] = [
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
      show: editMode && !deviceOnline,
      render: (data, row) => {
        return activeRow !== row.key &&
          <div data-testid={`${row.key}_Icon`} style={{ textAlign: 'center' }}>
            <DragHandle/>
          </div>
      }
    },
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
                required: activeRow === row.key ? true : false,
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
              disabled={editMode && (row.key === activeRow || deviceOnline)}
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
      title: $t({ defaultMessage: 'Active' }),
      dataIndex: 'active',
      key: 'active',
      show: !editMode,
      render: function (data, row) {
        return (
          <Form.Item name={'active'} initialValue={activeRow}>
            <Radio.Group onChange={radioOnChange} disabled={editMode}>
              <Radio data-testid={`active${row.key}`} key={row.key} value={row.key} />
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
          disabled={tableData.length <= 1 || (editMode && activeRow === row.key)}
          hidden={deviceOnline}
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

  const [currentTab, setCurrentTab] = useState('details')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  // @ts-ignore
  const SortableItem = SortableElement((props: SortableElementProps) => <tr {...props} />)
  // @ts-ignore
  const SortContainer = SortableContainer((props: SortableContainerProps) => <tbody {...props} />)

  const onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    if(oldIndex !== newIndex) {
      let tempDataSource = [...tableData]
      let movingItem = tempDataSource[oldIndex]
      tempDataSource.splice(oldIndex, 1)
      tempDataSource = [...tempDataSource.slice(0, newIndex),
        ...[movingItem], ...tempDataSource.slice(newIndex, tempDataSource.length)]
      tempDataSource.sort((a, b) => Number(b.active) - Number(a.active))
      setTableData(tempDataSource)
    }
  }
  const DraggableContainer = (props: SortableContainerProps) => {
    return <SortContainer
      useDragHandle
      disableAutoscroll
      onSortEnd={onSortEnd}
      {...props}
    />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DraggableBodyRow = (props: any) => {
    const { className, style, ...restProps } = props
    const index = tableData.findIndex(
      (x) => x.key === restProps['data-row-key']
    )
    return <SortableItem index={index} {...restProps} />
  }

  return (
    <>
      <PageHeader
        title={editMode ?
          $t({ defaultMessage: '{name}' }, { name: switchDetail?.name }):
          $t({ defaultMessage: 'Add Switch Stack' })}
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
            pathname: `${basePath.pathname}/switch`
          })
        }
        buttonLabel={{ submit: editMode ?
          $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <Loader
            states={[
              {
                isLoading: isVenuesListLoading
              }
            ]}
          >
            <Row gutter={20}>
              <Col span={8}>
                <Tabs onChange={onTabChange}
                  activeKey={currentTab}
                  type='line'
                  hidden={!editMode}
                >
                  <Tabs.TabPane tab={$t({ defaultMessage: 'Stack Details' })} key='details' />
                  <Tabs.TabPane tab={$t({ defaultMessage: 'Settings' })} key='settings' />
                </Tabs>
                <div style={{ display: currentTab === 'details' ? 'block' : 'none' }}>
                  {readOnly &&
                  // eslint-disable-next-line max-len
                  <Alert type='info' message={$t({ defaultMessage: 'These settings cannot be changed, since a CLI profile is applied on the venue' })} />}
                  <Form.Item
                    name='venueId'
                    label={$t({ defaultMessage: 'Venue' })}
                    rules={[
                      {
                        required: true,
                        message: $t({ defaultMessage: 'This field is required' })
                      }
                    ]}
                    initialValue={switchDetail?.venueId}
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
                        disabled={editMode}
                      />
                    }
                  />
                  <Form.Item
                    name='name'
                    label={<>{$t({ defaultMessage: 'Stack Name' })}</>}
                    rules={[{ max: 255 }]}
                    children={<Input />}
                    initialValue={switchData?.venueId}
                  />
                  <Form.Item
                    name='description'
                    label={$t({ defaultMessage: 'Description' })}
                    rules={[{ max: 64 }]}
                    initialValue=''
                    children={<Input.TextArea rows={4} maxLength={180} />}
                  />
                  {!editMode && <Form.Item
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
                  }
                  <StepFormTitle>
                    {$t({ defaultMessage: 'Stack Member' })}
                    <RequiredDotSpan> *</RequiredDotSpan>
                  </StepFormTitle>
                  {!editMode && <TypographyText type='secondary'>
                    {
                      $t({
                        defaultMessage:
                        // eslint-disable-next-line max-len
                        'Stack members will be ordered according to the order in which they were entered here. You can always modify this later.'
                      })
                    }
                  </TypographyText>
                  }
                  <TableContainer>
                    <Table
                      columns={columns}
                      dataSource={tableData}
                      type='form'
                      components={{
                        body: {
                          wrapper: DraggableContainer,
                          row: DraggableBodyRow
                        }
                      }}
                    />
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

                  <SwitchUpgradeNotification
                    isDisplay={visibleNotification}
                    isDisplayHeader={false}
                    type={SWITCH_UPGRADE_NOTIFICATION_TYPE.STACK}
                    validateModel={validateModel}
                  />
                </div>

                {editMode && <div style={{ display: currentTab === 'settings' ? 'block' : 'none' }}>
                  <SwitchStackSetting
                    apGroupOption={apGroupOption}
                    readOnly={readOnly}
                  />
                </div>
                }
              </Col>
            </Row>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
