import React, { useState, useEffect } from 'react'

import { Col, Form, Input, InputNumber, Row, Select, Space, Transfer } from 'antd'
import { useIntl }                                                     from 'react-intl'

import { Button, Drawer, Modal, StepsForm, Subtitle, Table, TableProps, useStepFormContext } from '@acx-ui/components'
import {
  useGetAccessSwitchesByDSQuery,
  useGetAvailableSwitchesQuery,
  useValidateDistributionSwitchInfoMutation
} from '@acx-ui/rc/services'
import {
  AccessSwitch,
  DistributionSwitch,
  DistributionSwitchSaveData,
  networkWifiIpRegExp,
  subnetMaskIpRegExp,
  SwitchLite
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { NetworkSegmentationGroupForm } from '..'
import { useWatch }                     from '../../useWatch'


export default function DistributionSwitchSetting () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  // const form = Form.useFormInstance()
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()

  const [openDrawer, setOpenDrawer] = useState(false)
  const [selected, setSelected] = useState<DistributionSwitch>()
  const [dsList, setDsList] = useState<DistributionSwitch[]>([])
  const distributionSwitchInfos = useWatch('distributionSwitchInfos', form)
  const accessSwitchInfos = useWatch('accessSwitchInfos', form)
  const venueId = useWatch('venueId', form)
  const edgeId = useWatch('edgeId', form)

  const { availableSwitches } = useGetAvailableSwitchesQuery({
    params: { tenantId, venueId }
  }, {
    skip: !venueId,
    selectFromResult: ({ data }) => ({
      availableSwitches: data?.switchViewList?.filter(sw=>
        // filter out switches already selected in this MDU
        !distributionSwitchInfos?.find(ds => ds.id === sw.id) &&
        !accessSwitchInfos?.find(ds => ds.id === sw.id)
      ) || []
    })
  })

  useEffect(()=>{
    if (distributionSwitchInfos) {
      setDsList(distributionSwitchInfos)
      // form.setFieldValue('distributionSwitchInfos', distributionSwitchInfos)
    }
  }, [distributionSwitchInfos])

  const rowActions: TableProps<DistributionSwitch>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      setSelected(selectedRows[0])
      setOpenDrawer(true)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows) => {
      setSelected(undefined)
      const newList = dsList?.filter(ds=>{
        return !selectedRows.map(r=>r.id).includes(ds.id)
      })

      saveToContext(newList)
    }
  }]

  const saveToContext = (newList: DistributionSwitch[]) => {
    const newAsList = newList.map(ds => {
      return ds.accessSwitches || []
    }).flat()

    form.setFieldValue('distributionSwitchInfos', newList)
    form.setFieldValue('accessSwitchInfos', newAsList)
  }

  const addHandler = () => {
    setSelected(undefined)
    setOpenDrawer(true)
  }

  const handleSaveDS = (values: DistributionSwitch) => {
    let newList = dsList || []
    if (!selected) { // Add
      newList = newList.concat(values)
    }
    else { // edit
      newList = newList.map(ds => {
        if (selected.id === ds.id) {
          return { ...selected, ...values }
        }
        return ds
      })
    }
    setSelected(undefined)
    setOpenDrawer(false)

    saveToContext(newList)
  }

  return (<>
    <Button type='link' style={{ float: 'right' }} onClick={addHandler}>
      { $t({ defaultMessage: 'Add Distribution Switch' }) }
    </Button>
    <StepsForm.Title>
      {$t({ defaultMessage: 'Distribution Switch Settings' })}
    </StepsForm.Title>
    <Form.Item name='distributionSwitchInfos' hidden />
    <DistributionSwitchTable rowActions={rowActions}
      dataSource={dsList}
      rowSelection={{ type: 'radio', selectedRowKeys: selected ? [selected.id] : [] }} />
    <DistributionSwitchDrawer
      open={openDrawer}
      editRecord={selected}
      availableSwitches={availableSwitches}
      selectedSwitches={dsList}
      venueId={venueId}
      edgeId={edgeId}
      onSaveDS={handleSaveDS}
      onClose={()=>setOpenDrawer(false)} />
  </>)
}

