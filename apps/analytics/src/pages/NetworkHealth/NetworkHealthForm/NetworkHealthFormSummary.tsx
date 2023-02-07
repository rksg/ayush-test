import { useIntl } from 'react-intl'

import {
  StepsFormNew
} from '@acx-ui/components'

import * as contents from '../contents'

import * as FormItems from './FormItems'

export function NetworkHealthFormSummary () {
  const { $t } = useIntl()

  return <>
    <StepsFormNew.Title children={$t(contents.steps.summary)} />

    <FormItems.TestName.FieldSummary />
    <FormItems.ClientType.FieldSummary />
    <FormItems.TestType.FieldSummary />
    <FormItems.WlanName.FieldSummary />
    <FormItems.AuthenticationMethod.FieldSummary />
    <FormItems.Username.FieldSummary />
    <FormItems.Password.FieldSummary />
    <FormItems.RadioBand.FieldSummary />
    <FormItems.DnsServer.FieldSummary />
    <FormItems.PingAddress.FieldSummary />
    <FormItems.TracerouteAddress.FieldSummary />
    <FormItems.SpeedTest.FieldSummary />

    <FormItems.APsSelection.FieldSummary />
  </>
}

