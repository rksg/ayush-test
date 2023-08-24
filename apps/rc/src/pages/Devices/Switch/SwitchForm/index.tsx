import { useEffect, useRef, useState } from 'react'


import { Col, Form, Input, Row, Select, Radio, RadioChangeEvent } from 'antd'
import { DefaultOptionType }                                      from 'antd/lib/select'
import _                                                          from 'lodash'
import { useIntl }                                                from 'react-intl'

import {
  PageHeader,
  Loader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Tooltip,
  Tabs,
  Alert,
  showToast
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  switchApi,
  useGetSwitchQuery,
  useVenuesListQuery,
  useAddSwitchMutation,
  useUpdateSwitchMutation,
  useAddStackMemberMutation,
  useLazyGetSwitchListQuery,
  useSwitchDetailHeaderQuery,
  useLazyGetVlansByVenueQuery
} from '@acx-ui/rc/services'
import {
  SwitchMessages,
  SWITCH_SERIAL_PATTERN,
  Switch,
  getSwitchModel,
  SwitchViewModel,
  IGMP_SNOOPING_TYPE,
  Vlan,
  SwitchStatusEnum,
  isOperationalSwitch,
  redirectPreviousPage,
  LocationExtended,
  SWITCH_SERIAL_PATTERN_SUPPORT_RODAN,
  VenueMessages
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { store } from '@acx-ui/store'

import { SwitchStackSetting }                                          from '../SwitchStackSetting'
import { SwitchUpgradeNotification, SWITCH_UPGRADE_NOTIFICATION_TYPE } from '../SwitchUpgradeNotification'

import {  getTsbBlockedSwitch, showTsbBlockedSwitchErrorDialog } from './blockListRelatedTsb.util'
import * as UI                                                   from './styledComponents'

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

export function SwitchForm () {
  const { $t } = useIntl()
  const { tenantId, switchId, action } = useParams()
  const editMode = action === 'edit'
  const navigate = useNavigate()
  const location = useLocation()
  const formRef = useRef<StepsFormLegacyInstance<Switch>>()
  const basePath = useTenantLink('/devices/')
  const venuesList = useVenuesListQuery({ params: { tenantId: tenantId }, payload: defaultPayload })
  const { data: switchData, isLoading: isSwitchDataLoading } =
    useGetSwitchQuery({ params: { tenantId, switchId } }, { skip: action === 'add' })
  const { data: switchDetail, isLoading: isSwitchDetailLoading } =
    useSwitchDetailHeaderQuery({ params: { tenantId, switchId } }, { skip: action === 'add' })

  const [addSwitch] = useAddSwitchMutation()
  const [updateSwitch] = useUpdateSwitchMutation()
  const [addStackMember] = useAddStackMemberMutation()
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [dhcpClientOption, setDhcpClientOption] = useState([] as DefaultOptionType[])
  const [switchRole, setSwitchRole] = useState(MEMEBER_TYPE.STANDALONE as MEMEBER_TYPE)
  const [getSwitchList] = useLazyGetSwitchListQuery()
  const [ getVlansByVenue ] = useLazyGetVlansByVenueQuery()
  const [switchOptions, setSwitchOptions] = useState([] as DefaultOptionType[])
  const [venueId, setVenueId] = useState('')
  const [switchModel, setSwitchModel] = useState('')
  const [deviceOnline, setDeviceOnline] = useState(false)
  const [isSupportStack, setIsSupportStack] = useState(true)
  const [isOnlyFirmware, setIsOnlyFirmware] = useState(false)
  const [isRodanModel, setIsRodanModel] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [readOnly, setReadOnly] = useState(false)
  const [disableIpSetting, setDisableIpSetting] = useState(false)
  const dataFetchedRef = useRef(false)
  const [previousPath, setPreviousPath] = useState('')

  const isSupportIcx8200 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200)
  const isBlockingTsbSwitch = useIsSplitOn(Features.SWITCH_FIRMWARE_RELATED_TSB_BLOCKING_TOGGLE)

  const switchListPayload = {
    searchString: '',
    fields: ['name', 'serialNumber', 'id'],

    searchTargetFields: ['model'],
    pageSize: 10000
  }

  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])

  useEffect(() => {
    if (venueId && switchModel && switchRole === MEMEBER_TYPE.MEMBER) {
      handleSwitchList()
    }

    if(switchData && switchDetail){
      if(dataFetchedRef.current) return
      dataFetchedRef.current = true
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue({ ...switchDetail, ...switchData })
      setReadOnly(!!switchDetail.cliApplied)
      setDeviceOnline(
        isOperationalSwitch(
          switchDetail.deviceStatus as SwitchStatusEnum, switchDetail.syncedSwitchConfig)
      )

      if (switchDetail.ipFullContentParsed === false) {
        setDisableIpSetting(true)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, switchModel, switchRole, switchData, switchDetail])

  const handleSwitchList = async () => {
    const payload = {
      ...switchListPayload,
      searchString: switchModel.split('-')[0],
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
        ?.map((item: Vlan) => ({
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
    if (isBlockingTsbSwitch) {
      if (getTsbBlockedSwitch(values.id)?.length > 0) {
        showTsbBlockedSwitchErrorDialog()
        return
      }
    }

    if (switchRole === MEMEBER_TYPE.STANDALONE) {
      try {
        if (isOnlyFirmware) { values.specifiedType = FIRMWARE.AUTO }
        const payload = {
          ...defaultAddSwitchPayload,
          ...values
        }
        await addSwitch({ params: { tenantId: tenantId }, payload }).unwrap()
        navigate(`${basePath.pathname}/switch`, { replace: true })
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
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
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }
  }

  const handleEditSwitch = async (values: Switch) => {
    if(readOnly){
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/switch`
      })
      return
    }

    try {
      let payload = {
        ...values,
        stackMembers: [],
        trustPorts: []
      }

      if(disableIpSetting){
        delete payload.ipAddress
        delete payload.subnetMask
        delete payload.defaultGateway
        delete payload.ipAddressType
      }

      delete payload.specifiedType
      delete payload.serialNumber

      payload.rearModule = _.get(payload, 'rearModuleOption') === true ? 'stack-40g' : 'none'

      await updateSwitch({ params: { tenantId, switchId } , payload })
        .unwrap()
        .then(() => {
          const updatedFields = checkUpdateFields(values)
          const noChange = updatedFields.length === 0
          // TODO: should disable apply button while no changes
          const onlyChangeDescription
            = updatedFields.includes('description') && updatedFields.length === 1

          // These cases won't trigger activity service: UpdateSwitch
          if (noChange || onlyChangeDescription) {
            store.dispatch(
              switchApi.util.invalidateTags([
                { type: 'Switch', id: 'DETAIL' },
                { type: 'Switch', id: 'SWITCH' }
              ])
            )
            showToast({
              type: 'success',
              content: $t(
                { defaultMessage: 'Update switch {switchName} configuration success' },
                { switchName: payload?.name }
              )
            })
          }
        })

      dataFetchedRef.current = false

      if (!deviceOnline) { // only one tab
        redirectPreviousPage(navigate, previousPath, `${basePath.pathname}/switch`)
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const checkUpdateFields = function (values: Switch) {
    const fields = Object.keys(values ?? {})
    const currentValues = _.omitBy(values, (v) => v === undefined || v === '')
    const originalValues = _.pick({ ...switchDetail, ...switchData }, fields) as Switch

    return Object.keys(originalValues ?? {}).reduce((result: string[], key) => {
      if ((originalValues[key as keyof Switch]) !== currentValues[key as keyof Switch]) {
        return [ ...result, key ]
      }
      return result
    }, [])
  }

  const setFirmwareType = function (value: string) {
    const isRodan = getSwitchModel(value)?.includes('8200')
    if (isRodan) {
      formRef.current?.setFieldValue('specifiedType', FIRMWARE.ROUTER)
    }
    setIsRodanModel(isRodan || false)
  }

  const serialNumberRegExp = function (value: string) {
    const modelNotSupportStack = ['ICX7150-C08P', 'ICX7150-C08PT']
    // Only 7150-C08P/C08PT are Switch Only.
    // Only 7850 all models are Router Only.
    const modelOnlyFirmware = ['ICX7150-C08P', 'ICX7150-C08PT', 'ICX7850']
    const re = isSupportIcx8200 ? new RegExp(SWITCH_SERIAL_PATTERN_SUPPORT_RODAN)
      : new RegExp(SWITCH_SERIAL_PATTERN)
    if (value && !re.test(value)) {
      return Promise.reject($t({ defaultMessage: 'Serial number is invalid' }))
    }

    if(value && re.test(value)) {
      const model = getSwitchModel(value) || ''
      setSwitchModel(model)
      // notSupportStackModel.find(item => model?.indexOf(item) > -1)
      setIsSupportStack(!(modelNotSupportStack.indexOf(model) > -1))
      setIsOnlyFirmware(!!modelOnlyFirmware.find(item => model?.indexOf(item) > -1))
      setSerialNumber(value)
      setFirmwareType(value)
    }
    return Promise.resolve()
  }

  const [currentTab, setCurrentTab] = useState('details')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const handleChangeSerialNumber = (name: string) => {
    const serialNumber = formRef.current?.getFieldValue(name)?.toUpperCase()
    if(serialNumber) {
      formRef.current?.setFieldValue(name, serialNumber)
      formRef.current?.validateFields([name]).catch(()=>{
        setSwitchModel('')
      })
    }
  }

  return <>
    <PageHeader
      title={editMode ?
        $t({ defaultMessage: '{name}' }, {
          name: switchDetail?.name || switchDetail?.switchName || switchDetail?.serialNumber }):
        $t({ defaultMessage: 'Add Switch' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Wired' }) },
        { text: $t({ defaultMessage: 'Switches' }) },
        { text: $t({ defaultMessage: 'Switch List' }), link: '/devices/switch' }
      ]}
    />
    <StepsFormLegacy
      formRef={formRef}
      onFinish={editMode ? handleEditSwitch : handleAddSwitch}
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
        <Loader states={[{
          isLoading: venuesList.isLoading || isSwitchDataLoading || isSwitchDetailLoading
        }]}>
          <Row gutter={20}>
            <Col span={8}>
              <Tabs onChange={onTabChange}
                activeKey={currentTab}
                type='line'
                hidden={!editMode}
              >
                <Tabs.TabPane tab={$t({ defaultMessage: 'Switch Details' })} key='details' />
                {deviceOnline &&
                  <Tabs.TabPane tab={$t({ defaultMessage: 'Settings' })} key='settings' />
                }
              </Tabs>
              <div style={{ display: currentTab === 'details' ? 'block' : 'none' }}>
                {readOnly &&
                  <Alert type='info' message={$t(VenueMessages.CLI_APPLIED)} />}
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
                    options={venueOption}
                    onChange={async (value) => await handleVenueChange(value)}
                    disabled={readOnly || editMode}
                  />}
                />

                <Form.Item
                  name={editMode ? 'serialNumber' : 'id'}
                  label={$t({ defaultMessage: 'Serial Number' })}
                  rules={[
                    { required: true },
                    { validator: (_, value) => serialNumberRegExp(value) }
                  ]}
                  validateTrigger={['onKeyUp', 'onBlur']}
                  validateFirst
                  children={
                    <Input
                      disabled={readOnly || editMode}
                      style={{ textTransform: 'uppercase' }}
                      onBlur={() => handleChangeSerialNumber(editMode ? 'serialNumber' : 'id')}
                    />
                  }
                />

                {!editMode &&
                  <SwitchUpgradeNotification
                    isDisplay={!_.isEmpty(switchModel)}
                    isDisplayHeader={true}
                    type={switchRole === MEMEBER_TYPE.STANDALONE ?
                      SWITCH_UPGRADE_NOTIFICATION_TYPE.SWITCH :
                      SWITCH_UPGRADE_NOTIFICATION_TYPE.STACK}
                    validateModel={[switchModel]}
                  />
                }

                <Form.Item
                  label={<>
                    {$t({ defaultMessage: 'Add as' })}
                    {!isSupportStack && <Tooltip.Question
                      title={$t(SwitchMessages.MEMBER_NOT_SUPPORT_STACKING_TOOLTIP)}
                      placement='bottom'
                    />}
                    {switchRole === MEMEBER_TYPE.MEMBER && <Tooltip.Question
                      title={$t(SwitchMessages.FIRMWARE_TYPE_TOOLTIP)}
                      placement='bottom'
                    />}
                  </>}
                  hidden={editMode}
                  initialValue={MEMEBER_TYPE.STANDALONE}
                >
                  <Radio.Group
                    value={switchRole}
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
                        value={MEMEBER_TYPE.MEMBER}
                        disabled={!isSupportStack} >
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
                    children={<Input disabled={readOnly} />}
                  />

                  <Form.Item
                    name='description'
                    label={$t({ defaultMessage: 'Description' })}
                    initialValue={''}
                    rules={[
                      { min: 1, transform: (value) => value.trim() },
                      { max: 255, transform: (value) => value.trim() }
                    ]}
                    children={<Input.TextArea
                      rows={4}
                      maxLength={180}
                      disabled={readOnly}/>}
                  />

                  <Form.Item
                    name='specifiedType'
                    initialValue={FIRMWARE.AUTO}
                    label={<>
                      {$t({ defaultMessage: 'Firmware Type:' })}
                      <Tooltip.Question
                        title={$t(SwitchMessages.FIRMWARE_TYPE_TOOLTIP)}
                        placement='bottom'
                      />
                    </>}
                    hidden={editMode}
                  >
                    <Select disabled={isOnlyFirmware || isRodanModel}>
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

                {!editMode && <Form.Item
                  name='initialVlanId'
                  initialValue={null}
                  label={<>
                    {$t({ defaultMessage: 'DHCP Client:' })}
                    <Tooltip.Question
                      title={$t(SwitchMessages.DHCP_CLIENT_TOOLTIP)}
                      placement='bottom'
                    />
                  </>}
                  children={
                    <Select
                      disabled={dhcpClientOption.length < 1}
                      options={[
                        { label: $t({ defaultMessage: 'Select VLAN...' }), value: null },
                        ...dhcpClientOption
                      ]} />
                  }
                />}
              </div>
              {editMode &&
                  <>
                    <Form.Item name='id' hidden={true}><Input /></Form.Item>
                    <Form.Item name='firmwareVersion' hidden={true}><Input /></Form.Item>
                    <Form.Item name='trustPorts' hidden={true}><Input /></Form.Item>
                  </>
              }
              <Form.Item name='enableStack' initialValue={false} hidden={true}><Input /></Form.Item>
              {editMode &&
                <div style={{ display: currentTab === 'settings' ? 'block' : 'none' }}>
                  <SwitchStackSetting
                    apGroupOption={dhcpClientOption}
                    readOnly={readOnly}
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
}

