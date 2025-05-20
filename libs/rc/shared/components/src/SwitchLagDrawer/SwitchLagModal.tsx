import { SetStateAction, useEffect, useState } from 'react'

import {
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Typography } from 'antd'
import { useWatch }          from 'antd/lib/form/Form'
import { DefaultOptionType } from 'antd/lib/select'
import { TransferItem }      from 'antd/lib/transfer'
import _                     from 'lodash'
import { useIntl }           from 'react-intl'
import styled                from 'styled-components/macro'

import {
  Button,
  Card,
  Drawer,
  GridCol,
  GridRow,
  Modal,
  showActionModal,
  StepsFormLegacy,
  Tooltip,
  Transfer
} from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  useAddLagMutation,
  useGetDefaultVlanQuery,
  useGetLagListQuery,
  useLazyGetSwitchVlanQuery,
  useLazyGetVlansByVenueQuery,
  useLazyGetSwitchConfigurationProfileByVenueQuery,
  useSwitchDetailHeaderQuery,
  useSwitchPortlistQuery,
  useUpdateLagMutation
} from '@acx-ui/rc/services'
import {
  SwitchVlanUnion,
  SwitchPortViewModel,
  Lag,
  LAG_TYPE,
  sortPortFunction,
  VlanModalType,
  isFirmwareVersionAbove10010gCd1Or10020bCd1
} from '@acx-ui/rc/switch/utils'
import {
  EditPortMessages,
  Vlan,
  VenueMessages
} from '@acx-ui/rc/utils'
import { useParams }              from '@acx-ui/react-router-dom'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import { getAllSwitchVlans, sortOptions, updateSwitchVlans } from '../SwitchPortTable/editPortDrawer.utils'
import { SelectVlanModal }                                   from '../SwitchPortTable/selectVlanModal'

const CardWrapper = styled.div<{ forceUpPort?: boolean }>`
  .ant-card {
    height: 296px;
    border-color: var(--acx-neutrals-30);
    box-shadow: 'none';
    .ant-card-extra{
      span {
        opacity: ${(props) => props.forceUpPort ? '1' : '40%' };
      }
    }
  }

`

export interface SwitchLagParams {
  switchMac: string,
  serialNumber: string
}

interface SwitchLagProps {
  visible: boolean
  isEditMode: boolean
  editData: Lag[]
  setVisible: (visible: boolean) => void
  type?: string
  params?: SwitchLagParams
}

