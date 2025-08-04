import { useEffect, useState } from 'react'

import { Row, Col, Form, Input, Select, Checkbox } from 'antd'
import saveAs                                      from 'file-saver'
import { cloneDeep }                               from 'lodash'
import { useIntl }                                 from 'react-intl'

import { Button, Loader, showToast, showActionModal } from '@acx-ui/components'
import {
  useGetApLanPortsQuery,
  useGetApQuery,
  useGetApRadioCustomizationQuery,
  useGetPacketCaptureStateQuery,
  useLazyGetApBandModeSettingsQuery,
  useStartPacketCaptureMutation,
  useStopPacketCaptureMutation
} from '@acx-ui/rc/services'
import {
  ApPacketCaptureStateEnum,
  BandModeEnum,
  CaptureInterfaceEnum,
  MacAddressFilterRegExp,
  useApContext
} from '@acx-ui/rc/utils'


import { useGetApCapabilities } from '../../hooks'

import * as UI from './styledComponents'

export interface SelectOption {
  label: string,
  value: string
}

export enum CaptureInterfaceEnumExtended {
  WIRED = 'WIRED'
}

export function ApPacketCaptureForm () {
  const { $t } = useIntl()
  const { tenantId, venueId, serialNumber } = useApContext()
  const params = { tenantId, venueId, serialNumber }
  const [packetCaptureForm] = Form.useForm()

  const [startPacketCapture] = useStartPacketCaptureMutation()
  const [stopPacketCapture] = useStopPacketCaptureMutation()
  const packetCaptureState = useGetPacketCaptureStateQuery({
    params: { tenantId, serialNumber, venueId },
    enableRbac: true
  })
  const getAp = useGetApQuery({
    params,
    enableRbac: true
  })

  const { data: apCapabilities } = useGetApCapabilities({
    params,
    modelName: getAp?.data?.model,
    enableRbac: true
  })

  const getApLanPorts = useGetApLanPortsQuery({
    params: { serialNumber, venueId },
    enableRbac: true
  })
  const getApRadioCustomization =
    useGetApRadioCustomizationQuery({ params, enableRbac: true })

  const [getApBandModeSettings] = useLazyGetApBandModeSettingsQuery()

  const [interfaceOptions, setInterfaceOptions] = useState([] as SelectOption[])
  const [lanPortOptions, setLanPortOptions] = useState([] as SelectOption[])
  const [isCapturing, setIsCapturing] = useState(false)
  const [isWired, setIsWired] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isPrepare, setIsPrepare] = useState(false)
  const [hasRequest, setHasRequest] = useState(false)
  const [sessionId, setSessionId] = useState('')


  const packetCaptureStateRefetch = function ( ){
    setTimeout(() => {
      packetCaptureState.refetch()
    }, 3000)
  }

  useEffect(() => {
    const { data } = packetCaptureState
    if (data) {
      const { status } = data

      setIsPrepare(false)
      setIsCapturing(status === ApPacketCaptureStateEnum.CAPTURING)
      if (status === ApPacketCaptureStateEnum.CAPTURING) {
        setSessionId(data.sessionId || '')
      }

      if (status === ApPacketCaptureStateEnum.STOPPING) {
        setIsPrepare(true)
        packetCaptureStateRefetch()
      }

      if(status === ApPacketCaptureStateEnum.READY
        && hasRequest
        && sessionId === data.sessionId) {
        try {
          const { fileUrl, fileName } = data
          if (fileUrl && fileName) {
            saveAs(fileUrl, fileName.split('?')[0])
          }
        }
        catch {
          showToast({
            type: 'error',
            content: $t({ defaultMessage: 'Failed to download packet capture.' })
          })
        }
        setHasRequest(false)
      }
    }
  }, [packetCaptureState]
  )

  useEffect(() => {
    const setRadioOptions = async () => {
      const ap = getAp.data
      const apRadioCustomization = getApRadioCustomization.data

      if (ap && apCapabilities && apRadioCustomization) {

        let captureInterfaceOptions = []

        const {
          supportTriRadio = false,
          supportDual5gMode = false,
          supportBandCombination = false
        } = apCapabilities || {}
        const { enable24G, enable50G, enable6G, apRadioParamsDual5G } = apRadioCustomization

        if (enable24G) {
          captureInterfaceOptions.push({
            label: $t({ defaultMessage: '2.4 GHz' }),
            value: CaptureInterfaceEnum.RADIO24
          })
        }

        if (supportTriRadio && supportDual5gMode && apRadioParamsDual5G?.enabled) {
          if (apRadioParamsDual5G.lower5gEnabled) {
            captureInterfaceOptions.push(
              {
                label: $t({ defaultMessage: 'Lower 5 GHz' }),
                value: CaptureInterfaceEnum.RADIO50LOWER
              }
            )
          }
          if (apRadioParamsDual5G.upper5gEnabled) {
            captureInterfaceOptions.push(
              {
                label: $t({ defaultMessage: 'Upper 5 GHz' }),
                value: CaptureInterfaceEnum.RADIO50UPPER
              }
            )
          }
        } else {
          if (enable50G) {
            captureInterfaceOptions.push(
              { label: $t({ defaultMessage: '5 GHz' }), value: CaptureInterfaceEnum.RADIO50 }
            )
          }
        }

        let isTriBandMode = true
        if (supportBandCombination) {
          const apBandMode = await getApBandModeSettings({
            params,
            enableRbac: true
          }).unwrap()
          isTriBandMode = apBandMode.bandMode === BandModeEnum.TRIPLE
        }

        if (supportTriRadio && enable6G && isTriBandMode) {
          captureInterfaceOptions.push(
            { label: $t({ defaultMessage: '6 GHz' }), value: CaptureInterfaceEnum.RADIO60 }
          )
        }

        captureInterfaceOptions.push(
          { label: $t({ defaultMessage: 'Wired' }), value: CaptureInterfaceEnumExtended.WIRED }
        )

        setInterfaceOptions(captureInterfaceOptions)
        packetCaptureForm.setFieldValue('captureInterface', captureInterfaceOptions[0].value)
      }
    }


    setRadioOptions()

  }, [getAp, apCapabilities, getApRadioCustomization])

  useEffect(() => {
    const apLanPorts = getApLanPorts.data

    if (apLanPorts) {
      let lanPortOptions: SelectOption[] = []
      apLanPorts.lanPorts?.forEach((lanPort, index) => {
        if (lanPort.enabled) {
          const portId = lanPort.portId
          const portValue = 'ETH' + index.toString()
          lanPortOptions.push({
            label: $t({ defaultMessage: 'LAN' }) + portId, value: portValue
          })
        }
      })
      setLanPortOptions(lanPortOptions)
      packetCaptureForm.setFieldValue('wiredCaptureInterface', lanPortOptions[0].value)
    }

  }, [getApLanPorts])

  const handlePackeCapture = async () => {
    if (!isCapturing) { // Start
      showActionModal({
        type: 'warning',
        width: 450,
        content: <p>
          {$t({ defaultMessage: `After starting the packet capture, please ensure to manually {br}
                <b>STOP</b> the packet capture once the investigation has been {br}
                completed to avoid any performance degradation.` }, {
            br: <br/>,
            b: (chunk) => <b>{chunk}</b>
          })}
        </p>,
        okText: $t({ defaultMessage: 'Start' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        customContent: {
          action: 'CUSTOM_BUTTONS',
          buttons: [
            {
              text: 'Cancel',
              type: 'default',
              key: 'cancel'
            },
            {
              text: 'Start',
              type: 'primary',
              key: 'start',
              closeAfterAction: true,
              handler: async () => {
                try{
                  const formValue = packetCaptureForm.getFieldsValue()
                  const payload = cloneDeep(formValue)
                  if (payload.captureInterface === CaptureInterfaceEnumExtended.WIRED) {
                    payload.captureInterface = payload.wiredCaptureInterface
                    payload.frameTypeFilter = []
                  }
                  delete payload.wiredCaptureInterface
                  // eslint-disable-next-line
                  const result = await startPacketCapture({ 
                    params: { tenantId, serialNumber, venueId },
                    payload,
                    enableRbac: true
                  }).unwrap()
                  setIsCapturing(true)
                  setSessionId(result.requestId || '')
                } catch (error) {
                  console.log(error) // eslint-disable-line no-console
                }
              }
            }
          ]
        }
      })
    } else { // Stop
      const payload = { sessionId }
      try {
        await stopPacketCapture({
          params: { tenantId, serialNumber, venueId },
          payload,
          enableRbac: true
        }).unwrap()
        packetCaptureStateRefetch()
        setIsPrepare(true)
        setHasRequest(true)
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }
  }

  const handleInterfaceChange = (value: string) => {
    setIsWired(value === CaptureInterfaceEnumExtended.WIRED)
  }

  const onChangeForm = function () {
    packetCaptureForm.validateFields()
      .then(() => {
        setIsValid(true)
      })
      .catch(() => {
        setIsValid(false)
      })
  }


  return <Form
    form={packetCaptureForm}
    layout='vertical'
    onChange={onChangeForm}
    style={{ height: '399px' }}
  >
    {!isCapturing &&
      <Row gutter={20}>
        <Col span={8}>
          <Loader
            states={[{
              isLoading: false,
              isFetching: false
            }]}>
            <Form.Item
              name='captureInterface'
              label={$t({ defaultMessage: 'Capture Interface:' })}
              children={
                <Select
                  options={interfaceOptions}
                  onChange={handleInterfaceChange}
                />
              }
            />
            <Form.Item
              name='macAddressFilter'
              initialValue={''}
              label={$t({ defaultMessage: 'MAC Address Filter:' })}
              rules={[
                { validator: (_, value) => MacAddressFilterRegExp(value) }
              ]}
              validateFirst
              children={<Input
                placeholder={$t({ defaultMessage: 'Leave empty or enter valid MAC address' })} />}
            />

            {!isWired &&
              <Form.Item
                name='frameTypeFilter'
                label={$t({ defaultMessage: 'Frame Type Filter:' })}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'You must select at least one frame type' +
                      ' to filter by' })
                }]}
                initialValue={['MANAGEMENT', 'CONTROL', 'DATA']}
                children={
                  <Checkbox.Group style={{ display: 'grid', rowGap: '5px' }}>
                    <Checkbox value='MANAGEMENT'>
                      {$t({ defaultMessage: 'Management' })}
                    </Checkbox>
                    <Checkbox value='CONTROL' style={{ marginLeft: '0px' }}>
                      {$t({ defaultMessage: 'Control' })}
                    </Checkbox>
                    <Checkbox value='DATA' style={{ marginLeft: '0px' }}>
                      {$t({ defaultMessage: 'Data' })}
                    </Checkbox>
                  </Checkbox.Group>
                }
              />
            }

            {isWired &&
              <Form.Item
                name='wiredCaptureInterface'
                label={$t({ defaultMessage: 'LAN Port:' })}
                children={
                  <Select
                    options={lanPortOptions}
                  />
                }
              />
            }

          </Loader>

        </Col>
      </Row>
    }
    {isCapturing &&
      <div style={{ display: 'grid', height: '247px', width: '545px' }}>
        <Loader
          states={[{
            isLoading: true
          }]}>
        </Loader>
        <UI.CapturingText>
          {isPrepare ?
            $t({ defaultMessage: 'Preparing file...' }) : $t({ defaultMessage: 'Capturing...' })}
        </UI.CapturingText>
      </div>
    }

    <Button
      style={{ marginTop: '10px' }}
      type='primary'
      htmlType='submit'
      disabled={!isValid || isPrepare}
      onClick={handlePackeCapture}>
      {
        isCapturing ? $t({ defaultMessage: 'Stop' }) : $t({ defaultMessage: 'Start' })
      }
    </Button>

    <UI.Note>
      {$t({ defaultMessage: 'Note: file is limited to the latest 20 MB of captured packets' })}
    </UI.Note>
  </Form>
}

