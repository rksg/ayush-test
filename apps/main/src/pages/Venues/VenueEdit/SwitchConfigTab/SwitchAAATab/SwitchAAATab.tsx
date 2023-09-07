import { useContext, useRef, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Alert, AnchorLayout, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import { useUpdateAAASettingMutation, useVenueSwitchSettingQuery }       from '@acx-ui/rc/services'
import { redirectPreviousPage, VenueMessages }                           from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                         from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../index'

import { AAAServers }  from './AAAServers'
import { AAASettings } from './AAASettings'

export function SwitchAAATab () {
  const { tenantId, venueId } = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/venues/')
  const [updateAAASettingMutation] = useUpdateAAASettingMutation()
  const [aaaSettingId, setAAASettingId] = useState<string>('')
  const { previousPath } = useContext(VenueEditContext)
  const { data: venueSwitchSetting } = useVenueSwitchSettingQuery({ params: { tenantId, venueId } })
  const cliApplied = !!venueSwitchSetting?.cliApplied

  const serversTitle = $t({ defaultMessage: 'Servers & Users' })
  const settingsTitle = $t({ defaultMessage: 'Settings' })

  const formRef = useRef<StepsFormLegacyInstance>()

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
      params: { tenantId, venueId, aaaSettingId },
      payload: _.pickBy(payload, v => v !== undefined)
    }).unwrap()
      .catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  const anchorItems = [{
    title: serversTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='aaa-servers'>
          { serversTitle }
        </StepsFormLegacy.SectionTitle>
        <AAAServers cliApplied={cliApplied} />
      </>
    )
  }, {
    title: settingsTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='aaa-settings'>
          { settingsTitle }
        </StepsFormLegacy.SectionTitle>
        <StepsFormLegacy.StepForm
          name='aaa-settings'
          layout='horizontal'
          labelCol={{ flex: '150px' }}>
          <>
            { cliApplied
              && <Alert type='info' message={$t(VenueMessages.CLI_APPLIED)} />}
            <AAASettings
              setAAASettingId={setAAASettingId}
              cliApplied={cliApplied}
            />
          </>
        </StepsFormLegacy.StepForm>
      </>
    )
  }]
  return (
    <StepsFormLegacy
      formRef={formRef}
      onFinish={() => cliApplied ? Promise.resolve() : handleUpdate()}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save AAA' }) }}
    >
      <AnchorLayout items={anchorItems} offsetTop={113} />
    </StepsFormLegacy>
  )
}
