import { useState, useContext, useEffect } from 'react'

import { Row, Col, Form } from 'antd'
import _                  from 'lodash'

import { showActionModal, StepsForm, Table, TableProps } from '@acx-ui/components'
import { TrustedPort }                                   from '@acx-ui/rc/utils'
import { getIntl }                                       from '@acx-ui/utils'

import ConfigurationProfileFormContext from '../ConfigurationProfileFormContext'
import { VlanSettingInterface }        from '../VlanSetting/VlanSettingDrawer/VlanPortsSetting/VlanPortsModal'

import { TrustedPortsModal } from './TrustedPortsModal'

export function TrustedPorts () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData } = useContext(ConfigurationProfileFormContext)
  const [openModal, setOpenModal] = useState(false)
  const [selected, setSelected] = useState<TrustedPort>()
  const [ruleList, setRuleList] = useState<TrustedPort[]>([])

  useEffect(() => {
    if(currentData){
      form.setFieldsValue(currentData)
      setRuleList(currentData.trustedPorts)
    }
  }, [currentData])

  const aclsColumns: TableProps<TrustedPort>['columns']= [{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'model',
    key: 'model'
  }, {
    title: $t({ defaultMessage: 'Trusted' }),
    dataIndex: 'trustPorts',
    key: 'trustPorts',
    render: (data) => {
      const taggedPorts = (data as string[])?.join(', ')
      return taggedPorts
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
      onClick: ([{ model }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Trust Port' }),
            entityValue: model
          },
          onOk: async () => {
            setRuleList(
              ruleList?.filter(row => {
                return row.model !== model
              })
            )
            clearSelection()
          }
        })
      }
    }
  ]

  const onSaveVlan = (values: VlanSettingInterface) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proceedData = { ...values } as any
    proceedData.trustedPorts.id = ''
    proceedData.trustedPorts.slots = proceedData.trustedPorts.slots.map(
      (slot: { slotNumber: number; enable: boolean }) => ({
        slotNumber: slot.slotNumber,
        enable: slot.enable,
        option: slot.slotNumber !== 1 ? _.get(slot, 'slotPortInfo') : ''
      }))
    // values.trustedPorts = values.trustedPorts.map(
    //   port => port.slots.map((slot: { slotNumber: number; enable: boolean }) => ({
    //     slotNumber: slot.slotNumber,
    //     enable: slot.enable,
    //     option: slot.slotNumber !== 1 ? _.get(slot, 'slotPortInfo') : ''
    //   })))

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
          <StepsForm.Title children={$t({ defaultMessage: 'Trusted Ports' })} />
          <label>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'To support DHCP snooping and/or ARP inspection, please select the trusted ports for each switch model you deploy' })
            }
          </label>
          <Table
            rowKey='model'
            rowActions={rowActions}
            columns={aclsColumns}
            dataSource={ruleList}
            actions={[{
              label: $t({ defaultMessage: 'Add Model' }),
              onClick: () => {
                setOpenModal(true)
              }
            }]}
            rowSelection={{
              type: 'radio',
              onChange: (keys: React.Key[]) => {
                setSelected(
                  ruleList?.find((i: { model: string }) => i.model === keys[0])
                )
              }
            }}
          />
        </Col>
      </Row>
      <Form.Item name='trustedPorts' initialValue={ruleList} />
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