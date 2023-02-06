
import { SetStateAction, useEffect, useState } from 'react'

import {
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space } from 'antd'
import { useWatch }               from 'antd/lib/form/Form'
import { DefaultOptionType }      from 'antd/lib/select'
import Transfer, { TransferItem } from 'antd/lib/transfer'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'

import { Button, Modal, showActionModal, StepsForm } from '@acx-ui/components'
import { useGetDefaultVlanQuery,
  useGetLagListQuery,
  useLazyGetSwitchVlanQuery,
  useLazyGetVlansByVenueQuery,
  useSwitchDetailHeaderQuery,
  useSwitchPortlistQuery } from '@acx-ui/rc/services'
import { EdgeIpModeEnum, SwitchVlanUnion,
  EditPortMessages,
  SwitchPortViewModel,
  Vlan }                                                  from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { getAllSwitchVlans, sortOptions } from '../SwitchPortTable/editPortDrawer.utils'
import { SelectVlanModal }                from '../SwitchPortTable/selectVlanModal'

interface SwitchLagProps {
  visible: boolean
  isEditMode: boolean
  setVisible: (visible: boolean) => void
}

export const sortPortFunction = (portIdA: string, portIdB: string) => {
  const splitA = portIdA.split('/')
  const valueA = calculatePortOrderValue(splitA[0], splitA[1], splitA[2])

  const splitB = portIdB.split('/')
  const valueB = calculatePortOrderValue(splitB[0], splitB[1], splitB[2])
  return valueA - valueB
}

export const calculatePortOrderValue = (unitId: string, moduleId: string, portNumber: string) => {
  return parseInt(unitId, 10) * 10000 + parseInt(moduleId, 10) * 100 + parseInt(portNumber, 10)
}

