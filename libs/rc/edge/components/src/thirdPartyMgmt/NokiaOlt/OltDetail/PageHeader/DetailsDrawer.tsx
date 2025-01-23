import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                                           from '@acx-ui/components'
import { EdgeStatus, EdgeStatusEnum, transformDisplayText } from '@acx-ui/rc/utils'
import { TenantLink }                                       from '@acx-ui/react-router-dom'


interface OltDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentOlt: EdgeStatus | undefined,
}


const OltDetailsDrawer = (props: OltDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, currentOlt } = props

  const onClose = () => {
    setVisible(false)
  }

  const content = (
    <Form
      labelCol={{ span: 9 }}
      labelAlign='left'
      style={{ marginTop: currentOlt?.deviceStatus === EdgeStatusEnum.OPERATIONAL ? '25px' : 0 }}
    >
      <Form.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={
          transformDisplayText(currentOlt?.ip)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Vendor' })}
        children={
          transformDisplayText(currentOlt?.vendor)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Model' })}
        children={
          transformDisplayText(currentOlt?.model)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Firmware Version' })}
        children={
          transformDisplayText(currentOlt?.firmwareVersion)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={
          <TenantLink to={`/venues/${currentOlt?.venueId}/venue-details/overview`}>
            {currentOlt?.venueName}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'RUCKUS Edge' })}
        children={
          <TenantLink to={`/devices/${currentOlt?.edgeClusterId}/venue-details/overview`}>
            {currentOlt?.edgeClusterName}
          </TenantLink>
        }
      />
    </Form>
  )

  return (
    <Drawer
      title={$t({ defaultMessage: 'Optical Details' })}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'480px'}
    />
  )
}

export default OltDetailsDrawer