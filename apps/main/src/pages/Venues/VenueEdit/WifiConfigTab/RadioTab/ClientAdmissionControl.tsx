import { useContext, useEffect, useState } from 'react'

import { Form, Slider, Switch, Tooltip } from 'antd'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'
import styled                            from 'styled-components/macro'

import { Loader }                                                                               from '@acx-ui/components'
import { useGetVenueClientAdmissionControlQuery, useUpdateVenueClientAdmissionControlMutation } from '@acx-ui/rc/services'
import { VenueClientAdmissionControl }                                                          from '@acx-ui/rc/utils'

import { VenueEditContext } from '../..'
import { FieldLabel }       from '../styledComponents'

const ClientAdmissionControlSliderBlock = styled.div`
  margin-top:-25px;
  margin-right: 50px;
  height:auto;
  max-width:100%;
  text-align:center;
  padding:25px 5px 10px 20px;
  border: 2px solid var(--acx-neutrals-30);
`
const { useWatch } = Form

export function ClientAdmissionControl () {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const form = Form.useFormInstance()
  const [isGrayedOut, setGrayedOut] = useState(false)

  const enable24GFieldName = 'enableClientAdmissionControl24G'
  const enable50GFieldName = 'enableClientAdmissionControl50G'
  const minClientCount24GFieldName = 'clientAdmissionControlMinClientCount24G'
  const minClientCount50GFieldName = 'clientAdmissionControlMinClientCount50G'
  const maxRadioLoad24GFieldName = 'clientAdmissionControlMaxRadioLoad24G'
  const maxRadioLoad50GFieldName = 'clientAdmissionControlMaxRadioLoad50G'
  const minClientThroughput24GFieldName = 'clientAdmissionControlMinClientThroughput24G'
  const minClientThroughput50GFieldName = 'clientAdmissionControlMinClientThroughput50G'

  const [ enable24G, enable50G ] = [
    useWatch<boolean>(enable24GFieldName),
    useWatch<boolean>(enable50GFieldName)
  ]

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(VenueEditContext)

  const getClientAdmissionControl = useGetVenueClientAdmissionControlQuery({ params: { venueId } })
  const [ updateClientAdmissionControl, { isLoading: isUpdatingClientAdmissionControl }] =
    useUpdateVenueClientAdmissionControlMutation()

  useEffect(() => {
    const clientAdmissionControlData = getClientAdmissionControl?.data
    if (clientAdmissionControlData) {
      form.setFieldValue(enable24GFieldName,
        (!isGrayedOut)? clientAdmissionControlData.enable24G: false)
      form.setFieldValue(enable50GFieldName,
        (!isGrayedOut)? clientAdmissionControlData.enable50G: false)
      form.setFieldValue(minClientCount24GFieldName, clientAdmissionControlData.minClientCount24G)
      form.setFieldValue(minClientCount50GFieldName, clientAdmissionControlData.minClientCount50G)
      form.setFieldValue(maxRadioLoad24GFieldName, clientAdmissionControlData.maxRadioLoad24G)
      form.setFieldValue(maxRadioLoad50GFieldName, clientAdmissionControlData.maxRadioLoad50G)
      form.setFieldValue(minClientThroughput24GFieldName,
        clientAdmissionControlData.minClientThroughput24G)
      form.setFieldValue(minClientThroughput50GFieldName,
        clientAdmissionControlData.minClientThroughput50G)
    }
  }, [isGrayedOut, form, getClientAdmissionControl?.data])

  useEffect(() => {
    const isSwitchTurnedOffAndGrayedOut = editRadioContextData?.isBandBalancingEnabled ||
    editRadioContextData?.isLoadBalancingEnabled
    if (isSwitchTurnedOffAndGrayedOut) {
      form.setFieldValue(enable24GFieldName, false)
      form.setFieldValue(enable50GFieldName, false)
      setGrayedOut(true)
    } else {
      setGrayedOut(false)
    }
  }, [
    form,
    editRadioContextData?.isBandBalancingEnabled,
    editRadioContextData?.isLoadBalancingEnabled
  ])

  const handleUpdateClientAdmissionControl = async () => {
    try {
      const payload: VenueClientAdmissionControl = {
        enable24G: form.getFieldValue(enable24GFieldName),
        enable50G: form.getFieldValue(enable50GFieldName),
        minClientCount24G: form.getFieldValue(minClientCount24GFieldName),
        minClientCount50G: form.getFieldValue(minClientCount50GFieldName),
        maxRadioLoad24G: form.getFieldValue(maxRadioLoad24GFieldName),
        maxRadioLoad50G: form.getFieldValue(maxRadioLoad50GFieldName),
        minClientThroughput24G: form.getFieldValue(minClientThroughput24GFieldName),
        minClientThroughput50G: form.getFieldValue(minClientThroughput50GFieldName)
      }
      await updateClientAdmissionControl({
        params: { venueId },
        payload
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onFormDataChanged = () => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })

    setEditRadioContextData && setEditRadioContextData({
      ...editRadioContextData,
      isClientAdmissionControlDataChanged: true,
      updateClientAdmissionControl: handleUpdateClientAdmissionControl
    })
  }

  return (<Loader states={[{
    isLoading: getClientAdmissionControl.isLoading,
    isFetching: isUpdatingClientAdmissionControl
  }]}>
    <div>
      <FieldLabel
        width='240px'
        style={{ paddingLeft: '10px' }}>
        <div style={{ background: 'var(--acx-primary-white)' }}>
          {$t({ defaultMessage: 'Enable 2.4 GHz' })}
        </div>
        <Tooltip
          title={(isGrayedOut)?
            $t({ defaultMessage: `To enable the client admission control, please make sure 
              the band balancing or load balancing in the venue is disabled.` }): null}
          placement='right'>
          <Form.Item
            name={enable24GFieldName}
            style={{ marginBottom: '10px', width: '45px', background: 'var(--acx-primary-white)' }}
            valuePropName='checked'
            initialValue={enable24G}>
            <Switch
              disabled={isGrayedOut}
              data-testid='client-admission-control-enable-24g'
              onChange={onFormDataChanged} />
          </Form.Item>
        </Tooltip>
      </FieldLabel>
      {enable24G &&
      <ClientAdmissionControlSliderBlock>
        <Form.Item
          label={$t({ defaultMessage: 'Min client count:' })}
          name={minClientCount24GFieldName}
          data-testid='client-admission-control-min-client-count-24g'
          children={
            <Slider
              tooltipVisible={false}
              style={{ width: '245px' }}
              min={0}
              max={100}
              marks={{
                0: { label: '0' },
                100: { label: '100' }
              }}
              onChange={onFormDataChanged}
            />
          }
        />
        <br/>
        <Form.Item
          label={$t({ defaultMessage: 'Max client load: (%)' })}
          name={maxRadioLoad24GFieldName}
          data-testid='client-admission-control-max-client-load-24g'
          children={
            <Slider
              tooltipVisible={false}
              style={{ width: '245px' }}
              min={50}
              max={100}
              marks={{
                50: { label: '50%' },
                100: { label: '100%' }
              }}
              onChange={onFormDataChanged}
            />
          }
        />
        <br/>
        <Form.Item
          label={$t({ defaultMessage: 'Min client throughput: (Mbps)' })}
          name={minClientThroughput24GFieldName}
          data-testid='client-admission-control-min-client-throughput-24g'
          children={
            <Slider
              tooltipVisible={false}
              style={{ width: '245px' }}
              min={0}
              max={100}
              marks={{
                0: { label: '0 Mbps' },
                100: { label: '100 Mbps' }
              }}
              onChange={onFormDataChanged}
            />
          }
        />
      </ClientAdmissionControlSliderBlock>
      }
    </div>
    <div>
      <FieldLabel
        width='240px'
        style={{ paddingLeft: '10px' }}>
        <div style={{ background: 'var(--acx-primary-white)' }}>
          {$t({ defaultMessage: 'Enable 5 GHz' })}
        </div>
        <Tooltip
          title={(isGrayedOut)?
            $t({ defaultMessage: `To enable the client admission control, please make sure 
              the band balancing or load balancing in the venue is disabled.` }): null}
          placement='right'>
          <Form.Item
            name={enable50GFieldName}
            style={{ marginBottom: '10px', background: 'var(--acx-primary-white)', width: '45px' }}
            valuePropName='checked'
            initialValue={enable24G}>
            <Switch
              disabled={isGrayedOut}
              data-testid='client-admission-control-enable-50g'
              onChange={onFormDataChanged} />
          </Form.Item>
        </Tooltip>
      </FieldLabel>

      {enable50G &&
        <ClientAdmissionControlSliderBlock>
          <Form.Item
            label={$t({ defaultMessage: 'Min client count:' })}
            name={minClientCount50GFieldName}
            data-testid='client-admission-control-min-client-count-50g'
            children={
              <Slider
                tooltipVisible={false}
                style={{ width: '245px' }}
                min={0}
                max={100}
                marks={{
                  0: { label: '0' },
                  100: { label: '100' }
                }}
                onChange={onFormDataChanged}
              />
            }
          />
          <br/>
          <Form.Item
            label={$t({ defaultMessage: 'Max client load: (%)' })}
            name={maxRadioLoad50GFieldName}
            data-testid='client-admission-control-max-client-load-50g'
            children={
              <Slider
                tooltipVisible={false}
                style={{ width: '245px' }}
                min={50}
                max={100}
                marks={{
                  50: { label: '50%' },
                  100: { label: '100%' }
                }}
                onChange={onFormDataChanged}
              />
            }
          />
          <br/>
          <Form.Item
            label={$t({ defaultMessage: 'Min client throughput: (Mbps)' })}
            name={minClientThroughput50GFieldName}
            data-testid='client-admission-control-min-client-throughput-50g'
            children={
              <Slider
                tooltipVisible={false}
                style={{ width: '245px' }}
                min={0}
                max={100}
                marks={{
                  0: { label: '0 Mbps' },
                  100: { label: '100 Mbps' }
                }}
                onChange={onFormDataChanged}
              />
            }
          />
        </ClientAdmissionControlSliderBlock>
      }
    </div>
  </Loader>
  )
}