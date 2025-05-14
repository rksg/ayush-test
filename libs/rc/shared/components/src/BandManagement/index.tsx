/* eslint-disable max-len */
import { useEffect, useRef, useState } from 'react'

import { Col, Row, Space } from 'antd'
import { keyBy, sortBy }   from 'lodash'
import { useIntl }         from 'react-intl'
import { CSSProperties }   from 'styled-components'
import styled              from 'styled-components/macro'

import { Button, Pill, Table, TableProps }       from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { DeleteOutlinedIcon, EditOutlinedIcon }  from '@acx-ui/icons'
import { BandModeEnum, ApModelBandModeSettings } from '@acx-ui/rc/utils'
import { useParams }                             from '@acx-ui/react-router-dom'

import { ApCompatibilityDrawer, ApCompatibilityToolTip, ApCompatibilityType, InCompatibilityFeatures } from '../ApCompatibility'

import { BandManagementDrawer } from './BandManagementDrawer'

const BandModePill = styled((props: { children: React.ReactNode }) =>
  (<Pill type='color'{...props}/>))`
    border-radius: 2px;
    background-color: var(--acx-accents-blue-20);
    color: #333;
    opacity: 85%;
    height: 18px;
    line-height: 12px;
    margin-right: 5px;
    padding: 2px 5px;
  `

export interface ModelOption {
  label: string
  value: string
}

export interface BandManagementPorps {
  style?: CSSProperties | undefined
  triBandApModels: string[]
  dual5gApModels: string[]
  bandModeCaps: Record<string, BandModeEnum[]>
  existingTriBandApModels: string[]
  currentBandModeData: ApModelBandModeSettings[]
  setCurrentBandModeData: (data: ApModelBandModeSettings[]) => void,
  disabled?: boolean
  showTitle?: boolean
}

export const BandManagement = ({ style, disabled, showTitle = true,
  triBandApModels, dual5gApModels, bandModeCaps, existingTriBandApModels,
  currentBandModeData, setCurrentBandModeData }: BandManagementPorps) => {

  const { $t } = useIntl()
  const { venueId } = useParams()

  const [supportBandManagementApModels, setSupportBandManagementApModels] = useState<string[]>([])

  const [rfDrawerVisible, setRfDrawerVisible] = useState(false)
  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)

  useEffect(()=> {
    const supportBandManagementApModels = triBandApModels
      .filter(model => dual5gApModels.includes(model) || Object.keys(bandModeCaps).includes(model))
    setSupportBandManagementApModels(supportBandManagementApModels)
  }, [triBandApModels, dual5gApModels, bandModeCaps])

  const [tableData, setTableData] = useState([] as ApModelBandModeSettings[])

  useEffect(()=> {
    const tableData = [ ...currentBandModeData ]
    setTableData(sortBy(tableData, ['model']))
  }, [currentBandModeData])

  const tableDataMap = useRef<Record<string, ApModelBandModeSettings>>({})
  useEffect(()=> {
    tableDataMap.current = tableData ? keyBy(tableData, 'model') : {}
  }, [tableData])

  const [drawerData, setDrawerData] = useState({} as ApModelBandModeSettings)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const onAddOrEdit = (item: ApModelBandModeSettings) => {
    tableDataMap.current[item['model' as keyof ApModelBandModeSettings] as unknown as string] = item
    setCurrentBandModeData(sortBy(Object.values(tableDataMap.current)))
  }

  const columns: TableProps<ApModelBandModeSettings>['columns'] = [{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'model',
    key: 'model',
    width: 120
  }, {
    title: $t({ defaultMessage: 'Band operating selection' }),
    dataIndex: 'bandMode',
    key: 'bandMode',
    width: 260,
    render: (bandMode, row) => <>
      <BandModePill>2.4 GHz</BandModePill>
      {bandMode === BandModeEnum.DUAL && dual5gApModels.includes(row.model) ?
        <>
          <BandModePill>Lower 5GHz</BandModePill>
          <BandModePill>Upper 5GHz</BandModePill>
        </> : <BandModePill>5 GHz</BandModePill>
      }
      {bandMode === BandModeEnum.TRIPLE &&
        <BandModePill>6 GHz</BandModePill>}
    </>
  }, {
    key: 'action',
    dataIndex: 'action',
    width: 80,
    render: (_, row) => <>
      <Button
        key='edit'
        role='editBtn'
        type='link'
        disabled={disabled}
        icon={<EditOutlinedIcon />}
        style={{ height: '22px' }}
        onClick={() => {
          setDrawerData({ ...row } as ApModelBandModeSettings)
          setDrawerVisible(true)
        }} />
      <Button
        key='delete'
        role='deleteBtn'
        type='link'
        disabled={disabled || existingTriBandApModels.includes(row.model)}
        icon={<DeleteOutlinedIcon />}
        style={{ height: '22px' }}
        onClick={() => {
          setTableData(tableData.filter((item) => item.model !== row.model))
          setCurrentBandModeData(currentBandModeData.filter((item) => item.model !== row.model))
          if (row.model === drawerData?.model) {
            setDrawerData({} as ApModelBandModeSettings)
            setDrawerVisible(false)
          }
        }} />
    </>
  }]

  return (<Space size={8} direction='vertical' style={style}>
    <Row gutter={0}>
      <Col span={18}>
        <Space>
          {showTitle && $t({ defaultMessage: 'Wi-Fi 6/7 band management:' })}
          {isR370UnsupportedFeatures && <ApCompatibilityToolTip
            title={''}
            showDetailButton
            placement='right'
            onClick={() => setRfDrawerVisible(true)}
          />}
          {isR370UnsupportedFeatures && <ApCompatibilityDrawer
            visible={rfDrawerVisible}
            type={venueId ? ApCompatibilityType.VENUE : ApCompatibilityType.ALONE}
            venueId={venueId}
            featureName={InCompatibilityFeatures.BAND_MANAGEMENT}
            onClose={() => setRfDrawerVisible(false)}
          />}
        </Space>
      </Col>
      <Col span={6} style={{ textAlign: 'right' }}>
        <Button
          onClick={() => {
            setDrawerData({} as ApModelBandModeSettings)
            setDrawerVisible(true)
          }}
          type='link'
          disabled={disabled || triBandApModels
            .filter(model => supportBandManagementApModels.includes(model))
            .every(model => tableData.map(row => row.model).includes(model))}
          size='small'>
          {$t({ defaultMessage: 'Add model' })}
        </Button>
      </Col>
    </Row>
    <Table
      columns={columns}
      dataSource={tableData}
      type='form' />
    <BandManagementDrawer
      visible={drawerVisible}
      setVisible={setDrawerVisible}
      onAddOrEdit={onAddOrEdit}
      initialData={drawerData}
      tableDataModels={tableData.map(row => row.model)}
      triBandApModels={triBandApModels}
      dual5gApModels={dual5gApModels}
      bandModeCaps={bandModeCaps} />
  </Space>)
}
