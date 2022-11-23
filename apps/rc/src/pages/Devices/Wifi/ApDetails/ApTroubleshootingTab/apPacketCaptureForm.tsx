import { useEffect, useRef, useState } from 'react'
import React from 'react'
import * as UI from './styledComponents'

import { Row, Col, Form, Input, Select, Checkbox } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import _ from 'lodash'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Loader, showToast, Tooltip } from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { useGetApCapabilitiesQuery, useGetApQuery, useGetApRadioCustomizationQuery, useGetPacketCaptureStateQuery, usePingApMutation, useStartPacketCaptureMutation, useStopPacketCaptureMutation } from '@acx-ui/rc/services'
import { targetHostRegExp, WifiTroubleshootingMessages } from '@acx-ui/rc/utils'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import { ApPacketCaptureStateEnum } from 'libs/rc/utils/src/models/ApPacketCaptureEnum'

export function ApPacketCaptureForm() {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const [pingForm] = Form.useForm()
  const [isValid, setIsValid] = useState(false)
  const [startPacketCapture] = useStartPacketCaptureMutation()
  const [stopPacketCapture] = useStopPacketCaptureMutation()
  const packetCaptureState = useGetPacketCaptureStateQuery({ params: { tenantId, serialNumber } })
  const [isCapturing, setIsCapturing] = useState(false)

  const getAp = useGetApQuery({ params: { tenantId, serialNumber } })
  const getApCapabilities = useGetApCapabilitiesQuery({ params: { tenantId, serialNumber } })
  const getApRadioCustomization = useGetApRadioCustomizationQuery({ params: { tenantId, serialNumber } })

  useEffect(() => {
    if (packetCaptureState.data) {
      setIsCapturing(packetCaptureState.data.status === ApPacketCaptureStateEnum.CAPTURING)
    }
  }, [packetCaptureState]
  )

  useEffect(() => {
    const ap = getAp.data
    const apCapabilities = getApCapabilities.data
    const apRadioCustomization = getApRadioCustomization.data

    if (ap && apCapabilities && apRadioCustomization) {
      // setIsCapturing(packetCaptureState.data.status === ApPacketCaptureStateEnum.CAPTURING)
    }
  }, [getAp, getApCapabilities, getApRadioCustomization]
  )

  const handlePingAp = async () => {
    try {
      const payload = {
        targetHost: pingForm.getFieldValue('name')
      }
      // const pingApResult = await pingAp({ params: { tenantId, serialNumber }, payload }).unwrap()
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const onChangeForm = function () {
    pingForm.validateFields()
      .then(() => {
        setIsValid(true)
      })
      .catch(() => {
        setIsValid(false)
      })
  }

  const onChange = (checkedValues: CheckboxValueType[]) => {
    console.log('checked = ', checkedValues);
  };


  return <Form
    form={pingForm}
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
                  options={[
                    { label: $t({ defaultMessage: 'No model selected' }), value: null },
                    // ...apModelsOptions
                  ]}
                // onChange={handleModelChange}
                />
              }
            />
            <Form.Item
              name='macAddressFilter'
              label=
              {$t({ defaultMessage: 'MAC Address Filter:' })}
              rules={[
                // { validator: (_, value) => targetHostRegExp(value) }
              ]}
              validateFirst
              // hasFeedback
              children={<Input />}
            />

            <Form.Item
              name='frameTypeFilter'
              label={$t({ defaultMessage: 'Frame Type Filter:' })}
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
        <UI.CapturingText>Capturing...</UI.CapturingText>
      </div>
    }

    <Button
      style={{ marginTop: '10px' }}
      type='secondary'
      htmlType='submit'
      // disabled={!isValid || isPingingAp}
      onClick={handlePingAp}>
      {
        isCapturing ? $t({ defaultMessage: 'Stop' }) : $t({ defaultMessage: 'Start' })
      }
    </Button>

    <UI.Note>
      {$t({ defaultMessage: 'Note: file is limited to the latest 20 MB of captured packets' })}
    </UI.Note>
  </Form>
}

