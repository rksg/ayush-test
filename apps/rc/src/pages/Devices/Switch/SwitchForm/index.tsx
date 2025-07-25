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
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import {
  switchApi,
  useGetSwitchQuery,
  useAddSwitchMutation,
  useUpdateSwitchMutation,
  useAddStackMemberMutation,
  useLazyGetSwitchListQuery,
  useSwitchDetailHeaderQuery,
  useLazyGetVlansByVenueQuery,
  useGetSwitchAuthenticationQuery,
  useGetSwitchListQuery,
  useGetSwitchVenueVersionListV1001Query,
  useUpdateSwitchAuthenticationMutation
} from '@acx-ui/rc/services'
import {
  getSwitchModel,
  isOperationalSwitch
} from '@acx-ui/rc/switch/utils'
import {
  SwitchMessages,
  Switch,
  SwitchViewModel,
  IGMP_SNOOPING_TYPE,
  Vlan,
  SwitchStatusEnum,
  isFirmwareVersionAbove10010f,
  redirectPreviousPage,
  LocationExtended,
  VenueMessages,
  checkSwitchUpdateFields,
  checkVersionAtLeast09010h,
  convertInputToUppercase,
  FirmwareSwitchVenueVersionsV1002,
  SwitchFirmwareModelGroup,
  getSwitchFwGroupVersionV1002,
  createSwitchSerialPattern,
  createSwitchSerialPatternForSpecific8100Model,
  isSpecific8100Model
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
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)
  const isSupport8100X = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100X)
  const isSupport7550Zippy = useIsSplitOn(Features.SWITCH_SUPPORT_ICX7550Zippy)
  const isSupport8100Phase2 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100_PHASE2_TOGGLE)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)

  const { $t } = useIntl()
  const { tenantId, switchId, action } = useParams()
  const editMode = action === 'edit'
  const navigate = useNavigate()
  const location = useLocation()
  const formRef = useRef<StepsFormLegacyInstance<Switch>>()
  const basePath = useTenantLink('/devices/')

  const venuesListV1001 = useGetSwitchVenueVersionListV1001Query({
    params: { tenantId: tenantId },
    payload: {
      firmwareType: '',
      firmwareVersion: '',
      search: '', updateAvailable: ''
    }
  })

  const [addSwitch] = useAddSwitchMutation()
  const [updateSwitch] = useUpdateSwitchMutation()
  const [addStackMember] = useAddStackMemberMutation()
  const [updateSwitchAuthentication] = useUpdateSwitchAuthenticationMutation()
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
  const [isBabyRodanModel, setIsBabyRodanModel] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [readOnly, setReadOnly] = useState(false)
  const [disableIpSetting, setDisableIpSetting] = useState(false)
  const dataFetchedRef = useRef(false)
  const [previousPath, setPreviousPath] = useState('')
  const [isSwitchFirmwareAbove10010f, setIsSwitchFirmwareAbove10010f] = useState(false)

  const [currentFirmwareV1002, setCurrentFirmwareV1002] =
    useState([] as FirmwareSwitchVenueVersionsV1002[])

  const getSwitchInfo = useGetSwitchListQuery({ params: { tenantId },
    payload: { filters: { id: [switchId || serialNumber] } }, enableRbac: true }, {
    skip: !editMode
  })

  const isVenueIdEmpty = _.isEmpty(venueId)
  const { data: switchData, isLoading: isSwitchDataLoading } =
    useGetSwitchQuery({
      params: { tenantId, switchId, venueId },
      enableRbac: true
    }, {
      skip: !editMode || isVenueIdEmpty
    })
  const { data: switchDetail, isLoading: isSwitchDetailLoading } =
    useSwitchDetailHeaderQuery({
      params: { tenantId, switchId, venueId },
      enableRbac: true
    }, {
      skip: !editMode || isVenueIdEmpty
    })

  const { data: switchAuth, isLoading: isSwitchAuthLoading, isFetching: isSwitchAuthFetching } =
  useGetSwitchAuthenticationQuery({
    params: { tenantId, switchId, venueId }
  }, {
    skip: !editMode || isVenueIdEmpty || !isSwitchFlexAuthEnabled || !isSwitchFirmwareAbove10010f
  })

  const switchListPayload = {
    searchString: '',
    fields: ['name', 'serialNumber', 'id'],

    searchTargetFields: ['model'],
    pageSize: 10000
  }

  useEffect(() => {
    if(getSwitchInfo.data) {
      setVenueId(getSwitchInfo.data.data[0].venueId)
    }
  }, [getSwitchInfo])

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
      formRef?.current?.setFieldsValue({
        ...switchDetail, ...switchData, ..._.omit(switchAuth, ['id'])
      })

      setIsSwitchFirmwareAbove10010f(isFirmwareVersionAbove10010f(switchDetail?.firmware))
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

  useEffect(() => {
    if (switchAuth && !isSwitchAuthLoading && !isSwitchAuthFetching) {
      formRef?.current?.setFieldsValue({
        ...formRef?.current?.getFieldsValue(),
        ..._.omit(switchAuth, ['id'])
      })
    }
  }, [switchAuth, isSwitchAuthLoading, isSwitchAuthFetching])

  const handleSwitchList = async () => {
    const payload = {
      ...switchListPayload,
      searchString: switchModel.split('-')[0],
      filters: { isStack: [true], venueId: [venueId] }
    }
    const memberList =
      (await getSwitchList({
        params: {
          tenantId: tenantId, venueId
        },
        payload, enableRbac: true
      }, true))
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
    if (!venuesListV1001.isLoading) {
      const venues = venuesListV1001?.data?.data?.map(item => ({
        label: item.venueName,
        value: item.venueId
      })) ?? []
      const sortedVenueOption = _.sortBy(venues, (v) => v.label)
      setVenueOption(sortedVenueOption)
    }
  }, [venuesListV1001])

  const handleVenueChange = async (value: string) => {
    setVenueId(value)

    if (venuesListV1001 && venuesListV1001.data) {
      const venueVersions = venuesListV1001.data?.data?.find(
        venue => venue['venueId'] === value)?.versions
      setCurrentFirmwareV1002(venueVersions || [])
    }


    const vlansByVenue = value ?
      (await getVlansByVenue({
        params: { tenantId: tenantId, venueId: value },
        enableRbac: true
      })).data
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
    const fw = getSwitchFwGroupVersionV1002(currentFirmwareV1002, SwitchFirmwareModelGroup.ICX71)
    if (!checkVersionAtLeast09010h(fw)) {
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
        await addSwitch({
          params: { tenantId, venueId: values.venueId },
          payload,
          enableRbac: true
        }).unwrap()
        navigate(`${basePath.pathname}/switch`, { replace: true })
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    } else if (switchRole === MEMEBER_TYPE.MEMBER) {
      const params = {
        tenantId,
        venueId: values.venueId,
        stackSerialNumber: formRef.current?.getFieldValue('existingStack'),
        newStackMemberSerialNumber: serialNumber,
        switchId: formRef.current?.getFieldValue('existingStack'),
        memberId: serialNumber
      }
      try {
        await addStackMember({
          params,
          enableRbac: true
        }).unwrap()
        navigate(`${basePath.pathname}/switch`, { replace: true })
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }
  }

  const handleEditSwitch = async (values: Switch) => {
    try {
      const omittedFields = [
        'specifiedType', 'serialNumber', 'authEnable', 'authDefaultVlan', 'guestVlan',
        ...(disableIpSetting ? ['ipAddress', 'subnetMask', 'defaultGateway', 'ipAddressType'] : [])

      ]
      let payload = {
        ..._.omit(values, omittedFields),
        stackMembers: [],
        trustPorts: []
      }

      payload.rearModule = _.get(payload, 'rearModuleOption') === true ? 'stack-40g' : 'none'

      if (isSwitchFlexAuthEnabled && isSwitchFirmwareAbove10010f) {
        await updateSwitchAuthentication({
          params: { tenantId, switchId, venueId: values.venueId },
          payload: {
            authEnable: values?.authEnable,
            authDefaultVlan: values?.authDefaultVlan,
            guestVlan: values?.guestVlan
          }
        }).unwrap()
      }

      await updateSwitch({
        params: { tenantId, switchId, venueId: values.venueId },
        payload,
        enableRbac: true
      }).unwrap()
        .then(() => {
          const updatedFields = checkSwitchUpdateFields(
            values, switchDetail, switchData, _.omit(switchAuth, ['id'])
          )
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

  const setFirmwareType = function (value: string) {
    const isRodan = getSwitchModel(value)?.includes('8200')
    if (isRodan) {
      formRef.current?.setFieldValue('specifiedType', FIRMWARE.ROUTER)
    }
    setIsRodanModel(isRodan || false)

    const isBabyRodan = getSwitchModel(value)?.includes('8100')
    if (isBabyRodan) {
      formRef.current?.setFieldValue('specifiedType', FIRMWARE.ROUTER)
    }
    setIsBabyRodanModel(isBabyRodan || false)
  }

  const serialNumberRegExp = function (value: string) {
    const baseModelNotSupportStack =
      ['ICX7150-C08P', 'ICX7150-C08PT', 'ICX8100-24', 'ICX8100-24P', 'ICX8100-48',
        'ICX8100-48P', 'ICX8100-C08PF', 'ICX8100-24-X', 'ICX8100-24P-X', 'ICX8100-48-X',
        'ICX8100-48P-X', 'ICX8100-C08PF-X']

    const modelNotSupportStack = isSupport8100Phase2
      ? baseModelNotSupportStack.filter(model => !model.endsWith('-X'))
      : baseModelNotSupportStack
    // Only 7150-C08P/C08PT are Switch Only.
    // Only 7850 all models are Router Only.
    const modelOnlyFirmware = ['ICX7150-C08P', 'ICX7150-C08PT', 'ICX7850']
    const re = (isSupport8100 && isSpecific8100Model(value))
      ? createSwitchSerialPatternForSpecific8100Model()
      : createSwitchSerialPattern({
        isSupport8100: isSupport8100,
        isSupport8100X: isSupport8100X,
        isSupport7550Zippy: isSupport7550Zippy
      })
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
      if (isSupport8100 && isBabyRodanModel) {
        formRef.current?.setFieldValue('initialVlanId', null)
      }
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
        submit: editMode ?
          $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' }),
        cancel: $t({ defaultMessage: 'Cancel' })
      }}
    >
      <StepsFormLegacy.StepForm
        onFinishFailed={({ errorFields })=> {
          const detailsFields = ['venueId', 'serialNumber', 'name', 'description']
          const hasErrorFields = !!errorFields.length
          const isSettingsTabActive = currentTab === 'settings'
          const isDetailsFieldsError = errorFields.filter(field =>
            detailsFields.includes(field.name[0] as string)
          ).length > 0

          if (deviceOnline && hasErrorFields && !isDetailsFieldsError && !isSettingsTabActive) {
            setCurrentTab('settings')
            showToast({
              type: 'error',
              content: readOnly
                ? $t(SwitchMessages.PLEASE_CHECK_INVALID_VALUES_AND_MODIFY_VIA_CLI)
                : $t(SwitchMessages.PLEASE_CHECK_INVALID_VALUES)
            })
          }
        }}
      >
        <Loader states={[{
          isLoading: isSwitchDataLoading || isSwitchDetailLoading
          || venuesListV1001.isLoading
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
                <Form.Item
                  name='venueId'
                  label={<>
                    {$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
                  </>}
                  initialValue={null}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please select <VenueSingular></VenueSingular>' })
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
                      onInput={convertInputToUppercase}
                      onBlur={() => handleChangeSerialNumber(editMode ? 'serialNumber' : 'id')}
                    />
                  }
                />

                {!editMode &&
                  <SwitchUpgradeNotification
                    isDisplay={!_.isEmpty(switchModel)}
                    isDisplayHeader={true}
                    venueFirmwareV1002={currentFirmwareV1002}
                    type={switchRole === MEMEBER_TYPE.STANDALONE ?
                      SWITCH_UPGRADE_NOTIFICATION_TYPE.SWITCH :
                      SWITCH_UPGRADE_NOTIFICATION_TYPE.STACK}
                    validateModel={[switchModel]}
                    switchModel={switchModel}

                  />
                }

                <Form.Item
                  label={<>
                    {$t({ defaultMessage: 'Add as' })}
                    {!isSupportStack && <Tooltip.Question
                      // eslint-disable-next-line max-len
                      title={$t(SwitchMessages.MEMBER_NOT_SUPPORT_STACKING_TOOLTIP, { switchModel })}
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
                    children={<Input />}
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
                    />}
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
                    <Select disabled={isOnlyFirmware || isRodanModel || isBabyRodanModel}>
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
                      disabled={dhcpClientOption?.length < 1 || (isSupport8100 && isBabyRodanModel)}
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
                  {readOnly && <Alert type='info' message={$t(VenueMessages.CLI_APPLIED)} />}
                  {switchDetail && <SwitchStackSetting
                    switchDetail={switchDetail}
                    apGroupOption={dhcpClientOption}
                    readOnly={readOnly}
                    deviceOnline={deviceOnline}
                    disableIpSetting={disableIpSetting}
                  />}
                </div>
              }
            </Col>
          </Row>
        </Loader>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </>
}

