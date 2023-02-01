
import { useState } from 'react'

import {
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space } from 'antd'
import Transfer, { TransferItem } from 'antd/lib/transfer'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'

import { Button, Drawer, Loader, Modal, StepsForm, Table, TableProps, Tooltip } from '@acx-ui/components'
import { DeleteOutlinedIcon, EditOutlinedIcon }                                 from '@acx-ui/icons'
import { EdgeIpModeEnum, Lag, SwitchVlanUnion,
  PortSettingModel,
  EditPortMessages }                                                  from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { SelectVlanModal } from '../SwitchPortTable/selectVlanModal'

interface SwitchLagProps {
  visible: boolean
  isEditMode: boolean
  setVisible: (visible: boolean) => void
}

export const SwitchLagModal = (props: SwitchLagProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, isEditMode } = props

  const onClose = () => {
    setVisible(false)
  }

  const { tenantId, switchId } = useParams()
  // const { data, isLoading } = useGetLagListQuery({ params: { tenantId, switchId } })
  const [form] = Form.useForm()
  const [portsOption, setPortsOption] = useState([] as TransferItem[])


  const handleDelete = () => {
    // const models = selectedModels.filter((item) => item !== model)
    // setSelectedModels(models)
    // setTableData(tableData.filter(item => item.model !== model))
    // setModelOptions(supportModelOptions.filter(item =>
    //   models.indexOf(item.value) === -1)
    // )
  }

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

  const [selectModalvisible, setSelectModalvisible] = useState(true)
  const [useVenueSettings, setUseVenueSettings] = useState(true)
  const onValuesChange = async () => {}
  const [switchVlans, setSwitchVlans] = useState({} as SwitchVlanUnion)

  return (
    <>
      <Modal
        title={getTitle()}
        visible={visible}
        onCancel={onClose}
        width={644}
        footer={footer}
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
                      { label: $t({ defaultMessage: 'Select ports type...' }), value: null }
                    // ...venueOption
                    ]}
                  // onChange={async (value) => await handleVenueChange(value)}
                  />}
                />
                <Form.Item
                  name='stackMember'
                  label={<>
                    {$t({ defaultMessage: 'Stack Member' })}
                  </>}
                  initialValue={null}
                  children={<Select
                    options={[
                      { label: $t({ defaultMessage: 'All Stack Member' }), value: null }
                    // ...venueOption
                    ]}
                  // onChange={async (value) => await handleVenueChange(value)}
                  />}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Item
                  name='apSerialNumbers'
                  valuePropName='targetKeys'
                >
                  <Transfer
                    listStyle={{ width: 200, height: 316 }}
                    showSearch
                    showSelectAll={false}
                    dataSource={[{ key: 'test', title: 'test', name: 'test' }]}
                    // portsOption}
                    render={item => item.name}
                    operations={['Add', 'Remove']}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name='untaggedVLAN'
              label={$t({ defaultMessage: 'Untagged VLAN' })}
              children={'--'}
            />
            <Form.Item
              name='taggedVLANs'
              label={$t({ defaultMessage: 'Tagged VLANs' })}
              children={'--'}
            />
          </Form>


        // </Loader>
        }
      />
      <SelectVlanModal
        form={form}
        selectModalvisible={selectModalvisible}
        setSelectModalvisible={setSelectModalvisible}
        setUseVenueSettings={setUseVenueSettings}
        onValuesChange={onValuesChange}
        defaultVlan={''}
        switchVlans={[]}
        venueVlans={[]}
        taggedVlans={''}
        untaggedVlan={0}
        vlanDisabledTooltip={$t(EditPortMessages.ADD_VLAN_DISABLE)}
      />
    </>
  )

}
