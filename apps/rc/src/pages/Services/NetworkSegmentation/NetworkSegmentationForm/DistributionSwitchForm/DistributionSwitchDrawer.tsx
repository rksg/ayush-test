import React, { useState, useEffect } from 'react'

import { Col, Form, Input, InputNumber, Row, Select, Space } from 'antd'
import _                                                     from 'lodash'
import { useIntl }                                           from 'react-intl'
import styled                                                from 'styled-components'

import { Button, Drawer, Modal, Subtitle, Table, Transfer, useStepFormContext } from '@acx-ui/components'
import { useValidateDistributionSwitchInfoMutation }                            from '@acx-ui/rc/services'
import {
  AccessSwitch,
  checkVlanMember,
  DistributionSwitch,
  DistributionSwitchSaveData,
  networkWifiIpRegExp,
  SwitchLite
} from '@acx-ui/rc/utils'
import { useParams }                   from '@acx-ui/react-router-dom'
import { getIntl, validationMessages } from '@acx-ui/utils'

import { NetworkSegmentationGroupFormData } from '..'

const RequiredMark = styled.span`
  &:before {
    color: var(--acx-accents-orange-50);
    font-size: var(--acx-body-4-font-size);
    content: '*';
  }
`

export function DistributionSwitchDrawer (props: {
  open: boolean;
  editRecord?: DistributionSwitch;
  availableSwitches: SwitchLite[];
  onClose?: () => void;
  onSaveDS?: (values: DistributionSwitch) => void;
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm<DistributionSwitch>()
  const { open, editRecord, availableSwitches, onClose = ()=>{}, onSaveDS } = props

  const { form: nsgForm } = useStepFormContext<NetworkSegmentationGroupFormData>()
  const venueId = nsgForm.getFieldValue('venueId')
  const edgeId = nsgForm.getFieldValue('edgeId')

  const defaultRecord = { siteKeepAlive: '5', siteRetry: '3', siteName: edgeId }

  const [openModal, setOpenModal] = useState(false)
  const [availableSwitchList, setAvailableSwitchList] = useState<SwitchLite[]>([])

  const [validateDistributionSwitchInfo] = useValidateDistributionSwitchInfoMutation()

  const dsId = Form.useWatch('id', form)
  const accessSwitches = Form.useWatch('accessSwitches', form)

  useEffect(() => {
    form.resetFields()
    form.setFieldValue('accessSwitches', editRecord?.accessSwitches || [])
  }, [form, open, editRecord])

  useEffect(() => {
    const originalDistriSwitches = nsgForm.getFieldValue('originalDistributionSwitchInfos') || []
    const originalAccessSwitches = nsgForm.getFieldValue('originalAccessSwitchInfos') || []
    const distributionSwitchInfos = nsgForm.getFieldValue('distributionSwitchInfos') || []
    const accessSwitchInfos = nsgForm.getFieldValue('accessSwitchInfos') || []
    const removedSwitchList = _.differenceBy(
      [ ...originalDistriSwitches, ...originalAccessSwitches ],
      [ ...distributionSwitchInfos, ...accessSwitchInfos ], 'id')
    const inUseSwitchIds = (accessSwitches || []).map(sw=>sw.id).concat(dsId)
    const availableSwitchList =
      availableSwitches.concat(removedSwitchList).filter(sw=>!inUseSwitchIds.includes(sw.id))
    setAvailableSwitchList(availableSwitchList)
  }, [nsgForm, availableSwitches, dsId, accessSwitches])

  const handleFormFinish = (values: DistributionSwitch) => {
    onSaveDS && onSaveDS({ ...values, accessSwitches: accessSwitches })
  }

  return (
    <Drawer
      title={editRecord ?
        $t({ defaultMessage: 'Edit Distribution Switch' }) :
        $t({ defaultMessage: 'Add Distribution Switch' })}
      visible={open}
      onClose={onClose}
      destroyOnClose={true}
      width={450}
      footer={<Drawer.FormFooter
        buttonLabel={{
          save: editRecord ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
        }}
        onCancel={onClose}
        onSave={async () => {
          const values: DistributionSwitchSaveData = form.getFieldsValue()
          try {
            await validateDistributionSwitchInfo({
              params: { tenantId, venueId },
              payload: values
            }).unwrap()
            form.submit()
          } catch (error) {
            console.log(error) // eslint-disable-line no-console
          }
        }} />}>
      <Form form={form}
        onFinish={handleFormFinish}
        layout='vertical'
        initialValues={editRecord || defaultRecord}>

        <Form.Item name='siteName' hidden children={<Input />} />
        <Form.Item name='id'
          label={$t({ defaultMessage: 'Distribution Switch' })}
          rules={[{ required: true }]}
          hidden={!!editRecord}
        >
          <Select placeholder={$t({ defaultMessage: 'Select ...' })}
            options={availableSwitchList.map(item => ({
              value: item.id,
              label: item.name
            }))}
            onChange={(newId) => {
              form.setFieldValue('name', availableSwitchList.find(s => s.id === newId)?.name)
            }} />
        </Form.Item>
        <Form.Item name='name'
          label={$t({ defaultMessage: 'Distribution Switch' })}
          hidden={!editRecord}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item name='vlans'
          label={$t({ defaultMessage: 'VLAN Range' })}
          rules={[{ required: true }, { validator: (_, value) => checkVlanMember(value || '') }]}>
          <Input />
        </Form.Item>
        <Form.Item name='loopbackInterfaceId'
          label={$t({ defaultMessage: 'Lookback Interface ID' })}
          rules={[{ required: true }, { type: 'number', max: 64, min: 1, transform: Number }]}>
          <Input />
        </Form.Item>
        <Form.Item name='loopbackInterfaceIp'
          label={$t({ defaultMessage: 'Lookback Interface IP Address' })}
          rules={[{ required: true }, { validator: (_, value) => networkWifiIpRegExp(value) }]}>
          <Input />
        </Form.Item>
        <Form.Item name='loopbackInterfaceSubnetMask'
          label={$t({ defaultMessage: 'Lookback Interface Subnet Mask' })}
          rules={[{ required: true }, { validator: (_, value) => subnetMaskIpRegExp(value) }]}>
          <Input />
        </Form.Item>
        <Space size={10} align='start'>
          <Form.Item name='siteKeepAlive'
            label={$t({ defaultMessage: 'Keep Alive' })}
            rules={[{ required: true }]}>
            <InputNumber<string> style={{ width: '200px' }} min='1' max='20' stringMode />
          </Form.Item>
          <Form.Item name='siteRetry'
            label={$t({ defaultMessage: 'Retry Times' })}
            rules={[{ required: true }]}>
            <InputNumber<string> style={{ width: '200px' }} min='1' max='5' stringMode />
          </Form.Item>
        </Space>
        <Row justify='space-between' style={{ padding: '30px 0 10px' }}>
          <Col>
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Select Access Switches' })} <RequiredMark />
            </Subtitle>
          </Col>
          <Col>
            <Button type='link' onClick={() => setOpenModal(true)}>
              {$t({ defaultMessage: 'Select' })}
            </Button>
          </Col>
        </Row>
        <Table<AccessSwitch>
          columns={[{
            title: $t({ defaultMessage: 'Access Switch' }),
            dataIndex: 'name',
            key: 'name'
          }, {
            title: $t({ defaultMessage: 'Model' }),
            dataIndex: 'model',
            key: 'model'
          }, {
            title: $t({ defaultMessage: 'Uplink Port' }),
            dataIndex: ['uplinkInfo', 'uplinkId'],
            key: 'uplinkInfo'
          }]}
          dataSource={accessSwitches}
          type='form'
          rowKey='id' />
        <Form.Item rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please select at least 1 access switch.' }) }]}
        name='accessSwitches'
        children={<Input type='hidden' />} />
      </Form>
      <SelectAccessSwitchModal visible={openModal}
        onSave={(newAsList) => {
          form.setFieldValue('accessSwitches', newAsList)
          setOpenModal(false)
        }}
        onCancel={() => setOpenModal(false)}
        selected={accessSwitches}
        availableAs={availableSwitchList.concat(accessSwitches || [])}
        switchId={dsId} />
    </Drawer>
  )
}


function SelectAccessSwitchModal ({
  visible, onSave, onCancel, selected, availableAs, switchId
}: {
  visible: boolean
  onSave?: (asList: AccessSwitch[]) => void
  onCancel: () => void;
  selected?: AccessSwitch[]
  availableAs: SwitchLite[]
  switchId: string
}) {
  const { $t } = useIntl()

  const [selectedAsIds, setSelectedAsIds] = useState([] as string[])

  useEffect(() => {
    if (!visible) {
      setSelectedAsIds([])
    }
    if (selected) {
      setSelectedAsIds(selected.map(s => s.id))
    }
  }, [selected, visible])

  const handleUpdateAsList = () => {
    onSave && onSave(availableAs
      .filter(as => selectedAsIds.includes(as.id))
      .map(as => ({ ...as, distributionSwitchId: switchId })) // convert to AccessSwitch
    )
  }
  const handleChange = (targetKeys: string[]) => {
    setSelectedAsIds(targetKeys)
  }

  return (
    <Modal
      visible={visible}
      title={$t({ defaultMessage: 'Select Access Switches' })}
      okText={$t({ defaultMessage: 'Apply' })}
      onOk={handleUpdateAsList}
      onCancel={onCancel}
      okButtonProps={{
        disabled: selectedAsIds.length <= 0
      }}
      width={662}>
      <Transfer
        dataSource={availableAs.map(as => ({
          key: as.id,
          title: as.name
        }))}
        targetKeys={selectedAsIds}
        showSearch
        showSelectAll={false}
        listStyle={{ width: 240, height: 300 }}
        titles={[
          $t({ defaultMessage: 'Available Access Switch' }),
          $t({ defaultMessage: 'Applied Profiles' })
        ]}
        operations={[$t({ defaultMessage: 'Add' }), $t({ defaultMessage: 'Remove' })]}
        onChange={handleChange}
        render={item => `${item.title} (${item.key})`} />
    </Modal>)
}

export function subnetMaskIpRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254|255)))))$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.subnetMask))
  }
  return Promise.resolve()
}
