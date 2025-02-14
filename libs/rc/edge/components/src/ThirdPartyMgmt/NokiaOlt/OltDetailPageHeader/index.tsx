import React from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridRow,  GridCol, PageHeader, Button, cssStr } from '@acx-ui/components'
import { useGetEdgeCageListQuery }                             from '@acx-ui/rc/services'
import {
  EdgeNokiaCageStateEnum,
  EdgeNokiaOltData,
  EdgeNokiaOltStatusEnum,
  getOltStatusConfig,
  isOltOnline,
  isOltValidSerialNumber
} from '@acx-ui/rc/utils'

import OltImage                    from '../../../assets/images/olt/olt.png'
import { EdgeOverviewDonutWidget } from '../../../ChartWidgets/EdgeOverviewDonutWidget'

import { OltDetailsDrawer }         from './DetailsDrawer'
import { StyledEdgeNokiaOltStatus } from './styledComponents'
interface EdgeNokiaOltDetailsPageHeaderProps {
  currentOlt: EdgeNokiaOltData
}

export const EdgeNokiaOltDetailsPageHeader = (props: EdgeNokiaOltDetailsPageHeaderProps) => {
  const { currentOlt } = props
  const { $t } = useIntl()
  const [visible, setVisible] = React.useState(false)

  const isOnline = isOltOnline(currentOlt)

  const {
    upCages,
    totalCages,
    isLoading: isCageListLoading,
    isFetching: isCageListFetching
  } = useGetEdgeCageListQuery({
    params: {
      venueId: currentOlt.venueId,
      edgeClusterId: currentOlt.edgeClusterId,
      oltId: currentOlt.serialNumber
    }
  }, {
    skip: !isOnline,
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      upCages: data?.filter(item => item.state === EdgeNokiaCageStateEnum.UP).length ?? 0,
      totalCages: data?.length ?? 0,
      isLoading,
      isFetching
    })
  })

  const onClickDetailsHandler = () => {
    setVisible(true)
  }

  return <>
    <PageHeader
      title={currentOlt.name}
      breadcrumb={[
        { text: 'Wired' },
        { text: 'Wired Devices' },
        { text: 'Optical', link: '/devices/optical' }
      ]}
    />
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '170px' }}>
        <Card type='solid-bg'>
          <GridRow>
            <GridCol col={{ span: 24 }} style={{ alignItems: 'flex-end' }}>
              <Button type='link' onClick={onClickDetailsHandler}>
                {$t({ defaultMessage: 'Device Details' })}
              </Button>
            </GridCol>
          </GridRow>
          <GridRow style={{ flexGrow: '1', justifyContent: 'space-around' }}>
            <GridCol col={{ span: 4 }}
              style={{ justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              <Typography.Text>{$t({ defaultMessage: 'Status' })}</Typography.Text>
              <StyledEdgeNokiaOltStatus
                config={getOltStatusConfig()}
                // eslint-disable-next-line max-len
                status={isOltValidSerialNumber(currentOlt.serialNumber) ? currentOlt.status : EdgeNokiaOltStatusEnum.UNKNOWN}
                showText />
            </GridCol>
            <GridCol col={{ span: 5 }}>
              <EdgeOverviewDonutWidget
                title={$t({ defaultMessage: 'Cages' })}
                data={totalCages ?
                  [{
                    color: cssStr('--acx-neutrals-50'),
                    name: 'Down',
                    value: totalCages - upCages
                  }, {
                    color: cssStr('--acx-semantics-green-50'),
                    name: 'Up',
                    value: upCages
                  }]
                  : [{
                    color: cssStr('--acx-neutrals-50'),
                    name: '',
                    value: 0
                  }]}
                isLoading={isCageListLoading}
                isFetching={isCageListFetching}
              />
            </GridCol>
            <GridCol col={{ span: 5 }} style={{ justifyContent: 'center' }}>
              <img src={OltImage} alt='OLT device' />
            </GridCol>
            <GridCol col={{ span: 1 }} />
          </GridRow>
        </Card>
      </GridCol>
    </GridRow>
    <OltDetailsDrawer
      visible={visible}
      setVisible={setVisible}
      currentOlt={currentOlt}
    />
  </>
}