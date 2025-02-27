import React, { Key, useEffect, useState } from 'react'

import {
  Form,
  FormInstance,
  Input,
  Button,
  Col,
  Row,
  Select,
  Switch
} from 'antd'
import { RuleObject } from 'antd/lib/form'
import _              from 'lodash'
import { useIntl }    from 'react-intl'

import { Drawer, showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                          from '@acx-ui/icons'
import {
  SwitchModel,
  SwitchModelPortData,
  SwitchSlot,
  StackMember,
  PortStatusMessages,
  validateVlanExcludingReserved,
  validateDuplicateVlanId,
  validateVlanNameWithoutDVlans,
  validateVlanRangeFormat,
  Vlan,
  versionAbove10020a
} from '@acx-ui/rc/utils'
import { filterByAccess }              from '@acx-ui/user'
import { getIntl, validationMessages } from '@acx-ui/utils'


import * as UI            from './styledComponents'
import * as VlanPortsUI   from './VlanPortsSetting/styledComponents'
import { VlanPortsModal } from './VlanPortsSetting/VlanPortsModal'

export interface PortsUsedByProps {
  lag?: Record<string, string>
  untagged?: Record<string, number>
}

export interface GptObjectProps {
  vlanId: string,
  vlanName: string
}

export interface VlanSettingDrawerProps {
  vlan?: Vlan
  setVlan: (r: Vlan) => void
  editMode: boolean
  visible: boolean
  setVisible: (v: boolean) => void
  vlansList: Vlan[]
  isProfileLevel?: boolean
  enablePortModelConfigure?: boolean
  enableVlanRangeConfigure?: boolean
  switchFamilyModel?: string
  portSlotsData?: SwitchSlot[][]
  portsUsedBy?: PortsUsedByProps
  stackMember?: StackMember[],
  gptObject?: GptObjectProps
  switchFirmware?: string
}

export function VlanSettingDrawer (props: VlanSettingDrawerProps) {
  const { $t } = useIntl()
  const { vlan, setVlan, visible, setVisible, editMode,
    vlansList, isProfileLevel, switchFamilyModel,
    enablePortModelConfigure = true, enableVlanRangeConfigure = false,
    portSlotsData, portsUsedBy, stackMember, gptObject, switchFirmware } = props
  const [form] = Form.useForm<Vlan>()

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={
        editMode
          ? $t({ defaultMessage: 'Edit VLAN' })
          : $t({ defaultMessage: 'Add VLAN' })
      }
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={
        <VlanSettingForm
          form={form}
          editMode={editMode}
          vlan={vlan}
          setVlan={setVlan}
          vlansList={vlansList || []}
          isProfileLevel={isProfileLevel}
          enablePortModelConfigure={enablePortModelConfigure}
          enableVlanRangeConfigure={enableVlanRangeConfigure}
          switchFamilyModel={switchFamilyModel}
          portSlotsData={portSlotsData}
          portsUsedBy={portsUsedBy}
          stackMember={stackMember}
          gptObject={gptObject}
          switchFirmware={switchFirmware}
        />
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: editMode
              ? $t({ defaultMessage: 'Save' })
              : $t({ defaultMessage: 'Add' })
          }}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              form.submit()
              onClose()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
      width={'600px'}
    />
  )
}

interface VlanSettingFormProps {
  form: FormInstance<Vlan>
  editMode: boolean
  vlan?: Vlan
  setVlan: (r: Vlan) => void
  vlansList: Vlan[]
  isProfileLevel?: boolean
  switchFamilyModel?: string
  enablePortModelConfigure?: boolean
  enableVlanRangeConfigure?: boolean
  portSlotsData?: SwitchSlot[][]
  portsUsedBy?: PortsUsedByProps
  stackMember?: StackMember[]
  gptObject?: GptObjectProps
  switchFirmware?: string
}

