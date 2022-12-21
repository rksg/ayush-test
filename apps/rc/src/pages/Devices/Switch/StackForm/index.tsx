import { ReactNode, useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row, Select, Tooltip } from 'antd'
import { DefaultOptionType }                      from 'antd/lib/select'
import { useIntl }                                from 'react-intl'

import {
  Button,
  PageHeader,
  Loader,
  StepsForm,
  StepsFormInstance,
  TableProps,
  Table
} from '@acx-ui/components'
import { DeleteOutlinedIcon, QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  useGetApQuery,
  useLazyGetVlansByVenueQuery,
  useVenuesListQuery,
  useWifiCapabilitiesQuery } from '@acx-ui/rc/services'
import {
  ApDeep,
  checkObjectNotExists,
  checkValues,
  VenueExtended,
  SwitchStack,
  WifiNetworkMessages
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { validationMessages } from '@acx-ui/utils'

const defaultPayload = {
  fields: ['name', 'country', 'latitude', 'longitude', 'dhcp', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export interface ModelOption {
  label: string
  value: string
}

let key = 1
export function StackForm () {
  const { $t } = useIntl()
  const { tenantId, action, serialNumber } = useParams()
  const formRef = useRef<StepsFormInstance<ApDeep>>()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const { data: venuesList, isLoading: isVenuesListLoading }
    = useVenuesListQuery({ params: { tenantId }, payload: defaultPayload })
  const { data: apDetails, isLoading: isApDetailsLoading }
    = useGetApQuery({ params: { tenantId, serialNumber: serialNumber ? serialNumber : '' } })
  const wifiCapabilities = useWifiCapabilitiesQuery({ params: { tenantId } })

  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()

  const isEditMode = action === 'edit'
  const [selectedVenue, setSelectedVenue] = useState({} as unknown as VenueExtended)
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [apGroupOption, setApGroupOption] = useState([] as DefaultOptionType[])

  const [cellularApModels, setCellularApModels] = useState([] as string[])

  useEffect(() => {
    if (!wifiCapabilities.isLoading) {
      setCellularApModels(wifiCapabilities?.data?.apModels
        ?.filter(apModel => apModel.canSupportCellular)
        .map(apModel => apModel.model) ?? [])
    }
  }, [wifiCapabilities])

  useEffect(() => {
    if (isEditMode && !isVenuesListLoading && !isApDetailsLoading && apDetails) {
      const setData = async (apDetails: ApDeep) => {
        const selectVenue = getVenueById(
          venuesList?.data as unknown as VenueExtended[], apDetails.venueId)
        const options = await getApGroupOptions(apDetails.venueId)

        setSelectedVenue(selectVenue as unknown as VenueExtended)
        setApGroupOption(options as DefaultOptionType[])
      }

      setData(apDetails)
    }
  }, [apDetails, venuesList])

  useEffect(() => {
    if (!isVenuesListLoading) {
      setVenueOption(venuesList?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])
    }
  }, [venuesList])

  const handleAddSwitchStack = async (values: SwitchStack) => {
  }

  const handleUpdateSwitchStack = async (values: SwitchStack) => {
  }

  const defaultArray: SwitchStack[] = []
  const [tableData, setTableData] = useState(defaultArray)

  const handleChange = (data: ReactNode, row: any, index: number) => {
    const dataRows = [...tableData]
    const serialNumber = formRef.current?.getFieldValue(`serialNumber${row.key}`)
    dataRows[index].model = serialNumber
    setTableData(dataRows)
  }

  const handleAdd = () => {
    setTableData([...tableData, {
      key: (key++).toString(),
      id: '',
      activeSerial: '',
      venueName: '',
      serialNumber: '',
      model: ''
    }])
  }

  const handleDelete = (index: any, row: any) => {
    setTableData(tableData.filter(item => item.key !== row.key))
  }

  const columns: TableProps<SwitchStack>['columns'] = [{
    dataIndex: 'key',
    key: 'key',
    render: (id, record, index) => { return index+1 },
    showSorterTooltip: false
  }, {
    title: $t({ defaultMessage: 'Serial Number' }),
    dataIndex: 'switch',
    key: 'switch',
    width: 200,
    render: function (data, row, index) {
      return <Form.Item
        name={`serialNumber${row.key}`}
        rules={[{
          required: true
        }]}
      >
        <Input onChange={() => handleChange(data, row, index)}/>
      </Form.Item>
    }
  }, {
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'model',
    key: 'model',
    render: function (data) {
      return <div>{data}</div>
    }
  }, {
    key: 'action',
    dataIndex: 'action',
    render: (data, row, index) => <Button
      key='delete'
      role='deleteBtn'
      ghost={true}
      icon={<DeleteOutlinedIcon />}
      style={{ height: '16px' }}
      onClick={() => handleDelete(index, row)}
    />
  }]

  const getApGroupOptions = async (venueId: string) => {
    const list = venueId
      ? (await getVlansByVenue({ params: { tenantId, venueId } }, true)).data
      : []

    return venueId && list &&
      list.map((item) => ({
        label: item.vlanId,
        value: item.vlanId
      }))
  }

  const handleVenueChange = async (value: string) => {
    const selectVenue = getVenueById(venuesList?.data as unknown as VenueExtended[], value)
    const options = await getApGroupOptions(value)
    setSelectedVenue(selectVenue as unknown as VenueExtended)
    setApGroupOption(options as DefaultOptionType[])
  }

  return <>
    {!isEditMode && <PageHeader
      title={$t({ defaultMessage: 'Add AP' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Access Points' }), link: '/devices/wifi' }
      ]}
    />}
    <StepsForm
      formRef={formRef}
      onFinish={!isEditMode ? handleAddSwitchStack : handleUpdateSwitchStack}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/wifi`
      })}
      buttonLabel={{
        submit: !isEditMode
          ? $t({ defaultMessage: 'Add' })
          : $t({ defaultMessage: 'Apply' })
      }}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <Loader states={[{
              isLoading: isVenuesListLoading
            }]}>
              <Form.Item
                name='venueId'
                label={$t({ defaultMessage: 'Venue' })}
                initialValue={null}
                rules={[{
                  required: true
                }, {
                  validator: (_, value) => {
                    const venues = venuesList?.data as unknown as VenueExtended[]
                    const selectVenue = getVenueById(venues, value)
                    const originalVenue = getVenueById(venues, apDetails?.venueId as string)
                    if (selectVenue?.country && originalVenue?.country) {
                      return checkValues(selectVenue?.country, originalVenue?.country, true)
                    }
                    return Promise.resolve()
                  },
                  message: $t(validationMessages.diffVenueCountry)
                }, {
                  validator: (_, value) => {
                    const venues = venuesList?.data as unknown as VenueExtended[]
                    const selectVenue = getVenueById(venues, value)
                    if (!!selectVenue?.dhcp?.enabled) {
                      return checkObjectNotExists(
                        cellularApModels, apDetails?.model, $t({ defaultMessage: 'Venue' })
                      )
                    }
                    return Promise.resolve()
                  },
                  message: $t(validationMessages.cellularApDhcpLimitation)
                }]}
                children={<Select
                  options={[
                    { label: $t({ defaultMessage: 'Select venue...' }), value: null },
                    ...venueOption
                  ]}
                  onChange={async (value) => await handleVenueChange(value)}
                />}
              />
              <Form.Item
                name='name'
                label={<>
                  {$t({ defaultMessage: 'Stack Name' })}
                  <Tooltip
                    title={$t(WifiNetworkMessages.AP_NAME_TOOLTIP)}
                    placement='bottom'
                  >
                    <QuestionMarkCircleOutlined />
                  </Tooltip>
                </>}
                rules={[
                  { max: 255 }
                ]}
                validateFirst
                hasFeedback
                children={<Input />}
              />
              <Form.Item
                name='description'
                label={$t({ defaultMessage: 'Description' })}
                rules={[
                  { max: 64 }
                ]}
                initialValue=''
                children={<Input.TextArea rows={4} maxLength={180} />}
              />
              <Form.Item
                name='apGroupId'
                label={$t({ defaultMessage: 'DHCP Client' })}
                initialValue={null}
                children={<Select
                  disabled={apGroupOption?.length == 0}
                  options={selectedVenue?.id ? apGroupOption : []}
                />}
              />
              {/*
              <Form.Item
                name='serialNumber'
                label={$t({ defaultMessage: 'Stack Members' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => serialNumberRegExp(value) },
                  {
                    validator: (_, value) => {
                      const serialNumbers = apList?.data?.filter(
                        item => item.serialNumber !== apDetails?.serialNumber
                      ).map(item => item.serialNumber) ?? []
                      return checkObjectNotExists(serialNumbers, value,
                        $t({ defaultMessage: 'Serial Number' }), 'value')
                    }
                  }
                ]}
                validateFirst
                hasFeedback
                children={<Input disabled={isEditMode} />}
              /> */}
              <Table
                columns={columns}
                dataSource={tableData}
                type='form'
              />
              <Button
                onClick={handleAdd}
                type='link'
                size='small'>
                {$t({ defaultMessage: 'Add Model' })}
              </Button>
              {/* TODO: */}
              {/* <Form.Item
                name=''
                label={$t({ defaultMessage: 'Tags' })}
                children={<Input />}
              /> */}
            </Loader>
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  </>
}

function getVenueById (venuesList: VenueExtended[], venueId: string) {
  return venuesList?.filter(item => item.id === venueId)[0] ?? {}
}
