import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                                                         from '@acx-ui/components'
import { EdgeNokiaOltData, EdgeNokiaOltStatusEnum, transformDisplayText } from '@acx-ui/rc/utils'
import { TenantLink }                                                     from '@acx-ui/react-router-dom'
import { noDataDisplay }                                                  from '@acx-ui/utils'

interface OltDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentOlt: EdgeNokiaOltData | undefined,
}

export const OltDetailsDrawer = (props: OltDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, currentOlt } = props
  const isOnline = currentOlt?.status === EdgeNokiaOltStatusEnum.ONLINE

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Optical Details' })}
      visible={visible}
      onClose={onClose}
      width={480}
    >
      <Form
        labelCol={{ span: 9 }}
        labelAlign='left'
      >
        <Form.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={
            isOnline ? transformDisplayText(currentOlt?.ip) : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Vendor' })}
          children={
            isOnline ? transformDisplayText(currentOlt?.vendor) : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Serial Number' })}
          children={
            isOnline ? transformDisplayText(currentOlt?.serialNumber) : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Model' })}
          children={
            isOnline ? transformDisplayText(currentOlt?.model) : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Firmware Version' })}
          children={
            isOnline ? transformDisplayText(currentOlt?.firmware) : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
          children={
            currentOlt?.venueId
              ? <TenantLink to={`/venues/${currentOlt?.venueId}/venue-details/overview`}>
                {currentOlt?.venueName}
              </TenantLink>
              : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'RUCKUS Edge' })}
        >
          {
            (isOnline && currentOlt?.edgeClusterId)
              // eslint-disable-next-line max-len
              ? <TenantLink to={`devices/edge/cluster/${currentOlt?.edgeClusterId}/edit/cluster-details`}>
                {currentOlt?.edgeClusterName}
              </TenantLink>
              : noDataDisplay
          }
        </Form.Item>
      </Form>
    </Drawer>
  )
}