function VlanSettingForm (props: VlanSettingFormProps) {
  const { $t } = useIntl()
  const { Option } = Select
  const [openModal, setOpenModal] = useState(false)
  const [vlanId, setVlanId] = useState(undefined)
  const [ipv4DhcpSnooping, setIpv4DhcpSnooping] = useState(false)
  const [arpInspection, setArpInspection] = useState(false)
  const [multicastVersionDisabled, setMulticastVersionDisabled] = useState(true)
  const [selected, setSelected] = useState<SwitchModelPortData>()
  const [ruleList, setRuleList] = useState<SwitchModelPortData[]>([])
  const [hasPortsUsedByLag, setHasPortsUsedByLag] = useState(false)

  const { form, vlan, setVlan, vlansList, isProfileLevel, editMode,
    switchFamilyModel, portSlotsData,
    enablePortModelConfigure = true, enableVlanRangeConfigure,
    portsUsedBy, stackMember, gptObject, switchFirmware } = props

  const isSwitchLevelVlanEnabled = useIsSplitOn(Features.SWITCH_LEVEL_VLAN)
  const is10020aSwitchOnlyRstpEnabled = useIsSplitOn(Features.SWITCH_UPDATE_RSTP_ABOVE_10020A)

  const isSwitchLevel = !!switchFamilyModel
  const isRuckusAiMode = !_.isEmpty(gptObject)
  const hideStp = is10020aSwitchOnlyRstpEnabled &&
    isSwitchLevel && versionAbove10020a(switchFirmware ?? '')

  const multicastVersionEnabled = () : boolean => {
    const igmpSnooping = form.getFieldValue('igmpSnooping')
    return (igmpSnooping === 'active' || igmpSnooping === 'passive')
  }

  useEffect(() => {
    form.resetFields()
  }, [vlan])

  useEffect(() => {
    if(vlan && editMode){
      form.resetFields()
      form.setFieldsValue(vlan)
      const vlanPortsData = vlan.switchFamilyModels?.map(item => {
        return {
          id: item.id,
          model: item.model,
          slots: item.slots,
          untaggedPorts: item.untaggedPorts && item.untaggedPorts?.toString().split(','),
          taggedPorts: item.taggedPorts && item.taggedPorts?.toString().split(',')
        }
      }) as unknown
      setRuleList(vlanPortsData as SwitchModelPortData[])
      setArpInspection(vlan.arpInspection || false)
      setIpv4DhcpSnooping(vlan.ipv4DhcpSnooping || false)
    }
    if (multicastVersionEnabled()) {
      setMulticastVersionDisabled(false)
    }
  }, [vlan])

  useEffect(() => {
    if(vlan && isSwitchLevelVlanEnabled){
      const portsUsedByLag = Object.keys(portsUsedBy?.lag ?? {})
      const isPortsUsedByLag = vlan?.switchVlanPortModels?.filter(port =>
        _.intersection(port.taggedPorts?.split(','), portsUsedByLag)?.length > 0
          || _.intersection(port.untaggedPorts?.split(','), portsUsedByLag)?.length > 0
      )?.length

      setHasPortsUsedByLag(!!isPortsUsedByLag)
    }
  }, [vlan, portsUsedBy, isSwitchLevelVlanEnabled])

  const columns: TableProps<SwitchModelPortData>['columns'] = [
    ...(!isSwitchLevel ? [{
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      key: 'model',
      width: 100
    }] : []),
    {
      title: $t({ defaultMessage: 'Untagged Ports' }),
      dataIndex: 'untaggedPorts',
      key: 'untaggedPorts',
      width: 180,
      render: (_, { untaggedPorts }) => {
        return untaggedPorts?.toString() || '-'
      }
    },
    {
      title: $t({ defaultMessage: 'Tagged Ports' }),
      dataIndex: 'taggedPorts',
      key: 'taggedPorts',
      width: 180,
      render: (_, { taggedPorts }) => {
        return taggedPorts?.toString() || '-'
      }
    }
  ]

  const rowActions: TableProps<SwitchModelPortData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setSelected({
          ...selectedRows[0]
        })
        setVlanId(form.getFieldValue('vlanId'))
        setOpenModal(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: !hasPortsUsedByLag,
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          ...( isSwitchLevel
            ? { title: $t({ defaultMessage: 'Delete Ports?' }),
              content: $t({ defaultMessage: 'Are you sure you want to delete this item?' }),
              okText: $t({ defaultMessage: 'Delete Ports' })
            } : {
              customContent: {
                action: 'DELETE',
                entityName: isSwitchLevel
                  ? $t({ defaultMessage: 'Ports' }) : $t({ defaultMessage: 'Model' }),
                entityValue: isSwitchLevel ? $t({ defaultMessage: 'Ports' }) : selectedRows[0].model
              }
            }),
          onOk: () => {
            setRuleList(
              ruleList?.filter((option: { model: string }) => {
                return !selectedRows
                  .map((r) => r.model)
                  .includes(option.model)
              })
            )
            setSelected(undefined)
            clearSelection()
          }
        })
      }
    }
  ]

  const onIGMPChange = (value: string) => {
    if(value === 'active' || value === 'passive'){
      setMulticastVersionDisabled(false)
      form.setFieldValue('multicastVersion', 2)
    }else{
      setMulticastVersionDisabled(true)
      form.resetFields(['multicastVersion'])
    }
  }

  const onCancel = () => {
    setSelected(undefined)
    setOpenModal(false)
  }

  const onSaveVlan = (values: SwitchModelPortData) => {
    const tmpRuleList = ruleList ?
      ruleList.filter(item => item.model !== values.model):
      ruleList || []
    const mergedRuleList = [
      ...tmpRuleList,
      values
    ]
    setRuleList(mergedRuleList)
    setSelected(undefined)
    setOpenModal(false)
  }

  return (
    <div data-testid='addVlanDrawer'>
      <Form
        layout='vertical'
        form={form}
        onFinish={(data: Vlan) => {
          setVlan({
            ...data,
            switchFamilyModels: ruleList as unknown as SwitchModel[] || []
          })
          form.resetFields()
        }}
      >
        <Form.Item
          label={<>
            {$t({ defaultMessage: 'VLAN ID' })}
            {enableVlanRangeConfigure &&
              <Tooltip
                title={$t({
                  defaultMessage: `Type one or more VLAN IDs. Examples: {br}
                  (1) 11, 21, 31 {br}
                  (2) 11, 21, 31-40,100`
                }, {
                  br: <br />
                })}
                placement='top'
              >
                <QuestionMarkCircleOutlined />
              </Tooltip>
            }
          </>}
          name='vlanId'
          validateFirst
          initialValue={isRuckusAiMode ? gptObject?.vlanId : ''}
          rules={[
            { required: true },
            ...(enableVlanRangeConfigure ? [{
              validator: (_: RuleObject, value: string) => validateVlanRangeFormat(value)
            }, {
              validator: (_: RuleObject, value: string) => {
                const originalVlanId = vlan?.vlanId?.toString()
                const {
                  isValidRange, isVlanDuplicate, isIncludeOriginal, vlans
                } = checkVlanRange(value, originalVlanId)
                const isIncludeOriginalInEditMode
                  = editMode && !isIncludeOriginal && vlans.length > 1

                if (isIncludeOriginalInEditMode) {
                  return Promise.reject($t(validationMessages.originalVlanNotIncluded))
                }
                if (!isValidRange || isVlanDuplicate) {
                  return Promise.reject($t(validationMessages.invalidVlanRange))
                }
                return Promise.all(
                  vlans.map(async (v: string) => {
                    await validateVlanExcludingReserved(v)
                    await validateDuplicateVlanId(
                      Number(v),
                      vlansList.filter(vlanItem =>
                        (editMode ? vlanItem.vlanId !== vlan?.vlanId : true)
                      )
                    )
                  })
                ).then(() => Promise.resolve())
                  .catch(err => Promise.reject(err))
              }
            }] : [
              { validator: (_: RuleObject, value: string) => validateVlanExcludingReserved(value) },
              {
                validator: (_: RuleObject, value: number) => {
                  if (isRuckusAiMode) {return Promise.resolve()}
                  return validateDuplicateVlanId(
                    value, vlansList.filter(v => editMode ? v.vlanId !== vlan?.vlanId : v)
                  )
                }
              }
            ])
          ]}
          children={
            <Input
              style={{ width: '400px' }}
              disabled={isRuckusAiMode}
              placeholder={enableVlanRangeConfigure
                ? $t({ defaultMessage: 'ex: 11, 21, 31-40, 100' }) : ''
              }
            />}
        />
        <Form.Item
          name='vlanName'
          label={$t({ defaultMessage: 'VLAN Name' })}
          initialValue={isRuckusAiMode ? gptObject?.vlanName : ''}
          rules={[
            { validator: (_, value) => validateVlanNameWithoutDVlans(value) }
          ]}
          children={<Input style={{ width: '400px' }} maxLength={32} disabled={isRuckusAiMode} />}
        />
        <UI.FieldLabel width='130px'>
          { $t({ defaultMessage: 'IPv4 DHCP Snooping' }) }
          <Form.Item
            name={'ipv4DhcpSnooping'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch onChange={setIpv4DhcpSnooping} data-testid='dhcpSnooping' />}
          />
        </UI.FieldLabel>
        <UI.FieldLabel width='500px' style={{ marginTop: '-10px', paddingBottom: '10px' }}>
          {ipv4DhcpSnooping && isProfileLevel &&
            <label>{
              $t({ defaultMessage:
                'If DHCP Snooping is turned ON, you must select trusted ports' }) }
            </label>}
        </UI.FieldLabel>
        <UI.FieldLabel width='130px'>
          { $t({ defaultMessage: 'ARP Inspection' }) }
          <Form.Item
            name={'arpInspection'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch onChange={setArpInspection} data-testid='arpInspection' />}
          />
        </UI.FieldLabel>
        <UI.FieldLabel width='500px' style={{ marginTop: '-10px', paddingBottom: '10px' }}>
          {arpInspection && isProfileLevel &&
            <label>{
              $t({ defaultMessage:
                'If ARP Inspection is turned ON, you must select trusted ports' }) }
            </label>}
        </UI.FieldLabel>
        <Form.Item
          name='igmpSnooping'
          label={$t({ defaultMessage: 'IGMP Snooping' })}
          initialValue={'none'}
          children={
            <Select onChange={onIGMPChange}>
              <Option value={'active'}>
                {$t({ defaultMessage: 'Active' })}</Option>
              <Option value={'passive'}>
                {$t({ defaultMessage: 'Passive' })}</Option>
              <Option value={'none'}>
                {$t({ defaultMessage: 'NONE' })}</Option>
            </Select>
          }
        />
        <Form.Item
          name='multicastVersion'
          label={$t({ defaultMessage: 'Multicast Version' })}
          initialValue={null}
          children={
            <Select disabled={multicastVersionDisabled}>
              <Option value={2}>
                {$t({ defaultMessage: 'Version 2' })}</Option>
              <Option value={3}>
                {$t({ defaultMessage: 'Version 3' })}</Option>
            </Select>
          }
        />
        <Form.Item
          name='spanningTreeProtocol'
          label={<>
            {$t({ defaultMessage: 'Spanning tree protocol' })}
            {is10020aSwitchOnlyRstpEnabled && !isSwitchLevel &&
              <Tooltip
                title={$t({
                  // eslint-disable-next-line max-len
                  defaultMessage: 'Beginning with firmware version FI 10.0.20a and later, only RSTP will be applied even if STP is selected.'
                })}
                placement='top'
              >
                <QuestionMarkCircleOutlined />
              </Tooltip>
            }
          </>}
          initialValue={'none'}
          children={
            <Select>
              <Option value={'rstp'}>
                {$t({ defaultMessage: 'RSTP' })}</Option>
              {!hideStp &&
                <Option value={'stp'}>
                  {$t({ defaultMessage: 'STP' })}</Option>
              }
              <Option value={'none'}>
                {$t({ defaultMessage: 'NONE' })}</Option>
            </Select>
          }
        />
        <Form.Item name='ports' initialValue={0} noStyle children={<Input type='hidden' />}/>
        <Form.Item name='title' initialValue={''} noStyle children={<Input type='hidden' />}/>
        <Form.Item
          name='vlanConfigName'
          initialValue={''}
          noStyle
          children={<Input type='hidden' />}
        />
      </Form>
      { (!isSwitchLevelVlanEnabled || enablePortModelConfigure) && <>
        <Row justify='space-between' style={{ margin: '25px 0 10px' }}>
          <Col>
            <label style={{ color: 'var(--acx-neutrals-60)' }}>Ports</label>
          </Col>
          <Col>
            <Button
              type='link'
              disabled={isSwitchLevel && ruleList?.length > 0}
              onClick={() => {
                setSelected(undefined)
                setVlanId(form.getFieldValue('vlanId'))
                setOpenModal(true)
              }}
            >
              {isSwitchLevel
                ? $t({ defaultMessage: 'Add Ports' })
                : $t({ defaultMessage: 'Add Model' })
              }
            </Button>
          </Col>
        </Row>
        <Table
          rowKey='model'
          rowActions={filterByAccess(rowActions)}
          columns={columns}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selected ? [selected.model] : [],
            onChange: (keys: React.Key[]) => {
              setSelected(
                ruleList?.find((i: { model: Key }) => i.model === keys[0])
              )
            }
          }}
          dataSource={ruleList || undefined}
        />
        <VlanPortsModal
          vlanId={vlanId}
          open={openModal}
          editRecord={selected}
          currrentRecords={ruleList}
          onCancel={onCancel}
          onSave={onSaveVlan}
          vlanList={vlansList}
          switchFamilyModel={isSwitchLevelVlanEnabled ? switchFamilyModel : undefined}
          portSlotsData={portSlotsData}
          portsUsedBy={portsUsedBy}
          stackMember={stackMember}
        />
      </>}
    </div>
  )
}

