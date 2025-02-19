import { DataSubscription } from '../services'
import { Frequency }        from '../utils'

export const mockedUserId = 'userId-fake'
export const mockedSubscriptions = Array(10).fill(null).map((_, index) => ({
  id: `id-${index}`,
  name: `dataSubscription-${index}`,
  userId: mockedUserId,
  userName: 'userName-fake',
  columns: [`column-${index}`],
  status: Boolean(index % 2),
  frequency: Frequency.Daily,
  updatedAt: new Date().toISOString()
})) as DataSubscription[]