export const SwitchLagModal = (props: SwitchLagProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, isEditMode } = props
  const { tenantId, switchId, serialNumber } = useParams()

  const portPayload = {
    fields: ['id', 'portIdentifier', 'opticsType', 'usedInFormingStack'],
    page: 1,
    pageSize: 10000,
    filters: { switchId: [switchId] },
    sortField: 'portIdentifier',
    sortOrder: 'ASC'
  }


  const portList = useSwitchPortlistQuery({ params: { tenantId }, payload: portPayload })
  const lagList = useGetLagListQuery({ params: { tenantId, switchId } })
  const [currentPortType, setCurrentPortType] = useState(null as null | string)
  const [availablePorts, setAvailablePorts] = useState([] as TransferItem[])
  const [finalAvailablePorts, setFinalAvailablePorts] = useState([] as TransferItem[])
  const [venueVlans, setVenueVlans] = useState([] as Vlan[])
  const { data: switchDetailHeader } =
  useSwitchDetailHeaderQuery({ params: { tenantId, switchId, serialNumber } })
  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()
  const { data: switchesDefaultVlan }
  = useGetDefaultVlanQuery({ params: { tenantId }, payload: [switchId] })
  const [getSwitchVlan] = useLazyGetSwitchVlanQuery()

  useEffect(() => {

    const setVlanData = async () => {
      const venueId = switchDetailHeader?.venueId
      const switchVlans = await getSwitchVlan({ params: { tenantId, switchId } }, true).unwrap()
      const vlansByVenue = await getVlansByVenue({
        params: { tenantId, venueId: venueId }
      }, true).unwrap()

      setVenueVlans(vlansByVenue)
      setSwitchVlans(switchVlans)
    }

    if (portList.data && lagList.data && switchDetailHeader) {
      let allPorts: SwitchPortViewModel[] = portList.data.data
      if (switchDetailHeader.isStack) {
        // setIsStackMode(switchDetailHeader.isStack ?? false)
        // setStackMemberItem(switchDetailHeader.stackMembers?.map((s, id) =>
        //   ({
        //     label: $t({ defaultMessage: 'Stack Member {unitId}' }, { unitId: id + 1 }),
        //     key: id + 1,
        //     value: id + 1
        //   })) ?? [])
        allPorts = portList.data.data.filter(a => a.usedInFormingStack !== true)
      }
      // this.portData = allPorts // CHECK needed it?
      const usedPortsId = _.flatMap(lagList.data.map(a => a.ports))
      let availablePortIds = _.difference(
        allPorts.map(port => port.portIdentifier), usedPortsId)
      let availablePorts = availablePortIds
        .sort(sortPortFunction)
        .map(portId => ({ name: portId, key: portId }))
      setAvailablePorts(availablePorts)

      const portTypeItem = _.uniqBy(allPorts.map(p => ({
        value: p.opticsType,
        key: p.opticsType,
        label: p.opticsType
      })), 'value')

      setPortsTypeItem(portTypeItem)

      setVlanData()
    }
  }, [portList.data, lagList, switchDetailHeader])

  useEffect(()=>{
    if(!isEditMode && switchesDefaultVlan) {
      const defaultVlan = switchesDefaultVlan[0].defaultVlanId
      setDefaultVlanId(defaultVlan)
      form.setFieldValue('untaggedVlan', defaultVlan)
    }
  }, [switchesDefaultVlan])

  const [defaultVlanId, setDefaultVlanId] = useState(1 as number)
  // const [isStackMode, setIsStackMode] = useState(false)
  // const [stackMemberItem, setStackMemberItem] = useState([] as DefaultOptionType[])
  const [portsTypeItem, setPortsTypeItem] = useState([] as DefaultOptionType[])

  const onClose = () => {
    setVisible(false)
    // form.resetFields()
  }

  const [form] = Form.useForm()

  const onPortTypeChange = (value: string) => {
    if(currentPortType === value){
      return
    }

    if (currentPortType === null) {
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
        onOk: async () => {changePortType(value)},
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
    form.setFieldValue('ports', [''])
    form.setFieldValue('stackMember', null)
    let finalAvailablePorts: SetStateAction<TransferItem[]> = []
    if (type) {
      finalAvailablePorts = availablePorts
        .filter(p => {
          return p.key ? getSameTypePortList(type).includes(p.key) : false
        })
    }
    setFinalAvailablePorts(finalAvailablePorts)
  }


  // TODO: need to check the transfer components
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


  // loadVlans() {
  //   const getVlansByVenue$ = this.getVlansByVenue$();
  //   const getVEs$ = this.getVEsList$();
  //   forkJoin(getVlansByVenue$, getVEs$).subscribe(([venueVlans, veRouted]) => {
  //     this.venueVlans = venueVlans;
  //     const defaultVlans = _.uniq(Object.values(this.defaultVlanMap));
  //     this.venueVlansPrint = this.venueVlans.filter(item => defaultVlans.indexOf(item) !== -1);
  //     this.handleVlan();
  //     this.getVlanUsedByVe(veRouted['data']);
  //   });
  // }

  const getTitle = () => {
    const title = isEditMode
      ? $t({ defaultMessage: 'Edit LAG' })
      : $t({ defaultMessage: 'Add LAG' }
      )
    return title
  }

  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='edit-port-footer'>
      <Button key='cancelBtn' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        key='okBtn'
        type='secondary'
        onClick={onClose}>
        {$t({ defaultMessage: 'Ok' })}
      </Button>
    </Space>
  ]

  const [selectModalVisible, setSelectModalVisible] = useState(false)
  const [useVenueSettings, setUseVenueSettings] = useState(true)
  // const onValuesChange = async (changeValues: unknown) => {
  //   const taggedVlans = form?.getFieldValue('taggedVlans')
  //   const untaggedVlan = form?.getFieldValue('untaggedVlan')

  // }
  const [switchVlans, setSwitchVlans] = useState({} as SwitchVlanUnion)
  const onClickEditVlan = () =>{
    setSelectModalVisible(true)
  }

  const {
    untaggedVlan,
    taggedVlans
  } = (useWatch([], form) ?? {})

  return (
    <>
      <Modal
        title={getTitle()}
        visible={visible}
        onCancel={onClose}
        width={644}
        footer={footer}
        destroyOnClose={true}
        children={
        // <Loader
        //   states={[
        //     { isLoading }
        //   ]}
        // >
          <Form
            form={form}
            layout='vertical'
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
                  children={<Input />}
                />
                <Form.Item
                  name='lagType'
                  initialValue={EdgeIpModeEnum.DHCP}
                  label={$t({ defaultMessage: 'Type' })}
                  rules={[{
                    required: true
                  }]}
                  children={
                    <Radio.Group>
                      <Space direction='vertical'>
                        <Radio value={EdgeIpModeEnum.DHCP}>
                          {$t({ defaultMessage: 'DHCP' })}
                        </Radio>
                        <Radio value={EdgeIpModeEnum.STATIC}>
                          {$t({ defaultMessage: 'Static/Manual' })}
                        </Radio>
                      </Space>
                    </Radio.Group>
                  }
                />
                <StepsForm.Title
                  style={{ padding: '10px 0px' }}>
                  {$t({ defaultMessage: 'Select Ports' })}
                </StepsForm.Title>
                <Form.Item
                  name='portsType'
                  label={<>
                    {$t({ defaultMessage: 'Ports Type' })}
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
            <Row>
              <Col>
                <Form.Item
                  name='ports'
                  valuePropName='targetKeys'
                >
                  <Transfer
                    listStyle={{ width: 200, height: 316 }}
                    showSearch
                    showSelectAll={false}
                    dataSource={[...finalAvailablePorts]}
                    render={item => item.name}
                    operations={['Add', 'Remove']}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name='untaggedVlan'
              label={$t({ defaultMessage: 'Untagged VLAN' })}
              children={
                <div>
                  <div>{untaggedVlan
                    ? $t({ defaultMessage: 'VLAN-ID: {vlan}' }, {
                      vlan: untaggedVlan
                    }) : '--'}</div>
                  <Button type='link' onClick={onClickEditVlan}>
                    {$t({ defaultMessage: 'Edit' })}
                  </Button>
                </div>}
            />
            <Form.Item
              name='taggedVlans'
              label={$t({ defaultMessage: 'Tagged VLANs' })}
              children={
                <div>
                  <div>{
                    taggedVlans?.length > 0
                      ? $t(
                        { defaultMessage: 'VLAN-ID: {vlan}' },
                        // eslint-disable-next-line max-len
                        { vlan: sortOptions(taggedVlans?.toString().split(','), 'number').join(', ') }
                      )
                      : '--'
                  }</div>
                  <Button type='link' onClick={onClickEditVlan}>
                    {$t({ defaultMessage: 'Edit' })}
                  </Button>
                </div>}
            />
          </Form>


        // </Loader>
        }
      />
      <SelectVlanModal
        form={form}
        selectModalvisible={selectModalVisible}
        setSelectModalvisible={setSelectModalVisible}
        setUseVenueSettings={setUseVenueSettings}
        onValuesChange={()=>{}}
        defaultVlan={String(defaultVlanId)}
        switchVlans={getAllSwitchVlans(switchVlans)}
        venueVlans={venueVlans}
        taggedVlans={taggedVlans}
        untaggedVlan={untaggedVlan}
        vlanDisabledTooltip={$t(EditPortMessages.ADD_VLAN_DISABLE)}
      />
    </>
  )

}
