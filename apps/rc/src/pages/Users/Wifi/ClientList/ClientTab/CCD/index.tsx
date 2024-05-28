/* eslint-disable max-len */
import { ReactNode, Ref, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { Divider, Form, Input, Select, Space } from 'antd'
import { DefaultOptionType }                   from 'antd/lib/select'
import { useIntl }                             from 'react-intl'
import { useParams }                           from 'react-router-dom'

import { Tooltip }                                            from '@acx-ui/components'
import { CloseSymbol, PlaySolid2, SearchOutlined, StopSolid } from '@acx-ui/icons'
import { useGetCcdSupportVenuesQuery }                        from '@acx-ui/rc/services'
import { ConvertToStandardMacAddress, MacAddressRegExp }      from '@acx-ui/rc/utils'

import { ClientContext } from '..'

import ApGroupSelecterDrawer                     from './ApGroupSelecterDrawer'
import { ApInfoCards }                           from './ApInfoCards'
import { CcdResultViewer, CcdResultViewerProps } from './CcdResultViewer'
import { ApInfo }                                from './contents'
import { Button, CcdResultContainer }            from './styledComponents'



const defaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const ClientConnectionDiagnosis = forwardRef((props: unknown, ref: Ref<unknown> | undefined) => {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm()
  const clientMac = Form.useWatch('client', form)
  const venueId = Form.useWatch('venue', form)

  const { setCcdControlContext } = useContext(ClientContext)

  const { data: venuesList, isLoading: isVenuesListLoading } =
    useGetCcdSupportVenuesQuery({ params: { tenantId }, payload: defaultPayload })

  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [showSelectApsDraw, setShowSelectApsDraw] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAps, setSelectedAps] = useState<string[]>()
  const [selectedApsDisplayText, setSelectedApsDisplayText] = useState<string>()
  const [selectedApsTooltip, setSelectedApsTooltip] = useState<string| ReactNode>()
  const [isTracing, setIsTracing] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [viewerStatus, setViewerStatus] = useState<CcdResultViewerProps>({})

  const [selectedApsInfo, setSelectedApsInfo] = useState<ApInfo[]>()
  const [currentViewApIndex, setCurrentViewApIndex] = useState<number>(0)

  const [ccdReportApInfoList, setCcdReportApInfoList] = useState<ApInfo[]>([])
  const ccdApInfoListRef = useRef<ApInfo[]>([])

  useEffect(() => {
    setCcdControlContext({
      isTracing: false,
      viewStatus: {} as CcdResultViewerProps
    })

  }, [])


  useEffect(()=> {
    if (!isVenuesListLoading) {
      setVenueOption(
        venuesList?.map((item) => ({
          label: item.name,
          value: item.id
        })) ?? []
      )
    }

  }, [venuesList, isVenuesListLoading])


  const openSelectAps = () => {
    setShowSelectApsDraw(true)
  }

  const handleVenueChanged = () => {
    setSelectedApsDisplayText(undefined)
    setSelectedAps(undefined)
    setSelectedApsInfo(undefined)
    setCurrentViewApIndex(0)
  }

  const handleSelectAps = (selectAps: string[], selectApGroups: string[]) => {
    let displayText = selectApGroups.join(', ')
    let tooltip
    if (displayText.length > 25) {
      displayText = selectApGroups[0] + ' ...'

      tooltip = selectApGroups.map(apg => {
        return <div>{apg}</div>
      })
    }
    setSelectedApsDisplayText(displayText)
    setSelectedApsTooltip(tooltip)
    setSelectedAps(selectAps)
  }

  const handleSelectedApsInfo = (apsInfo: ApInfo[]) => {
    const apInfoList = apsInfo || []
    setSelectedApsInfo(apInfoList)
  }

  const handleCleanAllCcdAps = () => {
    ccdApInfoListRef.current = []
    setCcdReportApInfoList([])
    setCurrentViewApIndex(0)
  }

  const handleAddCcdAP = (apMac: string) => {
    const curCcdApInfoList = [ ...ccdApInfoListRef.current ]

    let newCcdApInfo = selectedApsInfo?.find((apInfo: ApInfo) => apInfo?.apMac === apMac)
    if (!newCcdApInfo) {
      newCcdApInfo = { apMac: apMac }
    }

    const newCcdApInfoList = curCcdApInfoList.concat(newCcdApInfo)
    ccdApInfoListRef.current = newCcdApInfoList
    setCcdReportApInfoList(newCcdApInfoList)
    setCurrentViewApIndex(newCcdApInfoList.length - 1)
  }

  const handleResetCcdButtons = () => {
    setIsTracing(false)
    const statusData = {
      ...viewerStatus,
      state: 'RESET_BUTTONS'
    }

    setViewerStatus(statusData)

    setCcdControlContext({
      isTracing: false,
      viewStatus: { ...statusData }
    })
  }


  const handleSwitchDiagnosis = async () => {
    const wantToStart = !isTracing
    setIsTracing(!isTracing)

    const state = wantToStart? 'START' : 'STOP'
    const payload = {
      state,
      clientMac: ConvertToStandardMacAddress(clientMac),
      ...((selectedAps && selectedAps.length > 0)? { aps: selectedAps } : {})
    }

    const statusData = {
      ...viewerStatus,
      state,
      venueId,
      payload,
      historicalIndex: undefined
    }

    setViewerStatus(statusData)

    setCcdControlContext({
      isTracing: !isTracing,
      viewStatus: { ...statusData }
    })
  }

  const stopCcd = async () => {
    setIsTracing(false)

    const state = 'STOP'
    const payload = {
      state,
      clientMac: ConvertToStandardMacAddress(clientMac),
      ...((selectedAps && selectedAps.length > 0)? { aps: selectedAps } : {})
    }
    const statusData = {
      ...viewerStatus,
      state,
      venueId,
      payload,
      historicalIndex: undefined
    }

    setViewerStatus(statusData)

    setCcdControlContext({
      isTracing: false,
      viewStatus: { ...statusData }
    })
  }

  useImperativeHandle(ref, () => ({
    stopCcd: stopCcd
  }))

  const handleClear = () => {
    setSelectedApsDisplayText(undefined)
    setSelectedAps(undefined)
    setSelectedApsInfo(undefined)

    handleCleanAllCcdAps()

    setIsValid(false)
    form.resetFields()
    setViewerStatus({
      ...viewerStatus,
      state: 'CLEAR',
      venueId: undefined,
      payload: undefined,
      historicalIndex: undefined
    })
  }

  const handleFieldsChange = () => {
    const hasErrors = form.getFieldsError().some(item => item.errors.length > 0)

    setIsValid(clientMac && !hasErrors)
  }

  return (<>
    <ApGroupSelecterDrawer
      visible={showSelectApsDraw}
      venueId={venueId}
      updateSelectAps={(aps: string[], apGroups: string[]) => handleSelectAps(aps, apGroups)}
      updateSelectApsInfo={(apsInfos: ApInfo[]) => handleSelectedApsInfo(apsInfos)}
      onCancel={() => setShowSelectApsDraw(false)}
    />
    <Form form={form}
      onFieldsChange={handleFieldsChange}
    >
      <Space align='baseline'>
        <Form.Item required
          label={$t({ defaultMessage: 'Client' })}
          name='client'
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            { required: true },
            { validator: (_, value) => MacAddressRegExp(value) }
          ]}
          children={<Input prefix={<SearchOutlined />}
            disabled={isTracing}
            placeholder={$t({ defaultMessage: 'Enter MAC address' })}
            style={{ width: '300px' }}
          />}
        />

        <Form.Item required
          label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
          name='venue'
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          children={<Select
            options={venueOption}
            disabled={isTracing}
            placeholder={$t({ defaultMessage: 'Select...' })}
            style={{ width: '250px' }}
            onChange={handleVenueChanged}
          />}
        />

        <Form.Item required
          label={$t({ defaultMessage: 'APs' })}
          name='ap'
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          children={<Space>
            <Tooltip title={selectedApsTooltip} placement='bottom'>
              <Input readOnly
                placeholder={$t({ defaultMessage: 'Select...' })}
                style={{ width: '250px' }}
                value={selectedApsDisplayText}
              />
            </Tooltip>
            <Button type='link'
              disabled={!venueId || isTracing}
              onClick={openSelectAps}>
              {$t({ defaultMessage: 'Select' })}
            </Button>
          </Space>}
        />

        <Form.Item
          label=' '
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          children={
            <Button
              type='text'
              icon={!isTracing? <PlaySolid2 /> : <StopSolid />}
              style={{ width: '200px', paddingTop: '10px' }}
              disabled={showSelectApsDraw || !venueId || !isValid || (!selectedAps?.length)}
              onClick={handleSwitchDiagnosis}
            >
              {!isTracing
                ? $t({ defaultMessage: 'Trace Connectivity' })
                : $t({ defaultMessage: 'Stop' })
              }
            </Button>
          }/>

        <Form.Item
          label=' '
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          children={
            <Button
              type='text'
              icon={<CloseSymbol />}
              disabled={isTracing}
              style={{ paddingTop: '10px' }}
              onClick={handleClear}
            >
              {$t({ defaultMessage: 'Clear' })}
            </Button>
          }/>
      </Space>
    </Form>
    <Divider
      style={{
        borderColor: 'var(--acx-neutrals-30)',
        margin: '20px 20px 5px 20px' }}
    />
    {(selectedApsInfo && selectedApsInfo.length > 0)&&
    <CcdResultContainer>
      <div style={{ width: '250px' }}>
        <ApInfoCards
          apInfos={ccdReportApInfoList || []}
          disabled={isTracing}
          selectedApIndex={currentViewApIndex}
          onSelectApChanged={(index: number) => {
            setCurrentViewApIndex(index)
            setViewerStatus({
              ...viewerStatus,
              state: 'HISTORICAL',
              venueId: undefined,
              payload: undefined,
              historicalIndex: index
            })
          }}

        />
      </div>
      <div >
        <CcdResultViewer {...viewerStatus}
          addCcdAp={handleAddCcdAP}
          cleanCcdAps={handleCleanAllCcdAps}
          resetCcdButtons={handleResetCcdButtons}
        />
      </div>
    </CcdResultContainer>
    }
  </>)
})
