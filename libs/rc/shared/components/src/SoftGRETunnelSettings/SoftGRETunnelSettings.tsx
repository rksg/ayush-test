import { Form, Switch, Space } from 'antd'
import { useWatch }            from 'antd/lib/form/Form'
import { DefaultOptionType }   from 'antd/lib/select'
import { useIntl }             from 'react-intl'

import { Tooltip, Alert, StepsForm } from '@acx-ui/components'
import {
  SoftGreDuplicationChangeDispatcher,
  SoftGreDuplicationChangeState
} from '@acx-ui/rc/utils'

import { SoftGREProfileSettings } from './SoftGREProfileSettings'
import { FieldLabel }             from './styledComponents'

interface SoftGRETunnelSettingsProps {
  index: number;
  portId?: string;
  onGUIChanged?: (fieldName: string) => void;
  readonly: boolean;
  toggleButtonToolTip?: string
  softGREProfileOptionList?: DefaultOptionType[];
  apModel?: string
  serialNumber?: string
  isUnderAPNetworking: boolean
  optionDispatch?: React.Dispatch<SoftGreDuplicationChangeDispatcher>
  validateIsFQDNDuplicate: (softGreProfileId: string) => boolean
}

export const SoftGRETunnelSettings = (props: SoftGRETunnelSettingsProps) => {
  const { $t } = useIntl()
  const {
    index,
    portId,
    onGUIChanged,
    readonly,
    toggleButtonToolTip,
    softGREProfileOptionList,
    apModel,
    serialNumber,
    isUnderAPNetworking,
    optionDispatch,
    validateIsFQDNDuplicate
  } = props

  const softgreTunnelFieldName = ['lan', index, 'softGreEnabled']
  const form = Form.useFormInstance()
  const isSoftGreTunnelToggleEnabled = useWatch<boolean>(softgreTunnelFieldName, form)
  const softGreProfileId = useWatch<string>(['lan', index, 'softGreProfileId'], form)
  return (
    <>
      <StepsForm.StepForm>
        <FieldLabel width='220px'>
          <Space>
            {$t({ defaultMessage: 'Enable SoftGRE Tunnel' })}
            <Tooltip.Question
              title={toggleButtonToolTip ||
                $t({ defaultMessage: 'Tunnel the traffic to a SoftGRE gateway. '+
              'Please note that the uplink port does not support ' +
              'SoftGRE tunneling, which will cause the AP(s) to disconnect.' })
              }
              placement='right'
              iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
            />
          </Space>
          <Form.Item
            valuePropName='checked'
            style={{ marginTop: '-5px' }}
            name={softgreTunnelFieldName}
            children={
              <Switch
                data-testid={'softgre-tunnel-switch'}
                disabled={readonly}
                onChange={(value) => {
                  onGUIChanged?.('softGreEnabled')
                  const voter = (isUnderAPNetworking ?
                    { serialNumber, portId: portId ?? '0' }:
                    { model: apModel, portId: portId ?? '0' })
                  if (value) {
                    optionDispatch && optionDispatch ({
                      state: SoftGreDuplicationChangeState.TurnOnSoftGre,
                      softGreProfileId: form.getFieldValue(['lan', index, 'softGreProfileId']),
                      voter: voter
                    })
                  }
                  else {
                    optionDispatch && optionDispatch ({
                      state: SoftGreDuplicationChangeState.TurnOffSoftGre,
                      voter: voter
                    })
                  }
                }}
              />
            }
          />
        </FieldLabel>
      </StepsForm.StepForm>
      {
        isSoftGreTunnelToggleEnabled && <>
          <Alert
            data-testid={'enable-softgre-tunnel-banner'}
            showIcon={true}
            style={{ verticalAlign: 'middle' }}
            message={$t({
              defaultMessage: 'Enabling on the uplink/WAN port will disconnect AP(s)' })
            }
          />
          <SoftGREProfileSettings
            index={index}
            softGreProfileId={softGreProfileId}
            onGUIChanged={onGUIChanged}
            readonly={readonly}
            portId={portId}
            softGREProfileOptionList={softGREProfileOptionList}
            apModel={apModel}
            serialNumber={serialNumber}
            isUnderAPNetworking={isUnderAPNetworking}
            optionDispatch={optionDispatch}
            validateIsFQDNDuplicate={validateIsFQDNDuplicate}
          />
        </>
      }
    </>
  )
}
