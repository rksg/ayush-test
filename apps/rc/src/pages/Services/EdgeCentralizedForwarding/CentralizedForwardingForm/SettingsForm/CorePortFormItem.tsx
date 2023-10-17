import { useState } from 'react'

import { Typography, Space } from 'antd'
import { useIntl }           from 'react-intl'

import { cssStr, Loader, Modal, ModalType, Tabs }                from '@acx-ui/components'
import { EdgePortsGeneral }                                      from '@acx-ui/rc/components'
import { useGetEdgePortsStatusListQuery, useGetPortConfigQuery } from '@acx-ui/rc/services'

import * as UI from './styledComponents'

const PortsGeneralModal = (props: {
    className?: string,
    edgeId: string,
    edgeName: string,
    visible: boolean,
    setVisible: (visible: boolean) => void;
  }) => {
  const { $t } = useIntl()
  const { className, edgeId, edgeName, visible, setVisible } = props

  const { data: portDataResponse, isLoading: isPortDataLoading } = useGetPortConfigQuery({
    params: { serialNumber: edgeId }
  })

  const portData = portDataResponse?.ports || []

  const portStatusPayload = {
    fields: ['port_id','ip'],
    filters: { serialNumber: [edgeId] }
  }
  const { data: portStatusData, isLoading: isPortStatusLoading } = useGetEdgePortsStatusListQuery({
    params: { serialNumber: edgeId }, payload: portStatusPayload
  })

  const statusIpMap = Object.fromEntries((portStatusData || [])
    .map(status => [status.portId, status.ip]))

  const portDataWithStatusIp = portData.map((item) => {
    return { ...item, statusIp: statusIpMap[item.id] }
  })

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Modal
      className={className}
      title={edgeName}
      width='70%'
      visible={visible}
      onCancel={handleClose}
      footer={undefined}
      type={ModalType.ModalStepsForm}
      mask={true}
      destroyOnClose={true}
    >
      <Tabs activeKey='ports-general'>
        <Tabs.TabPane tab={$t({ defaultMessage: 'Ports General' })} key='ports-general'>
          <Loader states={[{
            isLoading: isPortDataLoading || isPortStatusLoading
          }]}>
            <EdgePortsGeneral
              data={portDataWithStatusIp}
              edgeId={edgeId}
              onFinish={handleClose}
              onCancel={handleClose}
              buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
            />
          </Loader>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
}

export const CorePortFormItem = (props: {
    data: string,
    edgeId: string | undefined,
    edgeName: string
  }) => {
  const { $t } = useIntl()
  const { data: corePort, edgeId, edgeName } = props
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const handleClick = () => {
    setModalVisible(true)
  }

  return <Space direction='vertical'>
    <Typography.Text style={{ color: cssStr('--acx-neutrals-90') }}>
      {$t({ defaultMessage: 'Core Port: {corePort}' },
        { corePort: corePort && edgeId ? corePort : 'N/A' })}
    </Typography.Text>
    <UI.AlertText>
      {
        corePort || edgeId === undefined
          ? null
          : <><Typography.Text>
            {$t({
              defaultMessage: `To use centralized forwarding on the venue,
         you must go to {editPortLink} and select a port as the Core port`
            },
            { editPortLink:
              <UI.LinkButton type='link' onClick={handleClick}>
                {$t({ defaultMessage: 'SmartEdge\'s Port configuration' })}
              </UI.LinkButton>
            })}
          </Typography.Text>
          <PortsGeneralModal
            edgeId={edgeId}
            edgeName={edgeName}
            visible={modalVisible}
            setVisible={setModalVisible}
          />
          </>
      }
    </UI.AlertText>
  </Space>
}