export function getTooltipTemplate (untaggedModel: Vlan[], taggedModel: Vlan[]) {
  const { $t } = getIntl()
  return <div>
    <VlanPortsUI.TooltipTitle>{
      $t(PortStatusMessages.CURRENT)
    }</VlanPortsUI.TooltipTitle>
    <div>
      <VlanPortsUI.TagsTitle>
        <VlanPortsUI.TagsOutlineIcon />{ $t({ defaultMessage: 'Untagged' }) }
      </VlanPortsUI.TagsTitle>
      <VlanPortsUI.PortSpan>
        {untaggedModel[0] ? untaggedModel[0].vlanId : '-'}
      </VlanPortsUI.PortSpan></div>
    <div>
      <VlanPortsUI.TagsTitle>
        <VlanPortsUI.TagsSolidIcon />{ $t({ defaultMessage: 'Tagged' }) }
      </VlanPortsUI.TagsTitle>
      <VlanPortsUI.PortSpan>
        {taggedModel.length > 0 ? taggedModel.map(item => item.vlanId).join(', ') : '-'}
      </VlanPortsUI.PortSpan>
    </div>
  </div>
}

export const checkVlanRange = (value: string, originalVlanId?: string) => {
  let isValidRange = true
  const vlans = value.toString().split(',').flatMap(v => {
    if (v.includes('-')) {
      const vlanRanges = v.split('-')
      const startNum = Number(vlanRanges[0])
      const endNum = Number(vlanRanges[vlanRanges.length - 1])
      if (endNum - startNum > 4095 || endNum > 4095) {
        isValidRange = false
        return ''
      }
      if (endNum > startNum) {
        return new Array(endNum - startNum + 1).fill(0).map((_, i) => (startNum + i).toString())
      }
    } else if (Number(v)) {
      return v.trim()
    }
    isValidRange = false
    return ''
  })

  const vlansSet = new Set(vlans)
  const isVlanDuplicate = vlansSet.size !== vlans.length
  const isIncludeOriginal = originalVlanId ? vlans.includes(originalVlanId) : true
  return { isValidRange, isVlanDuplicate, isIncludeOriginal, vlans }
}