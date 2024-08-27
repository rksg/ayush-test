import moment from 'moment-timezone'

import { intentAIApi, intentAIUrl, store } from '@acx-ui/store'
import { mockGraphqlMutation }             from '@acx-ui/test-utils'

import { useIntentContext } from './IntentContext'

const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigateToPath: () => mockNavigate
}))
jest.mock('./IntentContext')
jest.mock('./common/ScheduleTiming', () => ({
  ...jest.requireActual('../../common/ScheduleTiming'),
  validateScheduleTiming: jest.fn().mockResolvedValue(true)
}))

describe('createUseIntentTransition', () => {
  beforeEach(() => {
    store.dispatch(intentAIApi.util.resetApiState())

    moment.tz.setDefault('Asia/Singapore')
    const now = +new Date('2024-08-08T12:00:00.000Z')
    jest.spyOn(Date, 'now').mockReturnValue(now)

    // may need to move into individual test
    mockGraphqlMutation(intentAIUrl, 'IntentTransition', {
      data: { transition: { success: true, errorMsg: '' , errorCode: '' } }
    })

    jest.mocked(useIntentContext)
    // .mockReturnValue({ intent, kpis })
  })

  describe('initialValues', () => {
    it.todo('handle new intent')
    it.todo('handle existing intent with scheduledAt')
  })

  describe('submit', () => {
    it.todo('handle scheduledAt validation')
    // refer to libs/analytics/components/src/IntentAI/AIDrivenRRM/IntentAIForm/index.spec.tsx
    // on showToast test
    it.todo('handle submit success')
    it.todo('handle submit error')
  })
})
