import { useState, useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Card, GridRow,  GridCol, Button, cssStr, Subtitle } from '@acx-ui/components'
import { EdgeOverviewDonutWidget }                           from '@acx-ui/edge/components'
import { OltCage, OltCageStateEnum, Olt }                    from '@acx-ui/olt/utils'

import { OltDetailsDrawer } from './OltDetailsDrawer'

interface OltInfoWidgetProps {
  oltDetails: Olt
  oltCages: OltCage[] | undefined,
  isLoading: boolean,
  isFetching: boolean
}

export const OltInfoWidget = (props: OltInfoWidgetProps) => {
  const { $t } = useIntl()
  const {
    oltCages, oltDetails, isLoading: isCageListLoading, isFetching: isCageListFetching
  } = props
  const [drawerVisible, setDrawerVisible] = useState(false)

  const { upCages, totalCages } = useMemo(() => {
    return {
      upCages: oltCages?.filter(item => item.state === OltCageStateEnum.UP).length ?? 0,
      totalCages: oltCages?.length ?? 0
    }
  }, [oltCages])

  //TODO: temp, remove when api is ready
  const infoWidgetConfig = [
    {
      title: $t({ defaultMessage: 'Alarms' }),
      data: [{
        color: cssStr('--acx-semantics-red-50'),
        name: $t({ defaultMessage: 'Critical' }),
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
        name: $t({ defaultMessage: 'Critical' }),
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
            {infoWidgetConfig.map((item) => (
              <GridCol col={{ span: 4 }} key={item.title}>
                <EdgeOverviewDonutWidget
                  title={item.title}
                  data={item.data}
                  isLoading={item.isLoading}
                  isFetching={item.isFetching}
                />
              </GridCol>
            ))}
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