import { Form } from 'antd'

import {
  DPSKSaveData,
  PassphraseFormatEnum,
  PassphraseExpirationEnum
} from '@acx-ui/rc/utils'
import { render } from '@acx-ui/test-utils'

import DPSKSummary from './DPSKSummary'

describe('DPSKSummary', () => {
  const mockedSummary: DPSKSaveData = {
    name: 'DPSK 1',
    passphraseLength: 18,
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    expiration: PassphraseExpirationEnum.ONE_DAY
  }

  it('should render the summary', async () => {
    const { asFragment } = render(
      <Form><DPSKSummary summaryData={mockedSummary} /></Form>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
