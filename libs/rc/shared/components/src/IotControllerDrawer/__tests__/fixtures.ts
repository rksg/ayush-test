import { IotControllerStatus } from '@acx-ui/rc/utils'

export const iotControllerList = {
  requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f',
  response: {
    data: [{
      id: 'bbc41563473348d29a36b76e95c50381',
      name: 'ruckusdemos',
      inboundAddress: '192.168.1.1',
      serialNumber: 'rewqfdsafasd',
      publicAddress: 'ruckusdemos.cloud',
      publicPort: 443,
      apiKey: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77'
    }, {
      id: 'bbc41563473348d29a36b76e95c50382',
      name: 'iotController1',
      inboundAddress: '192.168.2.21',
      serialNumber: 'jfsdjoiasdfjo',
      publicAddress: 'iotController1.cloud',
      publicPort: 443,
      apiKey: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77'
    }] as IotControllerStatus[]
  }
}

