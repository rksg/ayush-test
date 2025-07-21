import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                                                         from '@acx-ui/components'
import { EdgeNokiaOltData, EdgeNokiaOltStatusEnum, transformDisplayText } from '@acx-ui/rc/utils'
import { TenantLink }                                                     from '@acx-ui/react-router-dom'
import { noDataDisplay }                                                  from '@acx-ui/utils'

interface OltDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  oltDetails?: EdgeNokiaOltData,
}

export const OltDetailsDrawer = (props: OltDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, oltDetails } = props
  const isOnline = oltDetails?.status === EdgeNokiaOltStatusEnum.ONLINE

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
            isOnline ? transformDisplayText(oltDetails?.ip) : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Vendor' })}
          children={
            isOnline ? transformDisplayText(oltDetails?.vendor) : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Serial Number' })}
          children={
            isOnline ? transformDisplayText(oltDetails?.serialNumber) : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Model' })}
          children={
            isOnline ? transformDisplayText(oltDetails?.model) : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Firmware Version' })}
          children={
            isOnline ? transformDisplayText(oltDetails?.firmware) : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
          children={
            oltDetails?.venueId
              ? <TenantLink to={`/venues/${oltDetails?.venueId}/venue-details/overview`}>
                {oltDetails?.venueName}
              </TenantLink>
              : noDataDisplay
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'RUCKUS Edge' })}
        >
          {
            (isOnline && oltDetails?.edgeClusterId)
              // eslint-disable-next-line max-len
              ? <TenantLink to={`devices/edge/cluster/${oltDetails?.edgeClusterId}/edit/cluster-details`}>
                {oltDetails?.edgeClusterName}
              </TenantLink>
              : noDataDisplay
          }
        </Form.Item>
      </Form>
    </Drawer>
  )
}