export const SwitchLagModal = (props: SwitchLagProps) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { visible, setVisible, isEditMode, editData } = props
  const isSwitchLevelVlanEnabled = useIsSplitOn(Features.SWITCH_LEVEL_VLAN)
  const isSwitchLagForceUpEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_LAG_FORCE_UP_TOGGLE)

  const urlParams = useParams()
  const tenantId = urlParams.tenantId
  const switchId = urlParams.switchId || props.params?.switchMac || props.params?.serialNumber
  const serialNumber = urlParams.serialNumber || props.params?.serialNumber

  const portPayload = {
    fields: ['id', 'portIdentifier', 'opticsType', 'usedInFormingStack', 'authDefaultVlan'],
    page: 1,
    pageSize: 10000,
    filters: { switchId: [switchId] },
    sortField: 'portIdentifier',
    sortOrder: 'ASC'
  }

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)

  const { data: switchDetailHeader } =
  useSwitchDetailHeaderQuery({ params: { tenantId, switchId, serialNumber } })

  const portList = useSwitchPortlistQuery({
    params: { tenantId },
    payload: portPayload,
    enableRbac: true
  })
  const lagList = useGetLagListQuery({
    params: { tenantId, switchId, venueId: switchDetailHeader?.venueId },
    enableRbac: isSwitchRbacEnabled
  }, { skip: !switchDetailHeader?.venueId })

  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()
  const [getSwitchVlan] = useLazyGetSwitchVlanQuery()
  const [getSwitchConfigurationProfileByVenue]
    = useLazyGetSwitchConfigurationProfileByVenueQuery()

  const { data: switchesDefaultVlan } = useGetDefaultVlanQuery({
    params: { tenantId, venueId: switchDetailHeader?.venueId },
    payload: [switchId],
    enableRbac: isSwitchRbacEnabled
  }, { skip: !switchDetailHeader?.venueId })

  const [addLag] = useAddLagMutation()
  const [updateLag] = useUpdateLagMutation()

  const [vlanModalActivityTab, setVlanModalActivityTab] = useState(VlanModalType.UNTAGGED)
  const [currentPortType, setCurrentPortType] = useState(null as null | string)
  const [cliApplied, setCliApplied] = useState(false)
  const [availablePorts, setAvailablePorts] = useState([] as TransferItem[])
  const [finalAvailablePorts, setFinalAvailablePorts] = useState([] as TransferItem[])
  const [venueVlans, setVenueVlans] = useState([] as Vlan[])
  const [defaultVlanId, setDefaultVlanId] = useState(1 as number)
  const [portsTypeItem, setPortsTypeItem] = useState([] as DefaultOptionType[])
  const [hasSwitchProfile, setHasSwitchProfile] = useState(false)
  const [switchConfigurationProfileId, setSwitchConfigurationProfileId] = useState('')
  const [loading, setLoading] = useState<boolean>(false)
  const [forceUpPort, setForceUpPort] = useState<string>('')
  const [selectedPorts, setSelectedPorts] = useState([] as string[])
  // const [isStackMode, setIsStackMode] = useState(false) //TODO
  // const [stackMemberItem, setStackMemberItem] = useState([] as DefaultOptionType[])

  const {
    untaggedVlan,
    taggedVlans,
    ports,
    type
  } = (useWatch([], form) ?? {})

  useEffect(() => {
    const setVlanData = async () => {
      const venueId = switchDetailHeader?.venueId
      const switchVlans = await getSwitchVlan({
        params: { tenantId, switchId, venueId },
        options: { skip: !venueId },
        enableRbac: isSwitchRbacEnabled
      }, true).unwrap()
      const vlansByVenue = await getVlansByVenue({
        params: { tenantId, venueId },
        options: { skip: !venueId },
        enableRbac: isSwitchRbacEnabled
      }, true).unwrap()
      const switchProfile = await getSwitchConfigurationProfileByVenue({
        params: { tenantId, venueId },
        options: { skip: !venueId },
        enableRbac: isSwitchRbacEnabled
      }, true).unwrap()
      setVenueVlans(vlansByVenue)
      setSwitchVlans(switchVlans)
      setHasSwitchProfile(!!switchProfile?.length)
      setSwitchConfigurationProfileId(switchProfile?.[0]?.id)
    }

    if (portList.data && lagList.data && switchDetailHeader) {
      let allPorts: SwitchPortViewModel[] = portList.data.data
      if(isSwitchFlexAuthEnabled){
        allPorts = allPorts.filter(p => !p.authDefaultVlan)
      }
      setCliApplied(switchDetailHeader.cliApplied ?? false)
      if (switchDetailHeader.isStack) {
        // setIsStackMode(switchDetailHeader.isStack ?? false)
        // setStackMemberItem(switchDetailHeader.stackMembers?.map((s, id) =>
        //   ({
        //     label: $t({ defaultMessage: 'Stack Member {unitId}' }, { unitId: id + 1 }),
        //     key: id + 1,
        //     value: id + 1
        //   })) ?? [])
        allPorts = allPorts.filter(a => a.usedInFormingStack !== true)
      }
      const usedPortsId = _.flatMap(lagList.data.map(a => a.ports))
      const editDataPorts = isEditMode ? (editData[0].ports|| []) : []
      let availablePortIds = _.difference(
        allPorts.map(port => port.portIdentifier), usedPortsId)
      let availablePorts = availablePortIds
        .concat(editDataPorts)
        .map(portId => ({ id: portId }))
        .sort(sortPortFunction)
        .map(port => ({ name: port.id, key: port.id }))
      setAvailablePorts(availablePorts)

      const portTypeItem = _.uniqBy(allPorts.map(p => ({
        value: p.opticsType,
        key: p.opticsType,
        label: p.opticsType
      })), 'value')

      setPortsTypeItem(portTypeItem)
      setVlanData()

      if (isEditMode) {
        const getFirstPort = portList?.data?.data.find(data => {
          if (!Array.isArray(editData[0].ports)) {
            return false
          }
          return data.portIdentifier === editData[0].ports[0]
        })
        const portsType = getFirstPort?.opticsType
        if (portsType) {
          setCurrentPortType(portsType)
          setFinalAvailablePorts(availablePorts
            .filter(p => {
              return p.key ? getSameTypePortList(portsType).includes(p.key) : false
            }))
        }
        let forceUpPortVal = editData[0]?.forceUpPort || ''
        if(isSwitchLagForceUpEnabled){
          setForceUpPort(forceUpPortVal)
        }
        form.setFieldsValue({
          ...editData[0],
          portsType,
          ...(isSwitchLagForceUpEnabled &&
            { forceUp: forceUpPortVal !== '' })
        })
      }
    }
  }, [portList.data, lagList, switchDetailHeader, editData])


  useEffect(() => {
    if (!isEditMode &&
      Array.isArray(switchesDefaultVlan) && switchesDefaultVlan.length > 0) {
      const defaultVlan = switchesDefaultVlan[0].defaultVlanId
      setDefaultVlanId(defaultVlan)
      form.setFieldValue('untaggedVlan', defaultVlan)
    }
  }, [form, isEditMode, switchesDefaultVlan])

  const onClose = () => {
    setVisible(false)
    setCurrentPortType(null)
    setFinalAvailablePorts([])
    form.setFieldsValue(
      {
        name: '',
        untaggedVlan: defaultVlanId,
        taggedVlans: [],
        type: LAG_TYPE.STATIC,
        portsType: null,
        ports: []
      }
    )
  }

  const onSubmit = async () => {
    const value = form.getFieldsValue()
    if (isEditMode) {
      const taggedVlans = Array.isArray(value.taggedVlans) ? value.taggedVlans :
        _.isString(value.taggedVlans) ? value.taggedVlans.split(',') : []

      try {
        let payload = {
          ...value,
          ..._.omit(value, ['portsType', 'forceUp']),
          lagId: editData[0].lagId,
          id: editData[0].id,
          realRemove: editData[0].realRemove,
          switchId: editData[0].switchId,
          taggedVlans: taggedVlans.filter((vlan: string) => !_.isEmpty(vlan)),
          ...(isSwitchLagForceUpEnabled && forceUpPort !== '' && { forceUpPort })
        }

        if(payload.forceUp){
          delete payload.forceUp
        }
        setLoading(true)
        await updateLag({
          params: {
            tenantId,
            switchId,
            venueId: switchDetailHeader?.venueId,
            lagId: editData[0].id
          },
          payload,
          enableRbac: isSwitchRbacEnabled
        }).unwrap()

        setLoading(false)
        onClose()
      } catch (err) {
        setLoading(false)
        console.log(err) // eslint-disable-line no-console
      }
    } else {
      try {
        const taggedVlans = _.isString(value.taggedVlans) ? value.taggedVlans.split(',') : []
        let payload = {
          ...value,
          id: '',
          taggedVlans: taggedVlans.filter((vlan: string) => !_.isEmpty(vlan)),
          ...(isSwitchLagForceUpEnabled && forceUpPort !== '' && { forceUpPort })
        }

        delete payload.portsType
        if(payload.forceUp){
          delete payload.forceUp
        }
        await addLag({
          params: { tenantId, switchId, venueId: switchDetailHeader?.venueId },
          payload,
          enableRbac: isSwitchRbacEnabled
        }).unwrap()
        onClose()
      } catch (err) {
        console.log(err) // eslint-disable-line no-console
      }
    }
  }

  const onPortTypeChange = (value: string) => {
    if(currentPortType === value){
      return
    }

    if (currentPortType === null) {
      form.setFieldValue('ports', undefined)
      changePortType(value)
    } else {
      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: 'Change port type?' }),
        content: $t({
          // eslint-disable-next-line max-len
          defaultMessage: 'Since a LAG can contain only ports of one type, changing the port type will clear the list of selected ports' }),
        okText: $t({ defaultMessage: 'OK' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        onOk: async () => {
          form.setFieldValue('ports', undefined)
          changePortType(value)},
        onCancel: async () => {form.setFieldValue('portsType', currentPortType)}
      })
    }
  }


  const getSameTypePortList = (type: string) => {
    let samePortTypePortIds: string[] = []
    portList.data?.data.filter(p => p.opticsType === type)
      .forEach((p) => samePortTypePortIds.push(p.portIdentifier))
    return samePortTypePortIds
  }


  const changePortType = (type: string) => {
    setCurrentPortType(type)

    form.setFieldValue('stackMember', null)
    let finalAvailablePorts: SetStateAction<TransferItem[]> = []
    if (type) {
      finalAvailablePorts = availablePorts
        .filter(p => {
          return p.key ? getSameTypePortList(type).includes(p.key) : false
        })
    }
    setFinalAvailablePorts(finalAvailablePorts)

    if(isSwitchLagForceUpEnabled){
      form.setFieldValue('forceUp', false)
      setForceUpPort('')
      setSelectedPorts([])
    }
  }

  // TODO:
  // const onStackUnitChange = (value: string) => {
  //   const selectedPorts = form.getFieldValue('ports')
  //   if (value && currentPortType) {
  //     setFinalAvailablePorts(availablePorts
  //       .filter(p => {
  //         return p.key ? getSameTypePortList(currentPortType).includes(p.key) : false
  //       })
  //       .filter(p => p.key?.split('/')[0] === String(value))
  //       .filter(p => !selectedPorts.some(((sp: { key: string | undefined }) => sp.key === p.key)))
  //     )
  //   } else if(currentPortType) {
  //     setFinalAvailablePorts(availablePorts
  //       .filter(p => {
  //         return p.key ? getSameTypePortList(currentPortType).includes(p.key) : false
  //       })
  //       .filter(p => !selectedPorts.some(((sp: { key: string | undefined }) => sp.key === p.key)))
  //     )
  //   }
  // }

  const getTitle = () => {
    const title = isEditMode
      ? $t({ defaultMessage: 'Edit LAG' })
      : $t({ defaultMessage: 'Add LAG' }
      )
    return title
  }

  const validateVlan = () => {
    const { $t } = getIntl()
    if (!form.getFieldValue('untaggedVlan') && !form.getFieldValue('taggedVlans')) {
      return Promise.reject(
        $t({ defaultMessage: 'Each port must be a member of at least one VLAN' }))
    }
    return Promise.resolve()
  }

  const validatePorts = () => {
    const { $t } = getIntl()
    const selectedPorts = form.getFieldValue('ports')
    if (
      !_.isEmpty(selectedPorts) &&
      switchDetailHeader?.model) {
      let count = 16
      const model = switchDetailHeader.model.slice(3, 7)
      if (['7250', '7450', '7650', '7750', '7850', '7550', '8200'].includes(model)) {
        count = 16
      } else if (['7150'].includes(model)) {
        count = 8
      }
      if (selectedPorts.length > count) {
        return Promise.reject(
          $t({ defaultMessage: 'The maximum number of ports is {count}.' }, { count }))
      }
    }

    if(isSwitchLagForceUpEnabled){
      setForceUpPort(ports.includes(forceUpPort) ? forceUpPort : '')
    }

    form.getFieldValue('ports')
    return Promise.resolve()
  }

  const footer = [
    <Space key='edit-lag-modal-footer'>
      <Button key='cancelBtn' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        key='okBtn'
        type='primary'
        onClick={() => form.submit()}>
        {isEditMode ? $t({ defaultMessage: 'Apply' }): $t({ defaultMessage: 'Add' })}
      </Button>
    </Space>
  ]

  const footerForDrawer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='edit-lag-drawer-footer'>
      <Button key='cancel' onClick={onClose} disabled={loading}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        loading={loading}
        key='apply'
        type='primary'
        onClick={() => form.submit()}>
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    </Space>
  ]

  const [selectModalVisible, setSelectModalVisible] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [useVenueSettings, setUseVenueSettings] = useState(true)
  const [switchVlans, setSwitchVlans] = useState({} as SwitchVlanUnion)
  const onClickEditUntaggedVlan = () =>{
    setVlanModalActivityTab(VlanModalType.UNTAGGED)
    setSelectModalVisible(true)
  }
  const onClickEditTaggedVlan = () =>{
    setVlanModalActivityTab(VlanModalType.TAGGED)
    setSelectModalVisible(true)
  }

  const resetForceUp = () => {
    if(isSwitchLagForceUpEnabled){
      setForceUpPort('')
      form.setFieldValue('forceUp', false)
    }
  }

  const onSelectChange = (_sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    if(isSwitchLagForceUpEnabled){
      const targetPorts: string[] = []
      targetSelectedKeys.forEach(item => {
        if(ports.includes(item)){
          form.setFieldValue('forceUp', item === forceUpPort)
          targetPorts.push(item)
        }
      })
      setSelectedPorts(targetPorts)
    }
  }

  const lagForm = <Form
    form={form}
    layout='vertical'
    onFinish={onSubmit}
  >
    <Row gutter={20}>
      <Col span={10}>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'LAG Name' })}
          rules={[
            { required: true },
            { min: 1 },
            { max: 64 }
          ]}
          validateFirst
          children={<Input />}
        />
        <Form.Item
          name='type'
          initialValue={LAG_TYPE.STATIC}
          label={$t({ defaultMessage: 'Type' })}
          rules={[{
            required: true
          }]}
          children={
            <Radio.Group>
              <Space direction='vertical'>
                <Radio
                  value={LAG_TYPE.STATIC}
                  disabled={isEditMode}
                  onChange={() => resetForceUp()}>
                  {$t({ defaultMessage: 'Static' })}
                </Radio>
                <Radio
                  value={LAG_TYPE.DYNAMIC}
                  disabled={isEditMode}>
                  {$t({ defaultMessage: 'Dynamic' })}
                </Radio>
              </Space>
            </Radio.Group>
          }
        />
        <StepsFormLegacy.Title
          style={{ padding: '10px 0px' }}>
          {$t({ defaultMessage: 'Select Ports' })}
        </StepsFormLegacy.Title>
        <Form.Item
          name='portsType'
          label={<>
            {$t({ defaultMessage: 'Ports Type' })}
            <Tooltip
              placement='bottom'
              title={
                $t({ defaultMessage: 'Select ports of the same type' })
              }
            >
              <QuestionMarkCircleOutlined />
            </Tooltip>
          </>}
          initialValue={null}
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please select ports type' })
          }]}
          children={<Select
            options={[
              { label: $t({ defaultMessage: 'Select ports type...' }), value: null },
              ...portsTypeItem
            ]}
            onChange={onPortTypeChange}
          />}
        />
        {/* {isStackMode &&  //TODO: Need to check antd transfer component
        <Form.Item
          name='stackMember'
          label={<>
            {$t({ defaultMessage: 'Stack Member' })}
          </>}
          initialValue={null}
          children={<Select
            onChange={onStackUnitChange}
            options={[
              { label: $t({ defaultMessage: 'All Stack Member' }), value: null },
              ...stackMemberItem
            ]}
          />}
        />} */}
      </Col>
    </Row>
    <Row gutter={20}>
      <Col span={10}>
        <Form.Item
          name='ports'
          data-testid='targetKeysFormItem'
          valuePropName='targetKeys'
          rules={[{
            required: true,
            // eslint-disable-next-line max-len
            message: $t({ defaultMessage: 'All member ports should have the same configured port speed' })
          }, {
            validator: () => validatePorts()
          }]}>
          <Transfer
            listStyle={{ width: 190, height: 316 }}
            showSearch
            showSelectAll={false}
            dataSource={[...finalAvailablePorts]}
            render={(item: TransferItem) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{item.name}</span>
                {item.name === forceUpPort &&
                  <span style={{ color: 'var(--acx-semantics-green-50)' }}>Force-up</span>}
              </div>
            )}
            operations={['Add', 'Remove']}
            onSelectChange={onSelectChange}
          />
        </Form.Item>
      </Col>
      { isSwitchLagForceUpEnabled && type === LAG_TYPE.DYNAMIC &&
        isFirmwareVersionAbove10010gCd1Or10020bCd1(switchDetailHeader?.firmware) &&
        <Col
          span={10}
          flex='300px'
          offset={5}
          style={{ padding: '16px', marginTop: '6px' }}
          data-testid='force-up-interface'>
          <CardWrapper forceUpPort={forceUpPort !== ''}>
            <Card
              title={$t({ defaultMessage: 'Force-Up Interface' })}
              action={{
                actionName: $t({ defaultMessage: 'Reset' }),
                onActionClick: resetForceUp
              }}
            >
              <GridRow style={{ flexFlow: '2' }}>
                <GridCol col={{ span: 24 }}>
                  <span data-testid='force-up-port' style={{ color: 'var(--acx-neutrals-60)' }}>
                    {forceUpPort !== '' ? forceUpPort : noDataDisplay}</span>
                </GridCol>
              </GridRow>
              <GridRow>
                <GridCol col={{ span: 24 }}>
                  <Space size={8} style={{ display: 'flex', margin: '20px 0 30px' }}>
                    {
                      selectedPorts.length === 1 &&
                        <><Typography.Text style={{ display: 'flex', fontSize: '12px' }}>
                          {$t({ defaultMessage: 'Port ' })} {selectedPorts[0]}
                        </Typography.Text>
                        <Form.Item
                          noStyle
                          name='forceUp'
                          valuePropName='checked'
                          children={<Tooltip
                            title={(forceUpPort !== '' && forceUpPort !== selectedPorts[0]) ||
                                  type !== LAG_TYPE.DYNAMIC ?
                              $t(EditPortMessages.ONLY_ONE_PORT_CAN_BE_FORCE_UP) : ''}>
                            <Switch
                              disabled={(forceUpPort !== '' && forceUpPort !== selectedPorts[0]) ||
                                  type !== LAG_TYPE.DYNAMIC}
                              style={{ display: 'flex' }}
                              onChange={(value) => value ?
                                setForceUpPort(selectedPorts[0]) : setForceUpPort('')} />
                          </Tooltip>}
                        /></>
                    }
                    {
                      selectedPorts.length > 1 &&
                  $t({ defaultMessage: 'You can select only one port and set it to force-up' })
                    }
                  </Space>
                </GridCol>
              </GridRow>
            </Card>
          </CardWrapper>
        </Col>
      }
    </Row>

    <Form.Item
      name='untaggedVlan'
      label={$t({ defaultMessage: 'Untagged VLAN' })}
      children={
        <Tooltip
          placement='bottom'
          title={cliApplied ? $t(VenueMessages.CLI_APPLIED) : ''}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '150px 50px'
          }}>
            <div>{untaggedVlan
              ? $t({ defaultMessage: 'VLAN-ID: {vlan}' }, {
                vlan: untaggedVlan
              }) : '--'}</div>

            <Button type='link' onClick={onClickEditUntaggedVlan} disabled={cliApplied}>
              {$t({ defaultMessage: 'Edit' })}
            </Button>
          </div>
        </Tooltip>}
    />
    <Form.Item
      name='taggedVlans'
      label={$t({ defaultMessage: 'Tagged VLANs' })}
      rules={[
        { validator: () => validateVlan() }
      ]}
      children={
        <Tooltip
          placement='bottom'
          title={cliApplied ? $t(VenueMessages.CLI_APPLIED) : ''}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '150px 50px'
          }}>
            <div>{((taggedVlans?.length > 0) && !_.isEmpty(taggedVlans?.toString()))
              ? $t({ defaultMessage: 'VLAN-ID: {vlan}' },
                {
                  vlan: sortOptions(
                    taggedVlans?.toString().split(','), 'number').join(', ')
                }) : '--'}</div>
            <Button type='link' onClick={onClickEditTaggedVlan} disabled={cliApplied}>
              {$t({ defaultMessage: 'Edit' })}
            </Button>
          </div>
        </Tooltip>}
    />
  </Form>

  return (
    <>
      {
        props.type === 'drawer'
          ? <Drawer
            title={getTitle()}
            visible={visible}
            onClose={onClose}
            width={isSwitchLagForceUpEnabled && type === LAG_TYPE.DYNAMIC ? 900 : 644}
            footer={footerForDrawer}
            children={lagForm}
          />
          : <Modal
            title={getTitle()}
            visible={visible}
            onCancel={onClose}
            width={isSwitchLagForceUpEnabled && type === LAG_TYPE.DYNAMIC ? 900 : 644}
            footer={footer}
            destroyOnClose={true}
            children={lagForm}
          />
      }

      {
        selectModalVisible &&
          <SelectVlanModal
            form={form}
            selectModalvisible={selectModalVisible}
            setSelectModalvisible={setSelectModalVisible}
            setUseVenueSettings={setUseVenueSettings}
            onValuesChange={()=>{form.validateFields(['taggedVlans'])}}
            defaultVlan={String(defaultVlanId)}
            defaultTabKey={vlanModalActivityTab}
            switchVlans={getAllSwitchVlans(switchVlans)}
            venueVlans={venueVlans}
            taggedVlans={taggedVlans}
            untaggedVlan={untaggedVlan}
            vlanDisabledTooltip={$t(EditPortMessages.ADD_VLAN_DISABLE)}
            cliApplied={cliApplied}
            hasSwitchProfile={hasSwitchProfile}
            profileId={switchConfigurationProfileId}
            switchIds={switchId ? [switchId] : []}
            venueId={switchDetailHeader?.venueId}
            updateSwitchVlans={async (values: Vlan) =>
              updateSwitchVlans(
                values,
                switchVlans,
                setSwitchVlans,
                venueVlans,
                setVenueVlans,
                isSwitchLevelVlanEnabled
              )
            }
            switchFirmwares={switchDetailHeader?.firmware ? [switchDetailHeader.firmware] : []}
          />
      }
    </>
  )

}
