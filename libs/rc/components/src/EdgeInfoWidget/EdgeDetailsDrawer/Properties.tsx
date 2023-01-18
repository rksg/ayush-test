import { Divider, Form } from 'antd'
import { useIntl }       from 'react-intl'

import { EdgeStatus, EdgeStatusEnum } from '@acx-ui/rc/utils'
import { TenantLink }                 from '@acx-ui/react-router-dom'

interface PropertiesProps {
  currentEdge: EdgeStatus | undefined,
}

export const Properties = (props: PropertiesProps) => {

  const { currentEdge } = props
  const { $t } = useIntl()

  return (
    <Form
      labelCol={{ span: 12 }}
      labelAlign='left'
      style={{ marginTop: currentEdge?.deviceStatus === EdgeStatusEnum.OPERATIONAL ? '25px' : 0 }}
    >
      <Form.Item
        label={$t({ defaultMessage: 'Venue' })}
        children={
          <TenantLink to={`/venues/${currentEdge?.venueId}/venue-details/overview`}>
            {currentEdge?.venueName}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Description' })}
        children={
          currentEdge?.description || $t({ defaultMessage: 'None' })
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Tags' })}
        children={
          currentEdge?.tags || '--'
        }
      />

      <Divider/>

      <Form.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={
          currentEdge?.ip || '--'
        }
      />

      <Divider/>

      <Form.Item
        label={$t({ defaultMessage: 'Model' })}
        children={
          currentEdge?.model || '###'
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Type' })}
        children={
          currentEdge?.type || '--'
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'FW Version' })}
        children={
          currentEdge?.fwVersion || '--'
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'S/N' })}
        children={
          currentEdge?.serialNumber || '--'
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'CPU' })}
        children={
          currentEdge?.cpuUsed || '--'
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Memory' })}
        children={
          currentEdge?.memUsed || '--'
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Storage' })}
        children={
          currentEdge?.diskUsed || '--'
        }
      />

    </Form>
  )
}