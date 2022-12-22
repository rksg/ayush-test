import React, { useEffect, useRef, useState } from 'react'


import { Col, Form, Input, Row, Select, Radio, RadioChangeEvent } from 'antd'
import { DefaultOptionType }                                      from 'antd/lib/select'
import { useIntl }                                                from 'react-intl'

import {
  PageHeader,
  Loader,
  showToast,
  StepsForm,
  StepsFormInstance,
  Tooltip
} from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  useVenuesListQuery,
  useLazyGetSwitchListQuery,
  useLazyGetVlansByVenueQuery,
  useAddSwitchMutation,
  useAddStackMemberMutation
} from '@acx-ui/rc/services'
import {
  ApDeep,
  SwitchMessages,
  SWITCH_SERIAL_PATTERN,
  Switch,
  getSwitchModel,
  SwitchViewModel,
  IGMP_SNOOPING_TYPE
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import * as UI from '../styledComponents'
import { SwitchUpgradeNotification, SWITCH_UPGRADE_NOTIFICATION_TYPE } from '../../SwitchUpgradeNotification'
import _ from 'lodash'

const { Option } = Select

const defaultPayload = {
  fields: ['name', 'country', 'latitude', 'longitude', 'dhcp', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export enum MEMEBER_TYPE {
  STANDALONE = 'standalone',
  MEMBER = 'member'
}

export enum FIRMWARE {
  AUTO = 'AUTO',
  SWITCH = 'SWITCH',
  ROUTER = 'ROUTER'
}

export function AddSwitchForm () {
  const { $t } = useIntl()
  const { tenantId, action } = useParams()
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance<ApDeep>>()
  const basePath = useTenantLink('/devices/')
  const venuesList = useVenuesListQuery({ params: { tenantId: tenantId }, payload: defaultPayload })

  const [addSwitch] = useAddSwitchMutation()
  const [addStackMember] = useAddStackMemberMutation()
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [dhcpClientOption, setDhcpClientOption] = useState([] as DefaultOptionType[])
  const [switchRole, setSwitchRole] = useState(MEMEBER_TYPE.STANDALONE as MEMEBER_TYPE)
  const [getSwitchList] = useLazyGetSwitchListQuery()
  const [switchOptions, setSwitchOptions] = useState([] as DefaultOptionType[])
  const [venueId, setVenueId] = useState('')
  const [switchModel, setSwitchModel] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  const switchListPayload = {
    searchString: '',
    fields: ['name', 'serialNumber', 'id'],

    searchTargetFields: ['model'],
    pageSize: 10000
  }

  useEffect(() => {
    if (venueId && switchModel && switchRole === MEMEBER_TYPE.MEMBER) {
      handleSwitchList()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, switchModel, switchRole, serialNumber])

  const handleSwitchList = async () => {
    const payload = {
      ...switchListPayload,
      searchString: switchModel,
      filters: { isStack: [true], venueId: [venueId] }
    }
    const memberList =
      (await getSwitchList({ params: { tenantId: tenantId }, payload }, true))
        .data?.data
        .filter((item: SwitchViewModel) => item.serialNumber !== serialNumber)
        .map((item: SwitchViewModel) => (
          {
            label: item.name || item.serialNumber || item.id,
            value: item.id || item.serialNumber
          }
        )) || []

    const exisingStack = memberList.length > 0 ? memberList[0].value : null
    formRef.current?.setFieldValue('existingStack', exisingStack)
    setSwitchOptions(memberList)
  }


  useEffect(() => {
    if (!venuesList.isLoading) {
      setVenueOption(venuesList?.data?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])
    }
  }, [venuesList])

  const handleVenueChange = async (value: string) => {
    setVenueId(value)
    const vlansByVenue = value ?
      (await getVlansByVenue({ params: { tenantId: tenantId, venueId: value } })).data
        ?.map((item: { vlanId: string }) => ({
          label: item.vlanId, value: item.vlanId
        })) : []

    formRef.current?.validateFields(['name'])
    setDhcpClientOption(vlansByVenue as DefaultOptionType[])
  }

  const defaultAddSwitchPayload = {
    name: '',
    id: '',
    description: '',
    venueId: '',
    stackMembers: [],
    trustPorts: [],
    enableStack: false,
    jumboMode: false,
    igmpSnooping: IGMP_SNOOPING_TYPE.NONE,
    spanningTreePriority: '',
    initialVlanId: '',
    rearModule: 'none'
  }

  const handleAddSwitch = async (values: Switch) => {
    if (switchRole === MEMEBER_TYPE.STANDALONE) {
      try {
        const payload = {
          ...defaultAddSwitchPayload,
          ...values
        }
        await addSwitch({ params: { tenantId: tenantId }, payload }).unwrap()
        navigate(`${basePath.pathname}/switch`, { replace: true })
      } catch {
        showToast({
          type: 'error',
          content: $t({ defaultMessage: 'An error occurred' })
        })
      }
    } else if (switchRole === MEMEBER_TYPE.MEMBER) {
      const params = {
        tenantId,
        stackSerialNumber: formRef.current?.getFieldValue('existingStack'),
        newStackMemberSerialNumber: serialNumber
      }
      try {
        await addStackMember({ params }).unwrap()
        navigate(`${basePath.pathname}/switch`, { replace: true })
      } catch {
        showToast({
          type: 'error',
          content: $t({ defaultMessage: 'An error occurred' })
        })
      }
    }
  }

  const serialNumberRegExp = function (value: string) {
    const re = new RegExp(SWITCH_SERIAL_PATTERN)
    if (value && !re.test(value)) {
      return Promise.reject($t({ defaultMessage: 'Serial number is invalid' }))
    }

    if(value && re.test(value)) {
      setSwitchModel(getSwitchModel(value) || '')
      setSerialNumber(value)
    }
    return Promise.resolve()
  }

  const [ getVlansByVenue ] = useLazyGetVlansByVenueQuery()

  return <>
    {action === 'add' && <PageHeader
      title={$t({ defaultMessage: 'Add Switch' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Switches' }), link: '/devices/switch' }
      ]}
    />}
    <StepsForm
      formRef={formRef}
      onFinish={handleAddSwitch}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/switch`
      })}
      buttonLabel={{
        submit: $t({ defaultMessage: 'Add' })
      }}
    >
      <StepsForm.StepForm>
        <Loader states={[{
          isLoading: venuesList.isLoading
        }]}>
          <Row gutter={20}>
            <Col span={8}>
              <StepsForm.Title>{$t({ defaultMessage: 'Group Details' })}</StepsForm.Title>
              <Form.Item
                name='venueId'
                label={<>
                  {$t({ defaultMessage: 'Venue' })}
                </>}
                initialValue={null}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please select Venue' })
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
                name='id'
                label={$t({ defaultMessage: 'Serial Number' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => serialNumberRegExp(value) }
                ]}
                validateFirst
                children={<Input />}
              />

              <SwitchUpgradeNotification
              isDisplay={!_.isEmpty(switchModel)}
              isDisplayHeader={true}
              type={ switchRole === MEMEBER_TYPE.STANDALONE ? 
                SWITCH_UPGRADE_NOTIFICATION_TYPE.SWITCH : 
                SWITCH_UPGRADE_NOTIFICATION_TYPE.STACK }
              validateModel={[switchModel]}
              />

              <Form.Item
                label={<>
                  {$t({ defaultMessage: 'Add as' })}
                  {switchRole === MEMEBER_TYPE.MEMBER && <Tooltip
                    title={$t(SwitchMessages.FIRMWARE_TYPE_TOOLTIP)}
                    placement='bottom'
                  >
                    <QuestionMarkCircleOutlined />
                  </Tooltip>}
                </>}
              >
                <Radio.Group
                defaultValue={MEMEBER_TYPE.STANDALONE}
                  onChange={(e: RadioChangeEvent) => {
                    return setSwitchRole(e.target.value)
                  }}
                >
                  <UI.FieldSpace columns={'auto'}>
                    <Radio key={MEMEBER_TYPE.STANDALONE} value={MEMEBER_TYPE.STANDALONE}>
                      {$t({ defaultMessage: 'Standalone switch' })}
                    </Radio>
                  </UI.FieldSpace>

                  <UI.FieldSpace columns={'140px 190px 10px'}>
                    <Radio key={MEMEBER_TYPE.MEMBER}
                      value={MEMEBER_TYPE.MEMBER} >
                      {$t({ defaultMessage: 'Member in stack' })}
                    </Radio>
                    {switchRole === MEMEBER_TYPE.MEMBER &&
                      <Form.Item
                        name='existingStack'
                        initialValue={null}
                        rules={[{
                          required: true,
                          message: $t({ defaultMessage: 'Please select Stack' })
                        }]}
                      >
                        <Select
                          disabled={switchOptions.length < 1}
                          options={switchOptions.length < 1 ? [
                            {
                              label: $t({ defaultMessage: 'No compatible stacks' }),
                              value: null
                            }
                          ] : switchOptions}
                        />
                      </Form.Item>
                    }

                  </UI.FieldSpace>

                </Radio.Group>
              </Form.Item>
              {switchRole === MEMEBER_TYPE.STANDALONE && <>
                <Form.Item
                  name='name'
                  label={$t({ defaultMessage: 'Switch Name' })}
                  rules={[
                    { min: 1, transform: (value) => value.trim() },
                    { max: 255, transform: (value) => value.trim() }
                  ]}
                  children={<Input />}
                />

                <Form.Item
                  name='description'
                  label={$t({ defaultMessage: 'Description' })}
                  rules={[
                    { min: 1, transform: (value) => value.trim() },
                    { max: 255, transform: (value) => value.trim() }
                  ]}
                  children={<Input />}
                />

                <Form.Item
                  name='specifiedType'
                  initialValue={FIRMWARE.AUTO}
                  label={<>
                    {$t({ defaultMessage: 'Firmware Type:' })}
                    <Tooltip
                      title={$t(SwitchMessages.FIRMWARE_TYPE_TOOLTIP)}
                      placement='bottom'
                    >
                      <QuestionMarkCircleOutlined />
                    </Tooltip>
                  </>}
                >
                  <Select>
                    <Option value={FIRMWARE.AUTO}>
                      {$t({ defaultMessage: 'Factory default' })}
                    </Option>
                    <Option value={FIRMWARE.SWITCH}>
                      {$t({ defaultMessage: 'Switch' })}
                    </Option>
                    <Option value={FIRMWARE.ROUTER}>
                      {$t({ defaultMessage: 'Router' })}
                    </Option>
                  </Select>
                </Form.Item>
              </>}

              <Form.Item
                name='initialVlanId'
                initialValue={null}
                label={<>
                  {$t({ defaultMessage: 'DHCP Client:' })}
                  <Tooltip
                    title={$t(SwitchMessages.DHCP_CLIENT_TOOLTIP)}
                    placement='bottom'
                  >
                    <QuestionMarkCircleOutlined />
                  </Tooltip>
                </>}
                children={
                  <Select
                    disabled={dhcpClientOption.length < 1}
                    options={[
                      { label: $t({ defaultMessage: 'Select VLAN...' }), value: null },
                      ...dhcpClientOption
                    ]} />
                }
              />

            </Col>
          </Row>
        </Loader>
      </StepsForm.StepForm>
    </StepsForm>
  </>
}

