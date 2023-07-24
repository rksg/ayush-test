import { useState, useContext, useEffect } from 'react'

import { Row, Col, Form, Input, Typography } from 'antd'
import _                                     from 'lodash'

import { showActionModal, StepsFormLegacy, Table, TableProps, Button } from '@acx-ui/components'
import {
  defaultSort,
  sortProp,
  SwitchConfigurationProfile,
  SwitchSlot2,
  TrustedPort,
  TrustedPortTypeEnum
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { getIntl }                   from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import { TrustedPortsModal } from './TrustedPortsModal'

export interface VlanTrustPortInterface {
  enableSlot2?: boolean
  enableSlot3?: boolean
  enableSlot4?: boolean
  family: string
  model: string
  selectedOptionOfSlot2?: string
  selectedOptionOfSlot3?: string
  selectedOptionOfSlot4?: string
  switchFamilyModels?: TrustedPort
  trustedPorts: TrustedPort[]
}

export const generateTrustedPortsModels = (profile: Partial<SwitchConfigurationProfile>) => {
  const models: TrustedPort[] = []
  let mergedTrustPorts: TrustedPort[] = []
  if(profile.vlans){
    profile.vlans.forEach((v) => {
      if ((v.ipv4DhcpSnooping === false && v.arpInspection === false) ||
      _.isEmpty(v.switchFamilyModels)) {
        return
      }
      v.switchFamilyModels?.forEach((m) => {
        const exist = models.find(item => item.model === m.model)
        if (!exist) {
          models.push({
            vlanDemand: true,
            model: m.model,
            slots: m.slots as SwitchSlot2[],
            trustPorts: [],
            trustedPortType: TrustedPortTypeEnum.ALL
          })
        }
      })
    })

    if(profile.trustedPorts){
      const filterTrustedPortModels = models
        .filter(item => profile.trustedPorts && !profile.trustedPorts.map(
          tpItem => tpItem.model).includes(item.model)) || []

      mergedTrustPorts = [...profile.trustedPorts, ...filterTrustedPortModels]
    } else {
      mergedTrustPorts = models
    }
  }
  return mergedTrustPorts
}

export function TrustedPorts () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData } = useContext(ConfigurationProfileFormContext)
  const [openModal, setOpenModal] = useState(false)
  const [notDeletable, setNotDeletable] = useState(true)
  const [selected, setSelected] = useState<TrustedPort>()
  const [ruleList, setRuleList] = useState<TrustedPort[]>([])

  useEffect(() => {
    const trustedPortModels = generateTrustedPortsModels(currentData)
    form.setFieldValue('trustedPorts', trustedPortModels)
    setRuleList(trustedPortModels as TrustedPort[])
  }, [currentData, form])

  const trustedPortsColumns: TableProps<TrustedPort>['columns']= [{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'model',
    key: 'model',
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('model', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'Trusted' }),
    dataIndex: 'trustPorts',
    key: 'trustPorts',
    sorter: { compare: sortProp('trustPorts', defaultSort) },
    render: (data, row) => {
      if(data?.toString() === ''){
        return <Button type='link'
          onClick={()=>{
            setSelected(row)
            setOpenModal(true)
          }}>
          {$t({ defaultMessage: 'Please select...' })}
        </Button>
      }else{
        const taggedPorts = ((data || []) as string[])?.join(', ')
        return taggedPorts
      }
    }
  }]

  const rowActions: TableProps<TrustedPort>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setSelected(selectedRows[0])
        setOpenModal(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: notDeletable,
      onClick: ([{ model }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Trust Port' }),
            entityValue: model
          },
          onOk: async () => {
            const ruleRows = ruleList?.filter(row => {
              return row.model !== model
            })
            setRuleList(ruleRows)
            form.setFieldValue('trustedPorts', ruleRows)
            clearSelection()
          }
        })
      }
    }
  ]

  const onSaveVlan = (values: VlanTrustPortInterface) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proceedData = { ...values } as any
    proceedData.trustedPorts.id = ''
    proceedData.trustedPorts.slots = proceedData.trustedPorts.slots.map(
      (slot: { slotNumber: number; enable: boolean }) => ({
        slotNumber: slot.slotNumber,
        enable: slot.enable,
        option: slot.slotNumber !== 1 ? _.get(slot, 'slotPortInfo') : ''
      }))

    const mergedRuleList = [
      ...ruleList.filter(item => item.model !== values.switchFamilyModels?.model),
      proceedData.trustedPorts as unknown as TrustedPort
    ]
    setRuleList(mergedRuleList)
    form.setFieldValue('trustedPorts', mergedRuleList)
    setSelected(undefined)
    setOpenModal(false)
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={20}>
          <StepsFormLegacy.Title children={$t({ defaultMessage: 'Trusted Ports' })} />
          <Typography.Paragraph>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'To support DHCP snooping and/or ARP inspection, please select the trusted ports for each switch model you deploy' })
            }
          </Typography.Paragraph>
          <Table
            rowKey='model'
            rowActions={filterByAccess(rowActions)}
            columns={trustedPortsColumns}
            dataSource={ruleList}
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Add Model' }),
              onClick: () => {
                setOpenModal(true)
                setSelected(undefined)
              }
            }])}
            rowSelection={hasAccess() && {
              type: 'radio',
              onChange: (keys: React.Key[]) => {
                const selected = ruleList?.find((i: { model: string }) => i.model === keys[0])
                const notDeletable = currentData.vlans?.some(v => {
                  return v.switchFamilyModels?.some(sf => sf.model === selected?.model)
                })
                setSelected(selected)
                setNotDeletable(notDeletable)
              }
            }}
          />
        </Col>
      </Row>
      <Form.Item
        name='trustedPorts'
        initialValue={ruleList}
        hidden={true}
        children={<Input />}
        rules={[
          { validator: (_, value) => value?.some(
            (port: Partial<TrustedPort>) => port.trustPorts && port.trustPorts.length === 0) ?
            Promise.reject() : Promise.resolve() }
        ]}
      />
      <TrustedPortsModal
        open={openModal}
        editRecord={selected}
        currrentRecords={ruleList}
        onCancel={() => setOpenModal(false)}
        onSave={onSaveVlan}
      />
    </>
  )
}
