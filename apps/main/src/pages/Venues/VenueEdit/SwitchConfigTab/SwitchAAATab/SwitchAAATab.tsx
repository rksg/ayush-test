import { useRef } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { AnchorLayout, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { useUpdateAAASettingMutation }                           from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink }                 from '@acx-ui/react-router-dom'


import { AAAServers }  from './AAAServers'
import { AAASettings } from './AAASettings'


export function SwitchAAATab () {
  const { tenantId, venueId } = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/venues/')
  const [updateAAASettingMutation] = useUpdateAAASettingMutation()

  const serversTitle = $t({ defaultMessage: 'Servers & Users' })
  const settingsTitle = $t({ defaultMessage: 'Settings' })

  const formRef = useRef<StepsFormInstance>()

  const handleUpdate = async () => {
    const values = formRef?.current?.getFieldsValue()
    let payload = _.pick(values, [
      'authnEnabledSsh',
      'authnEnableTelnet',
      'authzEnabledCommand',
      'authzEnabledExec',
      'acctEnabledCommand',
      'acctEnabledExec'
    ])

    if (values.authnEnabledSsh) {
      _.assign(payload, {
        authnFirstPref: values.selectedLoginServers[0],
        authnSecondPref: values.selectedLoginServers[1],
        authnThirdPref: values.selectedLoginServers[2],
        authnFourthPref: values.selectedLoginServers[3]
      })
    }
    if (values.authzEnabledCommand) {
      _.assign(payload, {
        authzCommonsLevel: values.authzCommonsLevel,
        authzCommonsFirstServer: values.selectedCommandAuthOrder[0],
        authzCommonsSecondServer: values.selectedCommandAuthOrder[1],
        authzCommonsThirdServer: values.selectedCommandAuthOrder[2]
      })
    }
    if (values.authzEnabledExec) {
      _.assign(payload, {
        authzExecFirstServer: values.selectedExecAuthOrder[0],
        authzExecSecondServer: values.selectedExecAuthOrder[1],
        authzExecThirdServer: values.selectedExecAuthOrder[2]
      })
    }
    if (values.acctEnabledCommand) {
      _.assign(payload, {
        acctCommonsLevel: values.acctCommonsLevel,
        acctCommonsFirstServer: values.selectedCommandAcctOrder[0],
        acctCommonsSecondServer: values.selectedCommandAcctOrder[1],
        acctCommonsThirdServer: values.selectedCommandAcctOrder[2]
      })
    }
    if (values.acctEnabledExec) {
      _.assign(payload, {
        acctExecFirstServer: values.selectedExecAcctOrder[0],
        acctExecSecondServer: values.selectedExecAcctOrder[1],
        acctExecThirdServer: values.selectedExecAcctOrder[2]
      })
    }

    await updateAAASettingMutation({
      params: { tenantId, venueId },
      payload: _.pickBy(payload, v => v !== undefined)
    }).unwrap()
      .catch((error) => {
        showToast({
          type: 'error',
          content: _.map(error.data.errors, 'message').join()
        })
      })
  }


  const anchorItems = [{
    title: serversTitle,
    content: (
      <>
        <StepsForm.SectionTitle id='aaa-servers'>
          { serversTitle }
        </StepsForm.SectionTitle>
        <AAAServers />
      </>
    )
  }, {
    title: settingsTitle,
    content: (
      <>
        <StepsForm.SectionTitle id='aaa-settings'>
          { settingsTitle }
        </StepsForm.SectionTitle>
        <StepsForm.StepForm name='aaa-settings' layout='horizontal' labelCol={{ span: 4 }}>
          <AAASettings />
        </StepsForm.StepForm>
      </>
    )
  }]
  return (
    <StepsForm
      formRef={formRef}
      onFinish={() => handleUpdate()}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
      })}
      buttonLabel={{ submit: $t({ defaultMessage: 'Save AAA' }) }}
    >
      <AnchorLayout items={anchorItems} offsetTop={275} />
    </StepsForm>
  )
}