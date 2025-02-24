import { useState, useMemo } from 'react'

import { Typography, Descriptions as AntdDescriptions } from 'antd'
import { get }                                          from 'lodash'
import { useIntl }                                      from 'react-intl'

import { Card, GridRow,  GridCol, PageHeader, Button, cssStr } from '@acx-ui/components'
import {
  EdgeNokiaCageData,
  EdgeNokiaCageStateEnum,
  EdgeNokiaOltData,
  EdgeNokiaOltStatusEnum,
  getOltStatusConfig,
  oltLineCardSerailNumberMap
} from '@acx-ui/rc/utils'

import OltImage                    from '../../../assets/images/olt/olt.png'
import { EdgeOverviewDonutWidget } from '../../../ChartWidgets/EdgeOverviewDonutWidget'

import { OltDetailsDrawer }                                 from './DetailsDrawer'
import { StyledAntdDescriptions, StyledEdgeNokiaOltStatus } from './styledComponents'
interface EdgeNokiaOltDetailsPageHeaderProps {
  currentOlt: EdgeNokiaOltData
  cagesList: EdgeNokiaCageData[] | undefined,
  isLoading: boolean,
  isFetching: boolean
}

export const EdgeNokiaOltDetailsPageHeader = (props: EdgeNokiaOltDetailsPageHeaderProps) => {
  const {
    currentOlt,
    cagesList,
    isLoading: isCageListLoading,
    isFetching: isCageListFetching
  } = props
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)

  const { upCages, totalCages } = useMemo(() => {
    return {
      upCages: cagesList?.filter(item => item.state === EdgeNokiaCageStateEnum.UP).length ?? 0,
      totalCages: cagesList?.length ?? 0
    }
  }, [cagesList])

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
    <GridRow style={{ marginBottom: '20px' }}>
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
            <GridCol col={{ span: 3 }}
              style={{ justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              <Typography.Text>{$t({ defaultMessage: 'Status' })}</Typography.Text>
              <StyledEdgeNokiaOltStatus
                config={getOltStatusConfig()}
                status={currentOlt.status || EdgeNokiaOltStatusEnum.UNKNOWN}
                showText />
            </GridCol>
            <GridCol col={{ span: 4 }}>
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
            <GridCol col={{ span: 10 }} style={{ justifyContent: 'center' }}>
              <StyledAntdDescriptions column={12}>
                <AntdDescriptions.Item
                  span={3}
                  label={$t({ defaultMessage: 'PON LC 1' })}
                  children={'Online'}
                />
                <AntdDescriptions.Item
                  span={3}
                  label={$t({ defaultMessage: 'Model' })}
                  children={'LWLT-C'}
                />
                <AntdDescriptions.Item
                  span={2}
                  label={$t({ defaultMessage: 'Cages' })}
                  children={'16'}
                />
                <AntdDescriptions.Item
                  span={4}
                  label={$t({ defaultMessage: 'S/N' })}
                  children={get(oltLineCardSerailNumberMap, currentOlt.serialNumber, 'YP2306F4B2D')}
                />
              </StyledAntdDescriptions>
              <StyledAntdDescriptions column={12}>
                <AntdDescriptions.Item
                  span={3}
                  label={$t({ defaultMessage: 'PON LC 2' })}
                  children={'Empty'}
                />
                <AntdDescriptions.Item
                  span={3}
                  label={$t({ defaultMessage: 'Model' })}
                  children={'LWLT-C'}
                />
                <AntdDescriptions.Item
                  span={2}
                  label={$t({ defaultMessage: 'Cages' })}
                  children={'16'}
                />
                <AntdDescriptions.Item
                  span={4}
                  label={$t({ defaultMessage: 'S/N' })}
                  children={'N/A'}
                />
              </StyledAntdDescriptions>
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