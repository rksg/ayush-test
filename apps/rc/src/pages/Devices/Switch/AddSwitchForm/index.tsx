import React, { useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row, Select, Transfer , Radio, Space} from 'antd'
import { DefaultOptionType }                       from 'antd/lib/select'
import { TransferItem }                            from 'antd/lib/transfer'
import { useIntl }                                 from 'react-intl'

import {
  PageHeader,
  Loader,
  showToast,
  StepsForm,
  StepsFormInstance,
  Tooltip
} from '@acx-ui/components'
import {
  useVenuesListQuery,
  useLazyVenueDefaultApGroupQuery,
  useAddApGroupMutation,
  useLazyApGroupsListQuery,
  useLazyGetVlansByVenueQuery
} from '@acx-ui/rc/services'
import {
  ApDeep,
  AddApGroup,
  checkObjectNotExists,
  SwitchMessages
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

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
  const params = useParams()
  const formRef = useRef<StepsFormInstance<ApDeep>>()
  const basePath = useTenantLink('/devices/')
  const venuesList = useVenuesListQuery({ params: { tenantId: tenantId }, payload: defaultPayload })

  const [venueDefaultApGroup] = useLazyVenueDefaultApGroupQuery()
  const [apGroupsList] = useLazyApGroupsListQuery()
  const [addApGroup] = useAddApGroupMutation()
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [dhcpClientOption, setDhcpClientOption] = useState([] as DefaultOptionType[])

  const apGroupsListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }

  useEffect(() => {
    if (!venuesList.isLoading) {
      setVenueOption(venuesList?.data?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])
    }
  }, [venuesList])

  const handleVenueChange = async (value: string) => {
    const vlansByVenue = value ?
      (await getVlansByVenue({ params: { tenantId: tenantId, venueId: value } })).data
        ?.map((item: {vlanId: string}) => ({
          label: item.vlanId, value: item.vlanId
        })) : []

    formRef.current?.validateFields(['name'])
    setDhcpClientOption(vlansByVenue as DefaultOptionType[])
  }

  const handleAddSwitch = async (values: AddApGroup) => {
    try {
      if (values.apSerialNumbers) {
        values.apSerialNumbers = values.apSerialNumbers.map(i => { return { serialNumber: i } })
      }
      const payload = {
        ...values
      }
      await addApGroup({ params: { tenantId: tenantId }, payload }).unwrap()
      navigate(`${basePath.pathname}/wifi`, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const nameValidator = async (value: string) => {
    const venueId = formRef.current?.getFieldValue('venueId')
    if (venueId) {
      const payload = {
        ...apGroupsListPayload,
        searchString: value, filters: { venueId: [venueId] }
      }
      const list = (await apGroupsList({ params, payload }, true)
        .unwrap()).data.map(n => ({ name: n.name }))
      return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'Group' }))
    } else {
      return false
    }
  }


  const listPayload = {
    fields: ['name', 'id'], sortField: 'name',
    sortOrder: 'ASC', page: 1, pageSize: 10000
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
                  required: true
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
                name='serialNumber'
                label={$t({ defaultMessage: 'Serial Number' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => nameValidator(value) }
                ]}
                validateFirst
                hasFeedback
                children={<Input />}
              />

              <Form.Item
                name='switchRole'
                initialValue={MEMEBER_TYPE.STANDALONE}
                label={$t({ defaultMessage: 'Add as' })}
              >
                <Radio.Group 
                
                // onChange={} 
                >
                  <Space direction='vertical'>
                    <Radio key={MEMEBER_TYPE.STANDALONE} value={MEMEBER_TYPE.STANDALONE} >
                      {$t({ defaultMessage: 'Standalone switch' })}
                    </Radio>
                    <Radio key={MEMEBER_TYPE.MEMBER} value={MEMEBER_TYPE.MEMBER} >
                      {$t({ defaultMessage: 'Member in stack' })}
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

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
