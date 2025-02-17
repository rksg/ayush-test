import { useEffect, useState } from 'react'

import { Divider, Form, Input, Space, Switch, Typography  } from 'antd'
import { DefaultOptionType }                                from 'antd/lib/select'
import { useIntl }                                          from 'react-intl'

import { PageHeader, Select, Tooltip, Loader, Table, TableProps, StepsForm } from '@acx-ui/components'
import { InformationSolid }                                                  from '@acx-ui/icons'
import {
  useAddSwitchPortProfileMutation,
  useEditSwitchPortProfileMutation,
  useLazySwitchPortProfileMacOuisListQuery,
  useLazySwitchPortProfilesListQuery,
  useSwitchPortProfileLldpTlvsListQuery,
  useSwitchPortProfilesDetailQuery
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  checkTaggedVlan,
  getDefaultPortSpeedOption,
  getPolicyListRoutePath,
  LldpTlvMatchingType,
  LldpTlvs,
  MacOuis,
  PORT_SPEED,
  radiusIpAddressRegExp,
  redirectPreviousPage,
  SwitchPortProfileMessages,
  SwitchPortProfiles,
  useTableQuery,
  validateDuplicateVlanId,
  validateVlanExcludingReserved
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { lldpTlvMatchingTypeTextMap } from '../portProfile.utils'

import * as UI from './styledComponents'

interface FormPayload {
  taggedVlans?: string;
  macOuis?: string[];
  ipsg?: boolean;
  dot1x?: boolean;
  macAuth?: boolean;
}

export default function SwitchPortProfileForm () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const params = useParams()
  const editMode = params.portProfileId ? true : false
  const navigate = useNavigate()
  const basePath = useTenantLink('/policies/portProfile/switch/profiles/')
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [selectedLldpTlvRows, setSelectedLldpTlvRows] = useState<LldpTlvs[]>([])
  const [ingressTooltipVisible, setIngressTooltipVisible] = useState<boolean>(false)
  const [macOuisOptions, setMacOuisOptions] = useState<DefaultOptionType[]>([])
  const [macOuisList, setMacOuisList] = useState<MacOuis[]>([])

  const [switchPortProfilesList] = useLazySwitchPortProfilesListQuery()
  const [addSwitchPortProfile] = useAddSwitchPortProfileMutation()
  const [editSwitchPortProfile] = useEditSwitchPortProfileMutation()
  const { data: switchPortProfilesDetail, isLoading } = useSwitchPortProfilesDetailQuery(
    { params }, { skip: !editMode }
  )
  const [switchPortProfileMacOuisList] = useLazySwitchPortProfileMacOuisListQuery()

  const lldpTlvTableQuery = useTableQuery({
    useQuery: useSwitchPortProfileLldpTlvsListQuery,
    defaultPayload: { fields: ['id'] },
    sorter: {
      sortField: 'id',
      sortOrder: 'ASC'
    }
  })

  const { useWatch } = Form
  const [
    poeEnable,
    ipsg,
    macOuis
  ] = [
    useWatch<boolean>('poeEnable', form),
    useWatch<boolean>('ipsg', form),
    useWatch<string>('macOuis', form)
  ]

  const portProfileRoute = getPolicyListRoutePath(true) + '/portProfile/switch/profiles'

  const poeClassOptions = [
    { label: $t({ defaultMessage: 'Negotiate' }), value: 'UNSET' },
    { label: $t({ defaultMessage: '0 (802.3af 15.4 W)' }), value: 'ZERO' },
    { label: $t({ defaultMessage: '1 (802.3af 4.0 W)' }), value: 'ONE' },
    { label: $t({ defaultMessage: '2 (802.3af 7.0 W)' }), value: 'TWO' },
    { label: $t({ defaultMessage: '3 (802.3af 15.4 W)' }), value: 'THREE' },
    { label: $t({ defaultMessage: '4 (802.3at 30 W)' }), value: 'FOUR' },
    { label: $t({ defaultMessage: '5 (802.3bt 45 W)' }), value: 'FIVE' },
    { label: $t({ defaultMessage: '6 (802.3bt 60 W)' }), value: 'SIX' },
    { label: $t({ defaultMessage: '7 (802.3bt 75 W)' }), value: 'SEVEN' },
    { label: $t({ defaultMessage: '8 (802.3bt 90 W)' }), value: 'EIGHT' }
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
        fields: ['oui'],
        page: '1',
        pageSize: '10000',
        sortField: 'oui',
        sortOrder: 'ASC'
      }
    }).unwrap())?.data

    if(list){
      setMacOuisList(list)
      return list.map((n: MacOuis) => ({ label: n.oui, value: n.id }))
    } else {
      return []
    }
  }

  const profileNameDuplicateValidator = async (name: string) => {
    const list = (await switchPortProfilesList({
      payload: {
        page: '1',
        pageSize: '10000'
      }
    }).unwrap()).data
      .filter((n: SwitchPortProfiles) => n.id !== params.portProfileId)
      .map((n: SwitchPortProfiles) =>
        ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name } ,
      $t({ defaultMessage: 'Profile Name' }))
  }

  useEffect(()=>{
    MacOuisSelectList().then(options => setMacOuisOptions(options))

    if(switchPortProfilesDetail){
      form.setFieldsValue(switchPortProfilesDetail)
      if(switchPortProfilesDetail.macOuis){
        form.setFieldValue('macOuis',
          switchPortProfilesDetail.macOuis.map(item => item.id ?? ''))
      }
      if(switchPortProfilesDetail.lldpTlvs){
        setSelectedRowKeys(switchPortProfilesDetail.lldpTlvs.map(item => item.id ?? ''))
      }

      if(switchPortProfilesDetail.taggedVlans){
        form.setFieldValue('taggedVlans',
          switchPortProfilesDetail.taggedVlans.join(','))
      }
    }
  }, [switchPortProfilesDetail])

  const columns: TableProps<LldpTlvs>['columns'] = [
    {
      title: $t({ defaultMessage: 'System Name' }),
      key: 'systemName',
      dataIndex: 'systemName',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Name Match' }),
      key: 'nameMatchingType',
      dataIndex: 'nameMatchingType',
      sorter: true,
      render: (_, row) => {
        const nameMatchingType = row.nameMatchingType as keyof typeof LldpTlvMatchingType
        return lldpTlvMatchingTypeTextMap[nameMatchingType]
          ? $t(lldpTlvMatchingTypeTextMap[nameMatchingType])
          : $t({ defaultMessage: 'Exact' })
      }
    },
    {
      title: $t({ defaultMessage: 'System Description' }),
      key: 'systemDescription',
      dataIndex: 'systemDescription',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Description Match' }),
      key: 'descMatchingType',
      dataIndex: 'descMatchingType',
      sorter: true,
      render: (_, row) => {
        const descMatchingType = row.descMatchingType as keyof typeof LldpTlvMatchingType
        return lldpTlvMatchingTypeTextMap[descMatchingType]
          ? $t(lldpTlvMatchingTypeTextMap[descMatchingType])
          : $t({ defaultMessage: 'Exact' })
      }
    }
  ]

  const mergeUniqueLldpTlvs = (lldptlvs1: LldpTlvs[], lldptlvs2: LldpTlvs[]) => {
    const uniqueMap = new Map()

    lldptlvs1.forEach(item => {
      uniqueMap.set(item.id, item)
    })

    lldptlvs2.forEach(item => {
      uniqueMap.set(item.id, item)
    })

    return Array.from(uniqueMap.values())
  }

  const proceedPayload = (data: FormPayload) => {
    const lldpTlvsItems = mergeUniqueLldpTlvs(switchPortProfilesDetail?.lldpTlvs?.filter(
      (item: LldpTlvs) => item.id && selectedRowKeys.includes(item.id)) || [],
    selectedLldpTlvRows.filter(
      (item: LldpTlvs) => item.id && selectedRowKeys.includes(item.id))
    )

    return {
      ...data,
      taggedVlans: data.taggedVlans ? data.taggedVlans.split(',') : undefined,
      lldpTlvs: lldpTlvsItems,
      macOuis: macOuisList.filter(
        (item: MacOuis) => item.id && data.macOuis?.includes(item.id)),
      dot1x: data.ipsg ? false : data.dot1x,
      macAuth: data.ipsg ? false : data.macAuth
    }
  }

  const handleAddPortProfile = async () => {
    const data = { ...form.getFieldsValue() }
    const payload = proceedPayload(data)

    try {
      await form.validateFields()
      await addSwitchPortProfile({ payload }).unwrap()

      redirectPreviousPage(navigate, '', `${basePath.pathname}`)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  const handleUpdatePortProfile = async () => {
    const data = { ...form.getFieldsValue() }
    const payload = proceedPayload(data)

    try {
      await form.validateFields()
      await editSwitchPortProfile({ params, payload }).unwrap()

      redirectPreviousPage(navigate, '', `${basePath.pathname}`)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const validateUntaggedVlan = (value: number) => {
    return new Promise<void>((resolve, reject) => {
      if (value !== undefined) {
        const untaggedVlanValue = value.toString()
        if (untaggedVlanValue) {
          validateVlanExcludingReserved(untaggedVlanValue)
            .then(() => {
              if (form.getFieldValue('taggedVlans') !== undefined) {
                return validateDuplicateVlanId(
                  value,
                  form.getFieldValue('taggedVlans')
                    .split(',')
                    .map((vlan: string) => ({ vlanId: Number(vlan) }))
                )
              }
              return resolve()
            })
            .then(() => resolve())
            .catch((error) => reject(error))
        } else {
          resolve()
        }
      } else {
        resolve()
      }
    })
  }

  const validateTaggedVlan = (value: string) => {
    return new Promise<void>((resolve, reject) => {
      if (value !== undefined) {
        if (value) {
          checkTaggedVlan(value)
            .then(() => resolve())
            .catch((error) => reject(error))
        } else {
          resolve()
        }
      } else {
        resolve()
      }
    })
  }

  return (
    <>
      <PageHeader
        title={
          editMode ? $t(
            { defaultMessage: 'Edit ICX Port Profile' }
          ) : $t(
            { defaultMessage: 'Add ICX Port Profile' }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Port Profiles' }),
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
              ? $t({ defaultMessage: 'Apply' })
              : $t({ defaultMessage: 'Add' })
          }}
        >
          <StepsForm.StepForm>
            <Form.Item name='name'
              label={$t({ defaultMessage: 'Profile Name' })}
              rules={[
                { required: true },
                { validator: (_, value) => profileNameDuplicateValidator(value) }
              ]}
              validateFirst
              hasFeedback
              validateTrigger={'onBlur'}>
              <Input style={{ width: '280px' }} disabled={editMode} />
            </Form.Item>
            <Form.Item
              name='untaggedVlan'
              label={$t({ defaultMessage: 'Untagged VLAN' })}
              rules={[
                { validator: (_, value) => validateUntaggedVlan(value) }
              ]}
            >
              <Input
                type='number'
                style={{ width: '280px' }}
                onKeyDown={(e) => {
                  if (!/\d/.test(e.key) && e.key !== 'Backspace' &&
                  e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                    e.preventDefault()
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              name='taggedVlans'
              label={$t({ defaultMessage: 'Tagged VLAN' })}
              rules={[
                { validator: (_, value) => validateTaggedVlan(value) }
              ]}
            >
              <Input style={{ width: '280px' }}/>
            </Form.Item>
            <Form.Item
              name='radius'
              label={$t({ defaultMessage: 'RADIUS' })}
              rules={[
                { validator: (_, value) => radiusIpAddressRegExp(value) }
              ]}
            >
              <Input style={{ width: '280px' }}/>
            </Form.Item>
            <Divider />
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                {
                  <Form.Item
                    label={<><span style={{ color: 'var(--acx-primary-black)' }}>
                      {$t({ defaultMessage: 'PoE Enable' })}</span>
                    <Tooltip.Question
                      title={$t(SwitchPortProfileMessages.POE_LABEL)}
                    /></>}
                    style={{ marginTop: '5px' }}
                  />
                }
              </Space>
              <Form.Item
                name={'poeEnable'}
                valuePropName='checked'
                initialValue={true}
                children={<Tooltip title={poeEnable &&
                  (macOuis?.length > 0 || selectedRowKeys?.length > 0) ?
                  $t(SwitchPortProfileMessages.POE_ENABLED) : ''}>
                  <Switch
                    data-testid='poeEnable'
                    disabled={macOuis?.length > 0 || selectedRowKeys?.length > 0}
                    onChange={(checked) => {
                      form.setFieldValue('poeEnable', checked)
                    }}
                    defaultChecked={true}
                    checked={poeEnable}
                  />
                </Tooltip>}
              />
            </UI.FieldLabel>
            <Form.Item
              name='poeClass'
              label={$t({ defaultMessage: 'PoE Class' })}
            >
              <Select
                style={{ width: '280px' }}
                options={poeClassOptions}
              />
            </Form.Item>
            <Form.Item
              name='poePriority'
              label={$t({ defaultMessage: 'PoE Priority' })}
            >
              <Select
                style={{ width: '280px' }}
                options={poePriorityOptions}
              />
            </Form.Item>
            <Divider />
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { $t({ defaultMessage: 'Protected Port' }) }
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
              label={$t({ defaultMessage: 'Port Speed' })}
            >
              <Select
                style={{ width: '280px' }}
                options={portSpeedOptions}
              />
            </Form.Item>
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { $t({ defaultMessage: 'RSTP Admin Edge Port' }) }
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
                { $t({ defaultMessage: 'STP BPDU Guard' }) }
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
                { $t({ defaultMessage: 'STP Root Guard' }) }
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
                { $t({ defaultMessage: 'DHCP Snooping Trust' }) }
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
                <Form.Item
                  label={<><span style={{ color: 'var(--acx-primary-black)' }}>
                    {$t({ defaultMessage: 'IPSG' })}</span>
                  <Tooltip.Question
                    title={$t(SwitchPortProfileMessages.IPSG_ENABLED)}
                  /></>}
                  style={{ marginTop: '5px' }}
                />
              </Space>
              <Form.Item
                name={'ipsg'}
                initialValue={false}
                valuePropName='checked'
                children={<Switch
                  data-testid='ipsg'
                  onChange={(checked: boolean) => {
                    if(checked){
                      form.setFieldValue('ingressAcl', undefined)
                    }
                  }}
                />}
              />
            </UI.FieldLabel>
            <Form.Item
              name='ingressAcl'
              label={$t({ defaultMessage: 'Ingress ACL (IPv4)' })}
              style={{ width: '280px' }}
            >
              {ipsg ?
                <Tooltip
                  title={$t(SwitchPortProfileMessages.INGRESS_ACL_DISABLED)}
                  visible={ingressTooltipVisible}
                ><Input
                    data-testid='ingressAcl'
                    style={{ width: '280px' }}
                    disabled={true}
                    value={''}
                    onMouseOver={() => setIngressTooltipVisible(true)}
                    onMouseOut={() => setIngressTooltipVisible(false)}
                  /></Tooltip> :
                <Input
                  style={{ width: '280px' }}
                />
              }
            </Form.Item>
            <Form.Item
              name='egressAcl'
              label={$t({ defaultMessage: 'Egress ACL (IPv4)' })}
            >
              <Input style={{ width: '280px' }}/>
            </Form.Item>
            <Divider />
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { $t({ defaultMessage: '802.1x' }) }
              </Space>
              <Form.Item
                name={'dot1x'}
                initialValue={false}
                valuePropName='checked'
                children={ipsg ? <Tooltip
                  title={$t(SwitchPortProfileMessages.DOT1X_DISABLED)}>
                  <Switch data-testid='dot1x' disabled={true} checked={false} />
                </Tooltip> :
                  <Switch data-testid='dot1x' />}
              />
            </UI.FieldLabel>
            <UI.FieldLabel width={'250px'}>
              <Space align='start'>
                { $t({ defaultMessage: 'MAC Auth' }) }
              </Space>
              <Form.Item
                name={'macAuth'}
                initialValue={false}
                valuePropName='checked'
                children={ipsg ? <Tooltip
                  title={$t(SwitchPortProfileMessages.MAC_AUTH_DISABLED)}>
                  <Switch data-testid='macAuth' disabled={true} checked={false} />
                </Tooltip> :
                  <Switch data-testid='macAuth' />}
              />
            </UI.FieldLabel>
            <Divider />
            <Space direction='vertical' style={{ margin: '16px 0' }}>
              <Typography.Title level={4}>
                { $t({ defaultMessage: 'Define Match Criteria' }) }</Typography.Title>
            </Space>
            <Form.Item
              name={'macOuis'}
              label={<>{$t({ defaultMessage: 'MAC OUI' })}
                <Tooltip.Question
                  title={SwitchPortProfileMessages.MAC_OUI}
                /></>}
              children={!poeEnable ?
                <Tooltip
                  title={$t(SwitchPortProfileMessages.MACOUI_POE_DISABLED)}
                >
                  <Select
                    data-testid='macOuisSelectList'
                    mode='multiple'
                    showArrow
                    style={{ width: '280px' }}
                    disabled={true}
                  />
                </Tooltip> :
                <Select
                  data-testid='macOuisSelectList'
                  mode='multiple'
                  showArrow
                  options={macOuisOptions}
                  style={{ width: '280px' }}
                />
              }
            />
            <Form.Item
              name={'lldpTlvs'}
              label={<>{$t({ defaultMessage: 'LLDP TLV' })}
                <Tooltip.Question
                  title={$t(SwitchPortProfileMessages.LLDP_TLV)}
                /></>}
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
                          title={$t(SwitchPortProfileMessages.LLDPTLV_POE_DISABLED)}>
                          {node}</Tooltip>
                      }
                      return node
                    },
                    getCheckboxProps: () => ({
                      disabled: !poeEnable
                    }),
                    onChange: (selectedKeys, selectedRows) => {
                      setSelectedRowKeys(selectedKeys as string[])
                      setSelectedLldpTlvRows(selectedRows as LldpTlvs[])
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
            {editMode &&
              <Space align='start'>
                <InformationSolid />
                {$t(SwitchPortProfileMessages.APPLY_PORT_PROFILE_CHANGE)}
              </Space>
            }
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}