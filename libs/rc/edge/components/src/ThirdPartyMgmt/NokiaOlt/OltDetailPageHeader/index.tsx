import React from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridRow,  GridCol, PageHeader, Button }                  from '@acx-ui/components'
import { EdgeNokiaOltData, EdgeNokiaOltStatusEnum, getOltStatusConfig } from '@acx-ui/rc/utils'

import { EdgeOverviewDonutWidget } from '../../../ChartWidgets/EdgeOverviewDonutWidget'

import { OltDetailsDrawer }         from './DetailsDrawer'
import { PoeUtilizationBox }        from './PoeUtilizationBox'
import { StyledEdgeNokiaOltStatus } from './styledComponents'

interface EdgeNokiaOltDetailsPageHeaderProps {
  currentOlt: EdgeNokiaOltData
}

export const EdgeNokiaOltDetailsPageHeader = (props: EdgeNokiaOltDetailsPageHeaderProps) => {
  const { currentOlt } = props
  const { $t } = useIntl()
  const [visible, setVisible] = React.useState(false)

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
      <GridCol col={{ span: 24 }} style={{ height: '150px' }}>
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
                status={currentOlt.status}
                showText />
            </GridCol>
            <GridCol col={{ span: 4 }}>
              <EdgeOverviewDonutWidget
                title={$t({ defaultMessage: 'Cages' })}
                data={[{
                  color: '#23AB36',
                  name: 'Enabled',
                  value: 1
                }, {
                  color: '#FF9D49',
                  name: 'Disabled',
                  value: 3
                }]}
                isLoading={false}
              />
            </GridCol>
            <GridCol col={{ span: 5 }}>
              <PoeUtilizationBox
                title={$t({ defaultMessage: 'PoE Usage' })}
                isOnline={currentOlt.status === EdgeNokiaOltStatusEnum.ONLINE}
                value={232}
                totalVal={280}
                isLoading={false}
              />
            </GridCol>
            <GridCol col={{ span: 5 }} style={{ justifyContent: 'center' }}>
              <img src='' alt='OLT device' />
            </GridCol>
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