import { useContext, useEffect, useState } from 'react'

import { Col, Form, Input, InputNumber, Row, Select, Space } from 'antd'
import _                                                     from 'lodash'
import { useIntl }                                           from 'react-intl'

import { Button, Drawer, Modal, Subtitle, Table, Tooltip, Transfer, useStepFormContext } from '@acx-ui/components'
import { Features }                                                                      from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                         from '@acx-ui/rc/components'
import {
  useValidateDistributionSwitchInfoMutation
} from '@acx-ui/rc/services'
import {
  AccessSwitch,
  checkVlanMember,
  DistributionSwitch,
  DistributionSwitchSaveData,
  isVerGEVer,
  networkWifiIpRegExp,
  PersonalIdentityNetworkFormData,
  SwitchLite
} from '@acx-ui/rc/utils'
import { TenantLink, useParams }       from '@acx-ui/react-router-dom'
import { getIntl, validationMessages } from '@acx-ui/utils'

import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import * as UI from './styledComponents'

export function DistributionSwitchDrawer (props: {
  open: boolean;
  editRecord?: DistributionSwitch;
  availableSwitches: SwitchLite[];
  onClose?: () => void;
  onSaveDS?: (values: DistributionSwitch) => void;
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const isEdgePinEnhanceReady = useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE)

  const requiredFw = '10.0.10f'
  const {
    requiredFw_DS = requiredFw,
    requiredFw_AS = requiredFw,
    requiredSwitchModels: requiredModels = []
  } = useContext(PersonalIdentityNetworkFormContext)
  const [form] = Form.useForm<DistributionSwitch>()
  const { open, editRecord, availableSwitches, onClose = ()=>{}, onSaveDS } = props

  const { form: pinForm } = useStepFormContext<PersonalIdentityNetworkFormData>()
  const venueId = pinForm.getFieldValue('venueId')
  const edgeClusterId = pinForm.getFieldValue('edgeClusterId')

  const defaultRecord = { siteKeepAlive: '5', siteRetry: '3' }

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
    const originalDistriSwitches = pinForm.getFieldValue('originalDistributionSwitchInfos') || []
    const originalAccessSwitches = pinForm.getFieldValue('originalAccessSwitchInfos') || []
    const distributionSwitchInfos = pinForm.getFieldValue('distributionSwitchInfos') || []
    const accessSwitchInfos = pinForm.getFieldValue('accessSwitchInfos') || []
    const removedSwitchList = _.differenceBy(
      [ ...originalDistriSwitches, ...originalAccessSwitches ],
      [ ...distributionSwitchInfos, ...accessSwitchInfos ], 'id')
    const inUseSwitchIds = (accessSwitches || []).map(sw=>sw.id).concat(dsId)
    const availableSwitchList =
      availableSwitches.concat(removedSwitchList).filter(sw=>!inUseSwitchIds.includes(sw.id))

    setAvailableSwitchList(availableSwitchList)
  }, [pinForm, availableSwitches, dsId, accessSwitches])

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
            await form.validateFields()
            await validateDistributionSwitchInfo({
              params: { tenantId, venueId },
              payload: { ...values, siteName: edgeClusterId }
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

        <Form.Item name='id'
          label={<>{ $t({ defaultMessage: 'Distribution Switch' }) }
            <Tooltip.Question
              placement='bottom'
              title={$t({
                defaultMessage: `Only the {supportedModels} distribution switches support PIN,
                and the firmware must be version {requiredFw} or higher.{br}
                You may upgrade your firmware from {firmwareLink}`
              }, {
                br: <br />,
                firmwareLink: <TenantLink to='/administration/fwVersionMgmt/switchFirmware'>
                  {$t({ defaultMessage: 'Administration > Version Management > Switch Firmware' })}
                </TenantLink>,
                requiredFw: requiredFw_DS,
                supportedModels: requiredModels.join(', ')
              })}
            />
          </>}
          rules={[{ required: true }]}
          hidden={!!editRecord}
        >
          <Select placeholder={$t({ defaultMessage: 'Select ...' })}
            options={availableSwitchList.filter(item =>
              item.firmwareVersion && isVerGEVer(item.firmwareVersion, requiredFw_DS, false)
            ).map(item => ({
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
          label={$t({ defaultMessage: 'Loopback Interface ID' })}
          rules={[{ required: true }, { type: 'number', max: 64, min: 1, transform: Number }]}>
          <Input />
        </Form.Item>
        <Form.Item name='loopbackInterfaceIp'
          label={$t({ defaultMessage: 'Loopback Interface IP Address' })}
          rules={[{ required: true }, { validator: (_, value) => networkWifiIpRegExp(value) }]}>
          <Input />
        </Form.Item>
        {isEdgePinEnhanceReady && <UI.StyledTextParagraph
          type='secondary'
          // eslint-disable-next-line max-len
          children={$t({ defaultMessage: 'A static route will be automatically created/ configured to the cluster nodes for this switch\'s loopback IP address to ensure connectivity.' })}
        />}
        <Form.Item name='loopbackInterfaceSubnetMask'
          label={$t({ defaultMessage: 'Loopback Interface Subnet Mask' })}
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
              {$t({ defaultMessage: 'Select Access Switches' })}
              <UI.RequiredMark />
              <Tooltip.Question iconStyle={{ width: '20px', marginBottom: '-7px' }}
                title={$t({ defaultMessage: `
                  PIN feature requires your switch running firmware version {requiredFw} or higher.
                  You may upgrade your firmware from {firmwareLink}`
                }, {
                  firmwareLink: <TenantLink to='/administration/fwVersionMgmt/switchFirmware'>{
                    $t({ defaultMessage: 'Administration > Version Management > Switch Firmware' })
                  }</TenantLink>,
                  requiredFw: requiredFw_AS
                })}
              />
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
        availableAs={availableSwitchList.filter(item =>
          item.firmwareVersion && isVerGEVer(item.firmwareVersion, requiredFw_AS, false)
        ).concat(accessSwitches || [])}
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
