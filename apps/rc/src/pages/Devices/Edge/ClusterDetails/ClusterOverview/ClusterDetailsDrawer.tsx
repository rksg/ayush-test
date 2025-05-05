import { Form }    from 'antd'
import { isNil }   from 'lodash'
import { useIntl } from 'react-intl'

import { Drawer }                                  from '@acx-ui/components'
import { getHaModeDisplayString }                  from '@acx-ui/edge/components'
import { EdgeClusterStatusLabel }                  from '@acx-ui/rc/components'
import { EdgeClusterStatus, transformDisplayText } from '@acx-ui/rc/utils'
import { TenantLink }                              from '@acx-ui/react-router-dom'
import { noDataDisplay }                           from '@acx-ui/utils'

interface EdgeDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentCluster: EdgeClusterStatus | undefined
}

export const EdgeClusterDetailsDrawer = (props: EdgeDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, currentCluster } = props

  const onClose = () => {
    setVisible(false)
  }

  const content = (
    <Form
      labelCol={{ span: 9 }}
      labelAlign='left'
    >
      <Form.Item
        label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={
          <TenantLink to={`/venues/${currentCluster?.venueId}/venue-details/overview`}>
            {transformDisplayText(currentCluster?.venueName)}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Description' })}
        children={
          transformDisplayText(currentCluster?.description)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Nodes Number' })}
        children={
          transformDisplayText(isNil(currentCluster?.edgeList?.length)
            ? ''
            : currentCluster?.edgeList?.length.toString()
          )
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Cluster Status' })}
        children={
          <EdgeClusterStatusLabel
            clusterStatus={currentCluster?.clusterStatus}
            edgeList={currentCluster?.edgeList}
          />
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'HA Mode' })}
        children={
          // eslint-disable-next-line max-len
          currentCluster?.highAvailabilityMode ? $t(getHaModeDisplayString(currentCluster?.highAvailabilityMode)): noDataDisplay
        }
      />

      <Form.Item
        label={$t({ defaultMessage: 'FW Version' })}
        children={
          transformDisplayText(currentCluster?.firmwareVersion)
        }
      />
    </Form>
  )

  return (
    <Drawer
      title={$t({ defaultMessage: 'Cluster Details' })}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'480px'}
    />
  )
}