import { Fragment } from 'react'

import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import { Descriptions, Drawer, Subtitle } from '@acx-ui/components'
import { OltStatus }                      from '@acx-ui/olt/components'
import { Olt, OltStatusEnum }             from '@acx-ui/olt/utils'
import { transformDisplayText }           from '@acx-ui/rc/utils'
import { TenantLink }                     from '@acx-ui/react-router-dom'
import { noDataDisplay }                  from '@acx-ui/utils'

interface OltDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  oltDetails?: Olt,
}

export const OltDetailsDrawer = (props: OltDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, oltDetails } = props
  const isOnline = oltDetails?.status === OltStatusEnum.ONLINE

  const onClose = () => {
    setVisible(false)
  }

  const lineCardInfo = [{
    status: 'Online',
    model: 'LWLT-C',
    cages: 16,
    serialNumber: 'YP2306F4B2D'
  }, {
    status: 'Online',
    model: 'LWLT-C',
    cages: 16,
    serialNumber: 'YP2306F4B2D'
  }]

  return (
    <Drawer
      title={$t({ defaultMessage: 'Optical Details' })}
      visible={visible}
      onClose={onClose}
      width={480}
      children={<div>
        <Descriptions labelWidthPercent={50} key='olt-details'>
          <Descriptions.Item
            label={$t({ defaultMessage: 'IP Address' })}
            children={
              isOnline ? transformDisplayText(oltDetails?.ip) : noDataDisplay
            }
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Vendor' })}
            children={
              isOnline ? transformDisplayText(oltDetails?.vendor) : noDataDisplay
            }
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'S/N' })}
            children={
              isOnline ? transformDisplayText(oltDetails?.serialNumber) : noDataDisplay
            }
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Model' })}
            children={
              isOnline ? transformDisplayText(oltDetails?.model) : noDataDisplay
            }
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Firmware Version' })}
            children={
              isOnline ? transformDisplayText(oltDetails?.firmware) : noDataDisplay
            }
          />
          <Descriptions.Item
            label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
            children={
              oltDetails?.venueId
                ? <TenantLink to={`/venues/${oltDetails?.venueId}/venue-details/overview`}>
                  {oltDetails?.venueName}
                </TenantLink>
                : noDataDisplay
            }
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Admin Password' })}
            children={noDataDisplay} //TODO
          />
        </Descriptions>

        <Divider/>

        { // Line Card Info
          lineCardInfo.map((item, index) => (
            <Fragment key={`line-card-${index}`}>
              <Subtitle level={5}>
                {$t({ defaultMessage: 'PON Line Card {index}' }, { index: index + 1 })}
              </Subtitle>
              <Descriptions labelWidthPercent={50}>
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Status' })}
                  children={
                    <OltStatus
                      status={item.status as OltStatusEnum}
                      showText
                    />
                  }
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Model' })}
                  children={item.model}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Cages' })}
                  children={item.cages}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Serial Number' })}
                  children={item.serialNumber}
                />
              </Descriptions>
              { index + 1 < lineCardInfo.length ? <Divider/> : null}
            </Fragment>
          ))
        }
      </div>}
    />
  )
}