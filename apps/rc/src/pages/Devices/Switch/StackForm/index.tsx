import { useEffect, useRef, useState } from 'react'

import {
  Col,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Switch as AntSwitch,
  Space
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
  StepsFormLegacy,
  StepsFormLegacyInstance,
  TableProps,
  Table,
  Tabs,
  Tooltip,
  Alert
} from '@acx-ui/components'
import { useIsSplitOn, Features }     from '@acx-ui/feature-toggle'
import { DeleteOutlinedIcon, Drag }   from '@acx-ui/icons'
import {
  useGetSwitchQuery,
  useConvertToStackMutation,
  useSaveSwitchMutation,
  useUpdateSwitchMutation,
  useSwitchDetailHeaderQuery,
  useLazyGetVlansByVenueQuery,
  useLazyGetStackMemberListQuery,
  useLazyGetSwitchListQuery,
  useGetSwitchVenueVersionListQuery
} from '@acx-ui/rc/services'
import {
  Switch,
  getSwitchModel,
  SWITCH_SERIAL_PATTERN,
  SwitchTable,
  SwitchStatusEnum,
  isOperationalSwitch,
  SwitchViewModel,
  redirectPreviousPage,
  LocationExtended,
  VenueMessages,
  SwitchRow
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { getTsbBlockedSwitch, showTsbBlockedSwitchErrorDialog }        from '../SwitchForm/blockListRelatedTsb.util'
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
  firmwareType: '',
  firmwareVersion: '',
  search: '', updateAvailable: ''
}