function DistributionSwitchDrawer (props: {
  open: boolean,
  editRecord?: DistributionSwitch,
  availableSwitches: SwitchLite[],
  selectedSwitches: DistributionSwitch[],
  venueId: string,
  edgeId: string,
  onClose: ()=>void,
  onSaveDS?:(values: DistributionSwitch)=>void
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm()
  const {
    open, editRecord, availableSwitches, selectedSwitches, venueId, edgeId, onClose, onSaveDS
  } = props

  const defaultRecord = { siteKeepAlive: '5', siteRetry: '3', siteName: edgeId }

  const [openModal, setOpenModal] = useState(false)
  const [asList, setAsList] = useState<AccessSwitch[]>([])

  const [validateDistributionSwitchInfo] = useValidateDistributionSwitchInfoMutation()

  const dsId = Form.useWatch('id', form)

  useEffect(()=>{
    form.resetFields()
    setAsList(editRecord?.accessSwitches || [])
  }, [form, open, editRecord])

  const handleFormFinish = (values: DistributionSwitch) => {
    onSaveDS && onSaveDS({ ...values, accessSwitches: asList })
  }

  return (
    <Drawer
      title={editRecord ?
        $t({ defaultMessage: 'Edit Distribution Switch' }) :
        $t({ defaultMessage: 'Add Distribution Switch' })}
      visible={open}
      mask={true}
      onClose={onClose}
      destroyOnClose={true}
      width={450}
      footer={<Drawer.FormFooter
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
        }}
      />} >
      <Form form={form}
        onFinish={handleFormFinish}
        layout='vertical'
        initialValues={editRecord || defaultRecord}>

        <Form.Item name='siteName' hidden />
        <Form.Item name='id'
          label={$t({ defaultMessage: 'Distribution Switch' })}
          rules={[{ required: true }]}
          hidden={!!editRecord}
        >
          <Select placeholder={$t({ defaultMessage: 'Select ...' })}
            options={availableSwitches.map(item => ({
              value: item.id,
              label: item.name
            }))}
            onChange={(newId)=>{
              form.setFieldValue('name', availableSwitches.find(s=>s.id===newId)?.name)
            }}
          />
        </Form.Item>
        <Form.Item name='name'
          label={$t({ defaultMessage: 'Distribution Switch' })}
          hidden={!editRecord}
        >
          <Input disabled/>
        </Form.Item>
        <Form.Item name='vlans'
          label={$t({ defaultMessage: 'VLAN Range' })}
          rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name='loopbackInterfaceId'
          label={$t({ defaultMessage: 'Lookback Interface ID' })}
          rules={[{ required: true }, { type: 'number', max: 64, min: 1, transform: Number }]}>
          <Input />
        </Form.Item>
        <Form.Item name='loopbackInterfaceIpAddress'
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
              { $t({ defaultMessage: 'Select Access Switches' }) }
            </Subtitle>
          </Col>
          <Col>
            <Button type='link' onClick={()=>setOpenModal(true)}>
              { $t({ defaultMessage: 'Select' }) }
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
          },{
            title: $t({ defaultMessage: 'Uplink Port' }),
            dataIndex: ['uplinkInfo', 'uplinkId'],
            key: 'uplinkInfo'
          }]}
          dataSource={asList}
          type='form'
          rowKey='id' />
      </Form>
      <SelectAccessSwitchModal visible={openModal}
        onSave={(newAsList)=> {
          setAsList(newAsList)
          setOpenModal(false)
        }}
        onCancel={()=>setOpenModal(false)}
        selected={asList}
        selectedDs={selectedSwitches}
        switchId={dsId}
        venueId={venueId} />
    </Drawer>
  )
}

