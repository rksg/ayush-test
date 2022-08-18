import { useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import { prepareAntdValidateMessages } from './validationMessages'

describe('prepareAntdValidateMessages', () => {
  it('returns validation messages for antd', async () => {
    expect(renderHook(() => prepareAntdValidateMessages(useIntl())))
      .toMatchSnapshot()
  })
})