export function StackForm () {
  const { $t } = useIntl()
  const { tenantId, switchId, action, venueId, stackList } = useParams()
  const editMode = action === 'edit'
  const formRef = useRef<StepsFormLegacyInstance<Switch>>()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('/devices/')
  const modelNotSupportStack = ['ICX7150-C08P', 'ICX7150-C08PT']
  const stackSwitches = stackList?.split('_') ?? []
  const isStackSwitches = stackSwitches?.length > 0

  const { data: venuesList, isLoading: isVenuesListLoading } =
  useGetSwitchVenueVersionListQuery({ params: { tenantId }, payload: defaultPayload })
  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()
  const { data: switchData, isLoading: isSwitchDataLoading } =
    useGetSwitchQuery({ params: { tenantId, switchId } }, { skip: action === 'add' })
  const { data: switchDetail, isLoading: isSwitchDetailLoading } =
    useSwitchDetailHeaderQuery({ params: { tenantId, switchId } }, { skip: action === 'add' })
  const [getStackMemberList] = useLazyGetStackMemberListQuery()
  const [getSwitchList] = useLazyGetSwitchListQuery()

  const [previousPath, setPreviousPath] = useState('')
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [apGroupOption, setApGroupOption] = useState([] as DefaultOptionType[])

  const [validateModel, setValidateModel] = useState([] as string[])
  const [visibleNotification, setVisibleNotification] = useState(false)
  const [deviceOnline, setDeviceOnline] = useState(false)
  const [isIcx7650, setIsIcx7650] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [disableIpSetting, setDisableIpSetting] = useState(false)
  const [standaloneSwitches, setStandaloneSwitches] = useState([] as SwitchRow[])
  const [currentFW, setCurrentFw] = useState('')

  const [activeRow, setActiveRow] = useState('1')
  const [rowKey, setRowKey] = useState(2)

  const dataFetchedRef = useRef(false)

  const enableStackUnitLimitationFlag = useIsSplitOn(Features.SWITCH_STACK_UNIT_LIMITATION)
  const enableSwitchStackNameDisplayFlag = useIsSplitOn(Features.SWITCH_STACK_NAME_DISPLAY_TOGGLE)
  const isBlockingTsbSwitch = useIsSplitOn(Features.SWITCH_FIRMWARE_RELATED_TSB_BLOCKING_TOGGLE)

  const defaultArray: SwitchTable[] = [
    { key: '1', id: '', model: '', active: true, disabled: false },
    { key: '2', id: '', model: '', disabled: false }
  ]
  const [tableData, setTableData] = useState(isStackSwitches ? [] : defaultArray)

  useEffect(() => {
    if (!isVenuesListLoading) {
      setVenueOption(
        venuesList?.data?.map((item) => ({
          label: item.name,
          value: item.id
        })) ?? []
      )
    }
    if (switchData && switchDetail && venuesList) {
      if (dataFetchedRef.current) return
      dataFetchedRef.current = true
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue({ ...switchDetail, ...switchData })

      setIsIcx7650(!!switchDetail.model?.includes('ICX7650'))
      setReadOnly(!!switchDetail.cliApplied)
      setDeviceOnline(
        isOperationalSwitch(
          switchDetail.deviceStatus as SwitchStatusEnum, switchDetail.syncedSwitchConfig)
      )

      const switchFw = switchData.firmwareVersion
      const venueFw = venuesList.data.find(
        venue => venue.id === switchData.venueId)?.switchFirmwareVersion?.id
      setCurrentFw(switchFw || venueFw || '')

      if (!!switchDetail.model?.includes('ICX7650')) {
        formRef?.current?.setFieldValue('rearModule',
          formRef.current?.getFieldValue('rearModule') === 'stack-40g')
      }

      if (switchDetail.ipFullContentParsed === false) {
        setDisableIpSetting(true)
      }

      const getStackMembersList = async () => {
        const stackMembersPayload = {
          fields: [
            'activeUnitId',
            'unitId',
            'unitStatus',
            'name',
            'deviceStatus',
            'model',
            'serialNumber',
            'activeSerial',
            'switchMac',
            'ip',
            'venueName',
            'uptime'
          ],
          filters: { activeUnitId: [''] }
        }

        stackMembersPayload.filters.activeUnitId = [switchDetail?.activeSerial || '']
        const stackMembersList = switchDetail?.activeSerial
          ? (await getStackMemberList({
            params: { tenantId, switchId }, payload: stackMembersPayload
          }, true))
          : []

        const stackMembers = _.get(stackMembersList, 'data.data').map(
          (item: { id: string; model: undefined }, index: number) => {
            const key: number = _.get(item, 'unitId') || (index + 1)
            formRef?.current?.setFieldValue(`serialNumber${key}`, item.id)
            if (_.get(switchDetail, 'activeSerial') === item.id) {
              formRef?.current?.setFieldValue('active', key)
              setActiveRow(key.toString())
            }
            setVisibleNotification(true)
            return {
              ...item,
              key,
              model: `${item.model === undefined ? getSwitchModel(item.id) : item.model}
                ${_.get(switchDetail, 'activeSerial') === item.id ? '(Active)' : ''}`,
              active: _.get(switchDetail, 'activeSerial') === item.id,
              disabled: _.get(switchDetail, 'activeSerial') === item.id ||
                !!switchDetail.cliApplied ||
                switchDetail.deviceStatus === SwitchStatusEnum.OPERATIONAL
            }
          })

        setTableData(stackMembers)
        const largestRowKey = stackMembers.reduce(
          (maxUnitId: number, currentItem: { unitId: number }) => {
            const unitId = currentItem.unitId
            return unitId > maxUnitId ? unitId : maxUnitId
          }, stackMembers.length)
        setRowKey(largestRowKey)
      }

      getStackMembersList()
    }
    if (stackSwitches && stackSwitches?.length > 0) {
      const getStandaloneSwitches = async () => {
        const switchListPayload = {
          pageSize: 10000,
          filters: {
            venueId: [venueId],
            isStack: [false],
            deviceStatus: [SwitchStatusEnum.OPERATIONAL],
            syncedSwitchConfig: [true],
            configReady: [true]
          },
          fields: ['isStack', 'formStacking', 'name', 'model', 'serialNumber',
            'deviceStatus', 'syncedSwitchConfig', 'configReady'
          ]
        }
        const switchList = venueId
          ? (await getSwitchList({ params: { tenantId: tenantId }, payload: switchListPayload
          }, true))?.data?.data
          : []

        const switchTableData = stackSwitches?.map((serialNumber, index) => ({
          key: (index + 1).toString(),
          id: serialNumber,
          model: '',
          active: index === 0,
          disabled: false
        })) ?? []

        setStandaloneSwitches(switchList as SwitchRow[])
        setTableData(switchTableData as SwitchTable[])
        setRowKey(stackSwitches?.length ?? 0)
        formRef?.current?.setFieldValue('venueId', venueId)
        stackSwitches?.map((serialNumber, index) => {
          formRef?.current?.setFieldValue(`serialNumber${index + 1}`, serialNumber)
        })
      }

      getStandaloneSwitches()
    }
  }, [venuesList, switchData, switchDetail])

  useEffect(() => {
    if (tableData || activeRow) {
      formRef?.current?.validateFields()
    }
  }, [tableData, activeRow])

  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])

  const handleChange = (row: SwitchTable, index: number) => {
    formRef.current?.validateFields([`serialNumber${row.key}`]).then(() => {
      const dataRows = [...tableData]
      const serialNumber = formRef.current?.getFieldValue(
        `serialNumber${row.key}`
      )?.toUpperCase()
      dataRows[index].id = serialNumber
      dataRows[index].model = serialNumber && getSwitchModel(serialNumber)
      setTableData(dataRows)

      const modelList = dataRows
        .filter(
          row => row.model &&
            modelNotSupportStack.indexOf(row.model) === -1)
        .map(row => row.model)
      setValidateModel(modelList)
      setVisibleNotification(modelList.length > 0)
    }, () => {})
  }

  const handleAddRow = () => {
    const newRowKey = rowKey + 1
    formRef.current?.resetFields([`serialNumber${newRowKey}`])
    setRowKey(newRowKey)
    setTableData([
      ...tableData,
      {
        key: (newRowKey).toString(),
        id: '',
        model: '',
        disabled: false
      }
    ])
  }

  const [saveSwitch] = useSaveSwitchMutation()
  const [updateSwitch] = useUpdateSwitchMutation()
  const [convertToStack] = useConvertToStackMutation()

  const handleAddSwitchStack = async (values: SwitchViewModel) => {
    if (isBlockingTsbSwitch) {
      if (getTsbBlockedSwitch(tableData.map(item=>item.id))?.length > 0) {
        showTsbBlockedSwitchErrorDialog()
        return
      }
    }

    try {
      const payload = {
        name: values.name || '',
        id: formRef.current?.getFieldValue(`serialNumber${activeRow}`),
        description: values.description,
        venueId: values.venueId,
        stackMembers: tableData.filter((item) => item.id !== '').map((item) => ({ id: item.id })),
        enableStack: true,
        jumboMode: false,
        igmpSnooping: 'none',
        spanningTreePriority: '',
        initialVlanId: values?.initialVlanId
      }
      await saveSwitch({ params: { tenantId } , payload }).unwrap()

      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/switch`
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleEditSwitchStack = async (values: Switch) => {
    if (isBlockingTsbSwitch) {
      if (getTsbBlockedSwitch(tableData.map(item => item.id))?.length > 0) {
        showTsbBlockedSwitchErrorDialog()
        return
      }
    }
    if (readOnly) {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/switch`
      })
      return
    }

    try {
      let payload = {
        ...values,
        stackMembers: tableData.map((item) => ({ id: item.id })),
        trustPorts: formRef.current?.getFieldValue('trustPorts')
      }

      if (disableIpSetting) {
        delete payload.ipAddress
        delete payload.subnetMask
        delete payload.defaultGateway
        delete payload.ipAddressType
      }

      if (isIcx7650) {
        payload.rearModule = _.get(payload, 'rearModuleOption') === true ? 'stack-40g' : 'none'
      } else {
        delete payload.rearModule
      }

      await updateSwitch({ params: { tenantId, switchId }, payload }).unwrap()

      dataFetchedRef.current = false

      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/switch`
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleSaveStackSwitches = async (values: SwitchViewModel) => {
    try {
      const activeSwitch = formRef.current?.getFieldValue(`serialNumber${activeRow}`)
      const activeSwitchModel = getSwitchModel(activeSwitch ?? '')
      const isIcx7650 = activeSwitchModel?.includes('ICX7650')
      const payload = {
        name: values.name || '',
        venueId: venueId,
        activeSwitch: activeSwitch,
        memberSwitch: tableData
          ?.filter((item) => item.id && item.id !== activeSwitch)
          ?.map((item) => item.id),
        ...(isIcx7650 && { rearModule: values.rearModuleOption ? 'stack-40g' : 'none' })
      }
      await convertToStack({ params: { tenantId } , payload }).unwrap()
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/switch`
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDelete = (index: number, row: SwitchTable) => {
    const tmpTableData = tableData.filter((item) => item.key !== row.key)
    const largestKey: number = tmpTableData.reduce((maxKey, currentItem) => {
      const key: number = parseInt(currentItem.key, 10)
      return key > maxKey ? key : maxKey
    }, tmpTableData.length)
    setRowKey(largestKey)
    setTableData(tmpTableData)
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
        $t({
          defaultMessage:
            'Serial number is invalid since it\'s not unique in stack'
        })
      )
      : Promise.resolve()
  }

  const radioOnChange = (e: RadioChangeEvent) => {
    setActiveRow(e.target.value)
  }

  const DragHandle = SortableHandle(() =>
    <Drag style={{
      cursor: 'grab', color: '#6e6e6e',
      marginBottom: '5px', verticalAlign: 'middle'
    }} />
  )

  const columns: TableProps<SwitchTable>['columns'] = [
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 50,
      show: editMode,
      render: (_, row) => {
        return (
          <div data-testid={`${row.key}_Icon`}
            style={{
              textAlign: 'center',
              verticalAlign: 'middle'
            }}><DragHandle /></div>
        )
      }
    },
    {
      dataIndex: 'key',
      key: 'key',
      showSorterTooltip: false,
      show: editMode
    },
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
              required: activeRow === row.key ? true : false,
              message: $t({ defaultMessage: 'This field is required' })
            },
            { validator: (_, value) => validatorSwitchModel(value) },
            { validator: (_, value) => validatorUniqueMember(value) }
          ]}
          validateFirst
        >{ isStackSwitches
            ? <Select
              options={standaloneSwitches?.map(s => ({
                label: s.serialNumber, value: s.serialNumber
              }))}
              onChange={value => {
                setTableData(tableData.map(d =>
                  d.key === row.key ? { ...d, id: value } : d
                ))
              }}
            />
            : <Input
              data-testid={`serialNumber${row.key}`}
              onBlur={() => handleChange(row, index)}
              style={{ textTransform: 'uppercase' }}
              disabled={row.disabled}
            />
          }</Form.Item>)
      }
    },
    ...(isStackSwitches && enableSwitchStackNameDisplayFlag ? [{
      title: $t({ defaultMessage: 'Switch Name' }),
      dataIndex: 'name',
      width: 180,
      key: 'name',
      render: function (_: React.ReactNode, row: SwitchTable) {
        const selected = standaloneSwitches.find(s => s.serialNumber === row.id)
        const content = selected?.name || selected?.serialNumber || '--'
        return <div style={{
          width: '180px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>{content}</div>
      }
    }] : []),
    ...(!isStackSwitches ? [{
      title: $t({ defaultMessage: 'Switch Model' }),
      dataIndex: 'model',
      key: 'model',
      render: function (_: React.ReactNode, row: SwitchTable) {
        return <div>{row.model ? row.model : '--'}</div>
      }
    }] : []),
    {
      title: $t({ defaultMessage: 'Active' }),
      dataIndex: 'active',
      key: 'active',
      show: !editMode,
      render: function (_, row) {
        return (
          <Form.Item name={'active'}>
            <Radio.Group onChange={radioOnChange} disabled={row.disabled}>
              <Radio data-testid={`active${row.key}`} key={row.key} value={row.key} />
            </Radio.Group>
          </Form.Item>
        )
      }
    },
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
          disabled={tableData.length <= 1 || (editMode && activeRow === row.key)}
          hidden={row.disabled}
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

    if(venuesList){
      const venueFw = venuesList.data.find(venue => venue.id === value)?.switchFirmwareVersion?.id
      setCurrentFw(venueFw || '')
      const miniMembers = venueFw?.includes('09010h') ? 4 : 2
      setTableData(tableData.splice(0, miniMembers))
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
    if (oldIndex !== newIndex) {
      let tempDataSource = [...tableData]
      let movingItem = tempDataSource[oldIndex]
      tempDataSource.splice(oldIndex, 1)
      tempDataSource = [...tempDataSource.slice(0, newIndex),
        ...[movingItem], ...tempDataSource.slice(newIndex, tempDataSource.length)]
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

  const enableAddMember = () => {
    const switchModel =
      getSwitchModel(formRef.current?.getFieldValue(`serialNumber${activeRow}`))
    if (!enableStackUnitLimitationFlag) {
      return true
    }

    if (switchModel?.includes('ICX7150') || switchModel === 'Unknown') {
      return tableData.length < (currentFW.includes('09010h') ? 4 : 2)
    } else {
      return tableData.length < (currentFW.includes('09010h') ? 8 : 4)
    }
  }

  const getStackUnitsMinLimitaion = () => {
    const switchModel =
      getSwitchModel(formRef.current?.getFieldValue(`serialNumber${activeRow}`))
    return switchModel?.includes('ICX7150') ?
      (currentFW.includes('09010h') ? 4 : 2) :
      (currentFW.includes('09010h') ? 8 : 4)
  }

  return (
    <>
      <PageHeader
        title={editMode ?
          $t({ defaultMessage: '{name}' }, {
            name: switchDetail?.name || switchDetail?.switchName || switchDetail?.serialNumber
          }) :
          $t({ defaultMessage: 'Add Switch Stack' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Switches' }) },
          { text: $t({ defaultMessage: 'Switch List' }), link: '/devices/switch' }
        ]}
      />
      <StepsFormLegacy
        formRef={formRef}
        onFinish={editMode
          ? handleEditSwitchStack
          : (isStackSwitches ? handleSaveStackSwitches : handleAddSwitchStack)
        }
        onCancel={() =>
          redirectPreviousPage(navigate, previousPath, `${basePath.pathname}/switch`)
        }
        buttonLabel={{
          submit: readOnly ? $t({ defaultMessage: 'OK' }) :
            editMode ?
              $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' }),
          cancel: readOnly ? '' : $t({ defaultMessage: 'Cancel' })
        }}
      >
        <StepsFormLegacy.StepForm>
          <Loader
            states={[
              {
                isLoading: isVenuesListLoading || isSwitchDataLoading || isSwitchDetailLoading
              }
            ]}
          >
            <Row gutter={20}>
              <Col span={(isStackSwitches && enableSwitchStackNameDisplayFlag) ? 12 : 10}>

                <Tabs onChange={onTabChange}
                  activeKey={currentTab}
                  type='line'
                  hidden={!editMode}
                >
                  <Tabs.TabPane tab={$t({ defaultMessage: 'Stack Details' })} key='details' />
                  {deviceOnline &&
                    <Tabs.TabPane tab={$t({ defaultMessage: 'Settings' })} key='settings' />}
                </Tabs>
                <div style={{ display: currentTab === 'details' ? 'block' : 'none' }}>
                  {readOnly &&
                    <Alert type='info' message={$t(VenueMessages.CLI_APPLIED)} />}
                  <Col span={14} style={{ padding: '0' }}>
                    <Form.Item
                      name='venueId'
                      label={$t({ defaultMessage: 'Venue' })}
                      rules={[
                        {
                          required: true,
                          message: $t({ defaultMessage: 'This field is required' })
                        }
                      ]}
                      initialValue={null}
                    >
                      <Select
                        options={venueOption}
                        onChange={async (value) => await handleVenueChange(value)}
                        disabled={readOnly || editMode || isStackSwitches}
                      />
                    </Form.Item>
                    <Form.Item
                      name='name'
                      label={<>{$t({ defaultMessage: 'Stack Name' })}</>}
                      rules={[{ max: 255 }]}
                    >
                      <Input disabled={readOnly} />
                    </Form.Item>
                    {!isStackSwitches && <Form.Item
                      name='description'
                      label={$t({ defaultMessage: 'Description' })}
                      rules={[{ max: 64 }]}
                      initialValue={''}
                    ><Input.TextArea rows={4} maxLength={180} disabled={readOnly} /></Form.Item>}
                    {!editMode && !isStackSwitches && <Form.Item
                      name='initialVlanId'
                      label={
                        <>
                          {$t({ defaultMessage: 'DHCP Client' })}
                          <Tooltip.Question
                            title={$t({
                              defaultMessage:
                                // eslint-disable-next-line max-len
                                'DHCP Client interface will only be applied to factory default switches. Switches with pre-existing configuration will not get this change to prevent connectivity loss.'
                            })}
                            placement='bottom'
                          />
                        </>
                      }
                      initialValue={null}
                    >
                      <Select
                        disabled={readOnly || apGroupOption?.length === 0}
                        options={[
                          {
                            label: $t({ defaultMessage: 'Select VLAN...' }),
                            value: null
                          },
                          ...apGroupOption
                        ]}
                      />
                    </Form.Item>
                    }
                    {isIcx7650 &&
                      <Form.Item>
                        <Space style={{ fontSize: '12px', marginRight: '8px' }}>{
                          $t({ defaultMessage: 'Stack with 40G ports on module 3 ' })
                        }</Space>
                        <Form.Item
                          noStyle
                          name='rearModuleOption'
                          valuePropName='checked'
                        >
                          <AntSwitch disabled={editMode} />
                        </Form.Item>
                      </Form.Item>
                    }
                  </Col>
                  <StepFormTitle>
                    {$t({ defaultMessage: 'Stack Member' })}
                    <RequiredDotSpan> *</RequiredDotSpan>
                  </StepFormTitle>
                  {!editMode &&
                    <div style={{ marginBottom: '5px' }}>
                      <TypographyText type='secondary'>
                        {
                          $t({
                            defaultMessage:
                              // eslint-disable-next-line max-len
                              'Stack members will be ordered according to the order in which they were entered here. You can always modify this later.'
                          })
                        }
                      </TypographyText></div>
                  }
                  <Col span={18} style={{ padding: '0' }}>
                    <TableContainer data-testid='dropContainer'>
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
                      {tableData.length < 12 && enableAddMember() && (
                        <Button
                          onClick={handleAddRow}
                          type='link'
                          size='small'
                          disabled={tableData.length >= 12}
                          hidden={readOnly}
                        >
                          {$t({ defaultMessage: 'Add another member' })}
                        </Button>
                      )}
                    </TableContainer>
                  </Col>
                  <SwitchUpgradeNotification
                    switchModel={
                      // eslint-disable-next-line max-len
                      getSwitchModel(formRef.current?.getFieldValue(`serialNumber${activeRow}`))}
                    stackUnitsMinLimitaion={getStackUnitsMinLimitaion()}
                    isDisplay={visibleNotification}
                    isDisplayHeader={false}
                    type={SWITCH_UPGRADE_NOTIFICATION_TYPE.STACK}
                    validateModel={validateModel}
                  />
                </div>
                {editMode &&
                  <>
                    <Form.Item name='id' hidden={true}><Input /></Form.Item>
                    <Form.Item name='firmwareVersion' hidden={true}><Input /></Form.Item>
                    <Form.Item name='trustPorts' hidden={true}><Input /></Form.Item>
                  </>
                }
                <Form.Item name='enableStack' initialValue={true} hidden={true}>
                  <Input /></Form.Item>
                {editMode &&
                  <div style={{ display: currentTab === 'settings' ? 'block' : 'none' }}>
                    <SwitchStackSetting
                      apGroupOption={apGroupOption}
                      readOnly={readOnly}
                      isIcx7650={isIcx7650}
                      disableIpSetting={disableIpSetting}
                    />
                  </div>
                }
              </Col>
            </Row>
          </Loader>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
