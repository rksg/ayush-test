import { useEffect, useState } from 'react'

import { Divider, Form, Input, Space, Switch, Typography  } from 'antd'
import { DefaultOptionType }                                from 'antd/lib/select'
import { useIntl }                                          from 'react-intl'

import { PageHeader, Select, Tooltip, Loader, Table, TableProps, StepsForm } from '@acx-ui/components'
import {
  useAddSwitchPortProfileMutation,
  useEditSwitchPortProfileMutation,
  useLazySwitchPortProfileMacOuisListQuery,
  useSwitchPortProfileLldpTlvsListQuery,
  useSwitchPortProfilesDetailQuery,
  useSwitchPortProfilesListQuery
} from '@acx-ui/rc/services'
import {
  getDefaultPortSpeedOption,
  getPolicyListRoutePath,
  LldpTlvs,
  MacOuis,
  PORT_SPEED,
  redirectPreviousPage,
  SwitchPortProfileMessages,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

const defaultPayload = {
  fields: [
    'id'
  ]
}

export function SwitchPortProfileForm () {
  const intl = useIntl()
  const [form] = Form.useForm()
  const params = useParams()
  const editMode = params.portProfileId ? true : false
  const navigate = useNavigate()
  const basePath = useTenantLink('/policies/portProfile/switch/profiles/')
  const [poeEnable, setPoeEnable] = useState<boolean>(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [macOuisOptions, setMacOuisOptions] = useState<DefaultOptionType[]>([])
  const [macOuisList, setMacOuisList] = useState<MacOuis[]>([])

  const [addSwitchPortProfile] = useAddSwitchPortProfileMutation()
  const [editSwitchPortProfile] = useEditSwitchPortProfileMutation()
  const { data: switchPortProfilesDetail, isLoading } = useSwitchPortProfilesDetailQuery(
    { params }, { skip: !editMode }
  )
  const [switchPortProfileMacOuisList] = useLazySwitchPortProfileMacOuisListQuery()

  const lldpTlvTableQuery = useTableQuery({
    useQuery: useSwitchPortProfileLldpTlvsListQuery,
    defaultPayload,
    sorter: {
      sortField: 'id',
      sortOrder: 'ASC'
    }
  })

  const switchPortProfilesList = useSwitchPortProfilesListQuery({
    payload: { fields: ['id'] }
  })

  const { useWatch } = Form
  const [macOuis] = [useWatch<string>('macOuis', form)]

  const portProfileRoute = getPolicyListRoutePath(true) + '/portProfile/switch/profiles'

  const poeClassOptions = [
    { label: intl.$t({ defaultMessage: 'Negotiate' }), value: 'UNSET' },
    { label: intl.$t({ defaultMessage: '0 (802.3af 15.4 W)' }), value: 'ZERO' },
    { label: intl.$t({ defaultMessage: '1 (802.3af 4.0 W)' }), value: 'ONE' },
    { label: intl.$t({ defaultMessage: '2 (802.3af 7.0 W)' }), value: 'TWO' },
    { label: intl.$t({ defaultMessage: '3 (802.3af 15.4 W)' }), value: 'THREE' },
    { label: intl.$t({ defaultMessage: '4 (802.3at 30 W)' }), value: 'FOUR' },
    { label: intl.$t({ defaultMessage: '5 (802.3bt 45 W)' }), value: 'FIVE' },
    { label: intl.$t({ defaultMessage: '6 (802.3bt 60 W)' }), value: 'SIX' },
    { label: intl.$t({ defaultMessage: '7 (802.3bt 75 W)' }), value: 'SEVEN' },
    { label: intl.$t({ defaultMessage: '8 (802.3bt 90 W)' }), value: 'EIGHT' }
  ]

  const poePriorityOptions = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 }
  ]

  const portSpeeds = getDefaultPortSpeedOption()
  const portSpeedOptions = portSpeeds.filter(speed => speed !== 'OPTIC')
    .map(speed => ({ label: PORT_SPEED[speed as keyof typeof PORT_SPEED], value: speed }))

  const MacOuisSelectList = async () => {
    const list = (await switchPortProfileMacOuisList({
      payload: {
        page: '1',
        pageSize: '10000'
      }
    }).unwrap())?.data

    if(list){
      setMacOuisList(list)
      return list.map((n: MacOuis) => ({ label: n.oui, value: n.id }))
    } else {
      return []
    }
  }

  useEffect(()=>{
    MacOuisSelectList().then(options => setMacOuisOptions(options))

    if(switchPortProfilesDetail){
      form.setFieldsValue(switchPortProfilesDetail)
      if(switchPortProfilesDetail.macOuis){
        form.setFieldValue('macOuis',
          switchPortProfilesDetail.macOuis.map(item => item.id ?? ''))
        setPoeEnableValue(switchPortProfilesDetail.macOuis.length > 0)
      }
      if(switchPortProfilesDetail.lldpTlvs){
        setSelectedRowKeys(switchPortProfilesDetail.lldpTlvs.map(item => item.id ?? ''))
        setPoeEnableValue(switchPortProfilesDetail.lldpTlvs.length > 0)
      }
    }
  }, [switchPortProfilesList, switchPortProfilesDetail])

  const columns: TableProps<LldpTlvs>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'System Name' }),
      key: 'systemName',
      dataIndex: 'systemName',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: intl.$t({ defaultMessage: 'Name Match' }),
      key: 'nameMatchingType',
      dataIndex: 'nameMatchingType',
      sorter: true
    },
    {
      title: intl.$t({ defaultMessage: 'System Description' }),
      key: 'systemDescription',
      dataIndex: 'systemDescription',
      sorter: true
    },
    {
      title: intl.$t({ defaultMessage: 'Description Match' }),
      key: 'descMatchingType',
      dataIndex: 'descMatchingType',
      sorter: true
    }
  ]

  const setPoeEnableValue = (value: boolean) => {
    setPoeEnable(value)
    form.setFieldValue('poeEnable', value)
  }

  const handleAddPortProfile = async () => {
    const data = { ...form.getFieldsValue() }
    const payload = {
      ...form.getFieldsValue(),
      lldpTlvs: lldpTlvTableQuery.data?.data?.filter(
        (item: LldpTlvs) => item.id && selectedRowKeys.includes(item.id)),
      macOuis: macOuisList.filter(
        (item: MacOuis) => item.id && data.macOuis?.includes(item.id))
    }
    try {
      await form.validateFields()
      await addSwitchPortProfile({ payload }).unwrap()

      redirectPreviousPage(navigate, '', `${basePath.pathname}`)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  const handleUpdatePortProfile = async () => {
    const { id, ...data } = form.getFieldsValue()
    const payload = {
      ...form.getFieldsValue(),
      lldpTlvs: lldpTlvTableQuery.data?.data?.filter(
        (item: LldpTlvs) => item.id && selectedRowKeys.includes(item.id)),
      macOuis: macOuisList.filter(
        (item: MacOuis) => item.id && data.macOuis?.includes(item.id))
    }
    try {
      await form.validateFields()
      await editSwitchPortProfile({ params, payload }).unwrap()

      redirectPreviousPage(navigate, '', `${basePath.pathname}`)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>

      <PageHeader
        title={
          intl.$t(
            { defaultMessage: 'Add ICX Port Profile' }
          )
        }
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'Network Control' }) },
          {
            text: intl.$t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: intl.$t({ defaultMessage: 'Port Profiles' }),
            link: portProfileRoute
          }
        ]}
      />
      <Loader states={[{ isLoading }]}>
        <StepsForm
          form={form}
          onFinish={editMode ? handleUpdatePortProfile : handleAddPortProfile}
          onCancel={() =>
            redirectPreviousPage(navigate, '', `${basePath.pathname}`)
          }
          buttonLabel={{
            submit: editMode
              ? intl.$t({ defaultMessage: 'Apply' })
              : intl.$t({ defaultMessage: 'Add' })
          }}
        >
          <StepsForm.StepForm>
            <Form.Item name='name'
              label={intl.$t({ defaultMessage: 'Profile Name' })}
              rules={[
                { required: true }
              ]}
              validateFirst
              hasFeedback
              validateTrigger={'onBlur'}>
              <Input style={{ width: '280px' }}/>
            </Form.Item>
            <Form.Item
              name='untaggedVlan'
              label={intl.$t({ defaultMessage: 'Untagged VLAN' })}
            >
              <Input type='number' style={{ width: '280px' }}/>
            </Form.Item>
            <Form.Item
              name='taggedVlan'
              label={intl.$t({ defaultMessage: 'Tagged VLAN' })}
            >
              <Input style={{ width: '280px' }}/>
            </Form.Item>
            <Divider />
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { intl.$t({ defaultMessage: 'PoE Enable' }) }
              </Space>
              <Form.Item
                name={'poeEnable'}
                initialValue={false}
                valuePropName='checked'
                // eslint-disable-next-line max-len
                children={<Tooltip title={intl.$t(SwitchPortProfileMessages.POE_ENABLED)}>
                  <Switch
                    data-testid='poeEnable'
                    disabled={macOuis?.length > 0 || selectedRowKeys?.length > 0}
                    checked={poeEnable}
                    onChange={setPoeEnableValue}
                  />
                </Tooltip>}
              />
            </UI.FieldLabel>
            <Form.Item
              name='poeClass'
              label={intl.$t({ defaultMessage: 'PoE Class' })}
            >
              <Select
                style={{ width: '280px' }}
                options={poeClassOptions}
              />
            </Form.Item>
            <Form.Item
              name='poePriority'
              label={intl.$t({ defaultMessage: 'PoE Priority' })}
            >
              <Select
                style={{ width: '280px' }}
                options={poePriorityOptions}
              />
            </Form.Item>
            <Divider />
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { intl.$t({ defaultMessage: 'Protected Port' }) }
              </Space>
              <Form.Item
                name={'portProtected'}
                initialValue={false}
                valuePropName='checked'
                children={<Switch data-testid='portProtected'/>}
              />
            </UI.FieldLabel>
            <Form.Item
              name='portSpeed'
              label={intl.$t({ defaultMessage: 'Port Speed' })}
            >
              <Select
                style={{ width: '280px' }}
                options={portSpeedOptions}
              />
            </Form.Item>
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { intl.$t({ defaultMessage: 'RSTP Admin Edge Port' }) }
              </Space>
              <Form.Item
                name={'rstpAdminEdgePort'}
                initialValue={false}
                valuePropName='checked'
                children={<Switch data-testid='rstpAdminEdgePort'/>}
              />
            </UI.FieldLabel>
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { intl.$t({ defaultMessage: 'STP BPDU Guard' }) }
              </Space>
              <Form.Item
                name={'stpBpduGuard'}
                initialValue={false}
                valuePropName='checked'
                children={<Switch data-testid='stpBpduGuard'/>}
              />
            </UI.FieldLabel>
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { intl.$t({ defaultMessage: 'STP Root Guard' }) }
              </Space>
              <Form.Item
                name={'stpRootGuard'}
                initialValue={false}
                valuePropName='checked'
                children={<Switch data-testid='stpRootGuard'/>}
              />
            </UI.FieldLabel>
            <Divider />
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { intl.$t({ defaultMessage: 'DHCP Snooping Trust' }) }
              </Space>
              <Form.Item
                name={'dhcpSnoopingTrust'}
                initialValue={false}
                valuePropName='checked'
                children={<Switch data-testid='dhcpSnoopingTrust'/>}
              />
            </UI.FieldLabel>
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { intl.$t({ defaultMessage: 'IPSG' }) }
              </Space>
              <Form.Item
                name={'ipsg'}
                initialValue={false}
                valuePropName='checked'
                children={<Switch
                  disabled={editMode}
                  data-testid='ipsg'/>}
              />
            </UI.FieldLabel>
            <Form.Item
              name='ingressAcl'
              label={intl.$t({ defaultMessage: 'Ingress ACL (IPv4)' })}
            >
              <Input style={{ width: '280px' }}/>
            </Form.Item>
            <Form.Item
              name='egressAcl'
              label={intl.$t({ defaultMessage: 'Egress ACL (IPv4)' })}
            >
              <Input style={{ width: '280px' }}/>
            </Form.Item>
            <Divider />
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { intl.$t({ defaultMessage: '802.1x' }) }
              </Space>
              <Form.Item
                name={'dot1x'}
                initialValue={false}
                valuePropName='checked'
                children={<Switch data-testid='dot1x'/>}
              />
            </UI.FieldLabel>
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { intl.$t({ defaultMessage: 'Macauth' }) }
              </Space>
              <Form.Item
                name={'macAuth'}
                initialValue={false}
                valuePropName='checked'
                children={<Switch data-testid='macAuth'/>}
              />
            </UI.FieldLabel>
            <Divider />
            <Space direction='vertical' style={{ margin: '16px 0' }}>
              <Typography.Title level={4}>
                { intl.$t({ defaultMessage: 'Define Match Criteria' }) }</Typography.Title>
            </Space>
            <Form.Item name='id' hidden={true}>
              <Input />
            </Form.Item>
            <Form.Item
              name={'macOuis'}
              label={<label>{intl.$t({ defaultMessage: 'MAC OUI' })}
                <Tooltip.Question
                  title={SwitchPortProfileMessages.MAC_OUI}
                /></label>}
              data-testid='macOuis'
              children={
                <Tooltip
                  title={!poeEnable && intl.$t(SwitchPortProfileMessages.MACOUI_POE_DISABLED)}
                >
                  <Select
                    mode='multiple'
                    showArrow
                    options={macOuisOptions}
                    onChange={(selectedOuis) =>
                    { selectedOuis.length > 0 && setPoeEnableValue(true) }}
                    style={{ width: '280px' }}
                    disabled={!poeEnable}
                  />
                </Tooltip>
              }
            />
            <Form.Item
              name={'lldpTlvs'}
              label={<label>{intl.$t({ defaultMessage: 'LLDP TLV' })}
                <Tooltip.Question
                  title={intl.$t(SwitchPortProfileMessages.LLDP_TLV)}
                /></label>}
              data-testid='lldpTlvs'
            >
              <Loader states={[lldpTlvTableQuery]}>
                <Table
                  rowKey='id'
                  columns={columns}
                  rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys,
                    renderCell (checked, record, index, node) {
                      if (!poeEnable) {
                        return <Tooltip
                          title={intl.$t(SwitchPortProfileMessages.LLDPTLV_POE_DISABLED)}>
                          {node}</Tooltip>
                      }
                      return node
                    },
                    getCheckboxProps: () => ({
                      disabled: !poeEnable
                    }),
                    onChange: (selectedKeys) => {
                      if(selectedKeys.length > 0) {
                        setPoeEnableValue(true)
                      }
                      setSelectedRowKeys(selectedKeys as string[])
                    }
                  }}
                  dataSource={lldpTlvTableQuery.data?.data}
                  pagination={lldpTlvTableQuery.pagination}
                  onChange={lldpTlvTableQuery.handleTableChange}
                  onFilterChange={lldpTlvTableQuery.handleFilterChange}
                  enableApiFilter={true}
                />
              </Loader>
            </Form.Item>
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}