function SelectAccessSwitchModal ({
  visible, onSave, onCancel, selected, selectedDs, switchId, venueId
}: {
  visible: boolean,
  onSave?: ( asList: AccessSwitch[] )=>void,
  onCancel: ()=>void,
  selected?: AccessSwitch[],
  selectedDs?: DistributionSwitch[],
  switchId: string,
  venueId: string
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()

  const [selectedAsList, setSelectedAsList] = useState([] as string[])

  const { availableAs } = useGetAccessSwitchesByDSQuery(
    { params: { tenantId, venueId, switchId } }, {
      skip: !venueId || !switchId,
      selectFromResult: ({ data }) => {
        const inUseSwitchIds = (selectedDs || []).map(ds=>ds.id).concat([switchId])
        return {
          availableAs: data?.switchViewList?.filter(sw=>!inUseSwitchIds.includes(sw.id)) || []
        }
      }
    }
  )

  useEffect(()=>{
    if (!visible) {
      setSelectedAsList([])
    }
    if (selected) {
      setSelectedAsList(selected.map(s=>s.id))
    }
  }, [selected, visible])

  const handleUpdateAsList = () => {
    onSave && onSave(availableAs
      .filter(as=>selectedAsList.includes(as.id))
      .map(as=>({ ...as, distributionSwitchId: switchId })) // convert to AccessSwitch
    )
  }
  const handleChange = (targetKeys: string[]) => {
    setSelectedAsList(targetKeys)
  }

  return (
    <Modal
      visible={visible}
      title={$t({ defaultMessage: 'Select Access Switches' })}
      okText={$t({ defaultMessage: 'Apply' })}
      onOk={handleUpdateAsList}
      onCancel={onCancel}
      okButtonProps={{
        disabled: selectedAsList.length <= 0
      }}
      width={662} >
      <Transfer
        dataSource={availableAs.map(as=>({
          key: as.id,
          title: as.name
        }))}
        targetKeys={selectedAsList}
        showSearch
        showSelectAll={false}
        listStyle={{ width: 250, height: 300 }}
        titles={[
          $t({ defaultMessage: 'Available Access Switch' }),
          $t({ defaultMessage: 'Applied Profiles' })
        ]}
        operations={[$t({ defaultMessage: 'Add' }), $t({ defaultMessage: 'Remove' })]}
        onChange={handleChange}
        render={item => `${item.title} (${item.key})`}
      />
    </Modal>)
}

export function DistributionSwitchTable ( props: {
  rowActions?: TableProps<DistributionSwitch>['rowActions'],
  rowSelection?: TableProps<DistributionSwitch>['rowSelection'],
  type?: TableProps<DistributionSwitch>['type'],
  dataSource: DistributionSwitch[]
}) {
  const { $t } = useIntl()

  const columns: TableProps<DistributionSwitch>['columns'] = React.useMemo(() => {
    return [{
      key: 'name',
      title: $t({ defaultMessage: 'Dist. Switch' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend'
    }, {
      key: 'vlans',
      title: $t({ defaultMessage: 'VLAN Range' }),
      dataIndex: 'vlans',
      sorter: true
    }, {
      key: 'accessSwitches',
      title: $t({ defaultMessage: 'Access Switch' }),
      dataIndex: 'accessSwitches',
      sorter: false,
      render: (data, row)=>{
        return row.accessSwitches?.map(as=>`${as.name}`).join(', ')
      }
    }, {
      key: 'loopbackInterface',
      title: $t({ defaultMessage: 'Loopback Interface' }),
      dataIndex: 'loopbackInterface',
      children: [{
        key: 'loopbackInterfaceId',
        title: <Table.SubTitle>{$t({ defaultMessage: 'ID' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceId'
      }, {
        key: 'loopbackInterfaceIpAddress',
        title: <Table.SubTitle>{$t({ defaultMessage: 'IP Address' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceIpAddress'
      }, {
        key: 'loopbackInterfaceSubnetMask',
        title: <Table.SubTitle>{$t({ defaultMessage: 'Subnet Mask' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceSubnetMask'
      }]
    }, {
      key: 'siteKeepAlive',
      title: $t({ defaultMessage: 'Keep Alive' }),
      dataIndex: 'siteKeepAlive',
      sorter: true
    }, {
      key: 'siteRetry',
      title: $t({ defaultMessage: 'Retry Times' }),
      dataIndex: 'siteRetry',
      sorter: true
    }]
  }, [$t])
  return (
    <Table
      columns={columns}
      rowKey='id'
      {...props} />
  )
}
