import { EdgeTnmServiceData } from '../../../../types/services/edgeTnmService'

export const mockTnmServiceDataList = [{
  id: 'mocked-tnm-service-1',
  name: 'Mocked_TNMService_1',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861567',
  version: '7.0.4',
  status: 'UP'
}, {
  id: 'mocked-tnm-service-2',
  name: 'Mocked_TNMService_2',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861567',
  version: '7.0.6',
  status: 'UP'
}] as EdgeTnmServiceData[]