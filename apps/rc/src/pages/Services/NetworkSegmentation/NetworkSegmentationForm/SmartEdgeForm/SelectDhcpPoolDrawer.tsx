import { useEffect, useState } from 'react'

import { Col, Divider, Form, Row } from 'antd'
import { useIntl }                 from 'react-intl'

import { Button, Drawer, StepsFormLegacy, Subtitle } from '@acx-ui/components'
import { PoolDrawer }                                from '@acx-ui/rc/components'
import { usePatchEdgeDhcpServiceMutation }           from '@acx-ui/rc/services'
import { EdgeDhcpPool }                              from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

interface SelectDhcpPoolDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  selectPool: (poolId?: string, poolName?: string) => void
  dhcpId?: string
  pools?: EdgeDhcpPool[]
  data?: string
  isRelayOn: boolean
}

export const SelectDhcpPoolDrawer = (props: SelectDhcpPoolDrawerProps) => {

  const { $t } = useIntl()
  const { visible, setVisible, selectPool, pools, data, isRelayOn } = props
  const [poolDrawerVisible, setPoolDrawerVisible] = useState(false)
  const [patchEdgeDhcpService] = usePatchEdgeDhcpServiceMutation()
  const [formRef] = Form.useForm()

  useEffect(() => {
    if(visible) {
      formRef.resetFields()
      formRef.setFieldValue('poolId', data)
    }
  }, [visible])

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    formRef.submit()
  }

  const handleFinish = (formData: { poolId: string }) => {
    const poolItem = pools?.find(item => item.id === formData.poolId)
    selectPool(poolItem?.id, poolItem?.poolName)
    setVisible(false)
  }

  const drawerContent = <Form layout='vertical' form={formRef} onFinish={handleFinish}>
    <Row justify='end'>
      <Col>
        <Button
          type='link'
          children={$t({ defaultMessage: 'Add DHCP Pool' })}
          onClick={()=> {setPoolDrawerVisible(true)}}
        />
      </Col>
    </Row>
    <Form.Item
      name='poolId'
      rules={[
        {
          required: true,
          message: $t({ defaultMessage: 'Please select a DHCP pool' })
        }
      ]}
    >
      <UI.RadioGroup
        options={
          pools?.map(item => ({
            label: <>
              <Subtitle level={4}>{item.poolName}</Subtitle>
              <StepsFormLegacy.FieldLabel width='100px'>
                {$t({ defaultMessage: 'Subnet Mask:' })}
                <UI.RadioDescription
                  children={item.subnetMask}
                />
              </StepsFormLegacy.FieldLabel>
              <StepsFormLegacy.FieldLabel width='100px'>
                {$t({ defaultMessage: 'Pool Range:' })}
                <UI.RadioDescription
                  children={`${item.poolStartIp} - ${item.poolEndIp}`}
                />
              </StepsFormLegacy.FieldLabel>
              <Divider />
            </>,
            value: item.id
          })) || []
        }
      />
    </Form.Item>
  </Form>

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: $t({ defaultMessage: 'Select' })
      }}
      onCancel={handleClose}
      onSave={handleSave}
    />
  )

  const addPool = async (data: EdgeDhcpPool) => {
    const pathParams = { id: props.dhcpId }
    const payload = { dhcpPools: [...(pools || []), data] }

    // should not create service with UI used id
    payload.dhcpPools.forEach(item => {
      if (item.id.startsWith('_NEW_')) item.id = ''
    })

    await patchEdgeDhcpService({ params: pathParams, payload })
      .unwrap()
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err)
      })
  }

  return (
    <>
      <PoolDrawer
        visible={poolDrawerVisible}
        setVisible={setPoolDrawerVisible}
        onAddOrEdit={addPool}
        allPool={pools}
        isRelayOn={isRelayOn}
      />
      <Drawer
        width={475}
        title={$t({ defaultMessage: 'Select DHCP Pool' })}
        visible={visible}
        onClose={handleClose}
        children={drawerContent}
        footer={footer}
      />
    </>
  )
}
