import { useState, useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Card, GridRow,  GridCol, Button, cssStr, Subtitle } from '@acx-ui/components'
import { EdgeOverviewDonutWidget }                           from '@acx-ui/edge/components'
import {
  EdgeNokiaCageData,
  EdgeNokiaCageStateEnum,
  EdgeNokiaOltData
} from '@acx-ui/rc/utils'

import { OltDetailsDrawer } from './OltDetailsDrawer'

interface EdgeNokiaOltDetailsPageHeaderProps {
  oltDetails: EdgeNokiaOltData
  cagesList: EdgeNokiaCageData[] | undefined,
  isLoading: boolean,
  isFetching: boolean
}

export const OltInfoWidget = (props: EdgeNokiaOltDetailsPageHeaderProps) => {
  const { $t } = useIntl()
  const {
    cagesList, oltDetails, isLoading: isCageListLoading, isFetching: isCageListFetching
  } = props
  const [drawerVisible, setDrawerVisible] = useState(false)

  const { upCages, totalCages } = useMemo(() => {
    return {
      upCages: cagesList?.filter(item => item.state === EdgeNokiaCageStateEnum.UP).length ?? 0,
      totalCages: cagesList?.length ?? 0
    }
  }, [cagesList])

  const infoWidgetConfig = [
    {
      title: $t({ defaultMessage: 'Alarms' }),
      data: [{
        color: cssStr('--acx-semantics-red-50'),
        name: $t({ defaultMessage: 'Critical' }), //TODO: check
        value: 1
      }, {
        color: cssStr('--acx-semantics-yellow-50'),
        name: $t({ defaultMessage: 'Major' }),
        value: 2
      }],
      isLoading: false,
      isFetching: false
    },
    {
      title: $t({ defaultMessage: 'Incidents' }),
      data: [{
        color: cssStr('--acx-semantics-red-50'),
        name: $t({ defaultMessage: 'Critical' }), //TODO: check
        value: 3
      }, {
        color: cssStr('--acx-semantics-yellow-50'),
        name: $t({ defaultMessage: 'Major' }),
        value: 8
      }],
      isLoading: false,
      isFetching: false
    },
    {
      title: $t({ defaultMessage: 'Cages' }),
      data: [{
        color: cssStr('--acx-neutrals-50'),
        name: $t({ defaultMessage: 'Down' }),
        value: totalCages - upCages
      }, {
        color: cssStr('--acx-semantics-green-50'),
        name: $t({ defaultMessage: 'Up' }),
        value: upCages
      }],
      isLoading: isCageListLoading,
      isFetching: isCageListFetching
    },
    {
      title: $t({ defaultMessage: 'ONU/ONT' }),
      data: [{
        color: cssStr('--acx-neutrals-50'),
        name: $t({ defaultMessage: 'Down' }),
        value: 5
      }, {
        color: cssStr('--acx-semantics-green-50'),
        name: $t({ defaultMessage: 'Up' }),
        value: 5
      }],
      isLoading: false,
      isFetching: false
    }
  ]

  return <>
    <GridRow style={{ marginBottom: '20px' }}>
      <GridCol col={{ span: 24 }} style={{ height: '170px' }}>
        <Card type='solid-bg'>
          <GridRow>
            <GridCol col={{ span: 24 }}
              style={{
                justifyContent: 'space-between',
                flexDirection: 'row'
              }}
            >
              <Subtitle level={4}>
                {oltDetails?.model}
              </Subtitle>
              <Button type='link' size='small' onClick={() => setDrawerVisible(true)}>
                {$t({ defaultMessage: 'Device Details' })}
              </Button>
            </GridCol>
          </GridRow>
          <GridRow style={{ flexGrow: '1', justifyContent: 'center' }}>
            {/* TODO */}
            {infoWidgetConfig.map((item) => (
              <GridCol col={{ span: 4 }}>
                <EdgeOverviewDonutWidget
                  title={item.title}
                  data={item.data}
                  isLoading={item.isLoading}
                  isFetching={item.isFetching}
                />
              </GridCol>
            ))}
            {/* TODO: POE */}
            {/* <GridCol col={{ span: 4 }}>
            </GridCol> */}
          </GridRow>
        </Card>
      </GridCol>
    </GridRow>

    <OltDetailsDrawer
      visible={drawerVisible}
      setVisible={setDrawerVisible}
      oltDetails={oltDetails}
    />

  </>
}