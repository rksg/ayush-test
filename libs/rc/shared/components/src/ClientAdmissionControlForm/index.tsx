import { Form, Slider, Switch, Tooltip } from 'antd'
import { NamePath }                      from 'antd/es/form/interface'
import { defineMessage, useIntl }        from 'react-intl'

import { ClientAdmissionControlSliderBlock, FieldLabel } from './styledComponents'

export enum ClientAdmissionControlTypeEnum {
  CAC_24G = '24g',
  CAC_5G = '50g',
}

const enableSwitchLabel = {
  [ClientAdmissionControlTypeEnum.CAC_24G]: defineMessage({ defaultMessage: 'Enable 2.4 GHz' }),
  [ClientAdmissionControlTypeEnum.CAC_5G]: defineMessage({ defaultMessage: 'Enable 5 GHz' })
}

export function ClientAdmissionControlForm (props: {
  type: ClientAdmissionControlTypeEnum,
  readOnly: boolean
  isEnabled: boolean,
  isMutuallyExclusive: boolean,
	enabledFieldName: NamePath,
  minClientCountFieldName: NamePath,
  maxRadioLoadFieldName: NamePath,
  minClientThroughputFieldName: NamePath,
  onFormDataChanged?: () => void,
 }) {
  const { $t } = useIntl()
  const {
    type,
    readOnly,
    isEnabled,
    isMutuallyExclusive,
    enabledFieldName,
    minClientCountFieldName,
    maxRadioLoadFieldName,
    minClientThroughputFieldName,
    onFormDataChanged
  } = props
  const form = Form.useFormInstance()

  return (
  	<>
      <FieldLabel
        width='240px'
        style={{ zIndex: '1', paddingLeft: '10px' }}>
        <div style={{ background: 'var(--acx-primary-white)' }}>
          {$t(enableSwitchLabel[type])}
        </div>
        <Tooltip
          title={(isMutuallyExclusive)?
            $t({ defaultMessage: `To enable the client admission control, please make sure 
              the band balancing or load balancing in the venue is disabled.` }): null}
          placement='right'>
          <Form.Item
            name={enabledFieldName}
            style={{ marginBottom: '10px', width: '45px', background: 'var(--acx-primary-white)' }}
            valuePropName='checked'
            initialValue={isEnabled}>
            {(readOnly)?
              <span
                style={{ display: 'flex' }}
                data-testid={'client-admission-control-enable-read-only-'+type}>
                {isEnabled? $t({ defaultMessage: 'On' }): $t({ defaultMessage: 'Off' })}
              </span>
              :
              <Switch
                disabled={isMutuallyExclusive}
                data-testid={'client-admission-control-enable-'+type}
                onChange={onFormDataChanged} />
            }
          </Form.Item>
        </Tooltip>
      </FieldLabel>
      {isEnabled &&
        <ClientAdmissionControlSliderBlock>
          <Form.Item
            label={$t({ defaultMessage: 'Min client count:' })}
            name={minClientCountFieldName}
            data-testid={'client-admission-control-min-client-count-'+type}
            children={
              (readOnly)?
                <span
                  style={{ display: 'flex' }}>
                  {form.getFieldValue(minClientCountFieldName)}
                </span>
                :
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
            name={maxRadioLoadFieldName}
            data-testid={'client-admission-control-max-client-load-'+type}
            children={
              (readOnly)?
                <span
                  style={{ display: 'flex' }}>
                  {form.getFieldValue(maxRadioLoadFieldName)}{' %'}
                </span>
                :
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
            name={minClientThroughputFieldName}
            data-testid={'client-admission-control-min-client-throughput-'+type}
            children={
              (readOnly)?
                <span
                  style={{ display: 'flex' }}>
                  {form.getFieldValue(minClientThroughputFieldName)}{' Mbps'}
                </span>
                :
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
    </>
  )
}