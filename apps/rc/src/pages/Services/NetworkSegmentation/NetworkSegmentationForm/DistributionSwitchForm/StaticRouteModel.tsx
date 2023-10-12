import React, { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Modal, ModalType, Subtitle } from '@acx-ui/components'

import StaticRoutes from '../../../../Devices/Edge/EdgeDetails/EditEdge/StaticRoutes'

export const StaticRouteModel = (props: { edgeId: string, edgeName: string }) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)

  return <>
    <Button type='link' onClick={() => setVisible(true)}>
      {$t({ defaultMessage: 'Static Route' })}
    </Button>
    <Modal
      title={props.edgeName}
      subTitle={$t({ defaultMessage: 'SmartEdge' })}
      visible={visible}
      type={ModalType.ModalStepsForm}
      width={540}
      onCancel={() => setVisible(false)}
    >
      <Subtitle level={3}>{$t({ defaultMessage: 'Static Route' })}</Subtitle>
      <StaticRoutes
        serialNumber={props.edgeId}
        modalMode={true}
        modalCallBack={() => {
          setVisible(false)
        }}
      />
    </Modal>
  </>
}
