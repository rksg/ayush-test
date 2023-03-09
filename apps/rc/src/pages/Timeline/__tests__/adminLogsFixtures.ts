/* eslint-disable max-len */
export const events = {
  data: [
    {
      severity: 'Info',
      adminName: 'FisrtName 12 LastName 12',
      raw_event: '{"stream":"stdout","docker":{"container_id":"2ed4013eaa21517aa615ccfef560f4979e594537a8fbfacf997e894cd9a95fb2"},"kubernetes":{"container_name":"login","namespace_name":"alto","pod_name":"login-64c79b44cb-sklhr","container_image":"sha256:f85e0516b5c169050b1bdffbcff4cf95d153ec8680c810b1d665d4514487167e","container_image_id":"gcr.io/kumo-scratch/services/login@sha256:22942642e04ac9f2a2aeaae828e14eb4c69f619ba5b89062675f41832bbf618a","pod_id":"2fb67f34-52c5-4051-b67d-8379067fa820","labels":{"app":"login","bom":"acx-service-5409-C","build":"3659","build_commit_sha":"6f5e0a979372d6627fe683b8302f7f194ef672b9","deployedby":"shabarish.vaidyanath","deployeddatetime":"2022-12-06-06-37-18","deployedts":"1670308638","lastdeployed":"0","pod-template-hash":"64c79b44cb","primary_protocol":"http","project":"acx","pver_route":"acx","version":"0.0.1","security_istio_io/tlsMode":"istio","service_istio_io/canonical-name":"login","service_istio_io/canonical-revision":"0.0.1","topology_istio_io/network":"alto-dev-200221-alto-devolve"},"host":"gke-devolve-cluster-core-2-302d2f84-w5ok","master_url":"https://10.137.32.1:443/api","namespace_id":"fe9f5068-055c-40cf-b6dc-6ddadf3866ce","namespace_labels":{"argocd_argoproj_io/instance":"argocd-core","istio_io/rev":"asm-1137-0","kubernetes_io/metadata_name":"alto"}},"thread":"http-nio-8080-exec-1","serviceName":"login","servicePver":"servicePver_IS_UNDEFINED","imageName":"gcr.io/kumo-scratch/services/login","imageTag":"master--3659","eventId":"login-001","tenantId":"662b4f2c76a0428a9e7faaa64534d67a","eventDescription":"Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller","adminName":"FisrtName 12 LastName 12"}',
      entity_type: 'ADMIN',
      event_datetime: '2022-12-08T14:50:20Z',
      id: '2e0d0ce655904d3b8e1404064b1175d9',
      entity_id: '662b4f2c76a0428a9e7faaa64534d67a',
      message: '{ "message_template": "Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller." }'
    },
    {
      severity: 'Info',
      raw_event: '{"stream":"stdout","docker":{"container_id":"7ab2e6ff26542aa3b950e8883c9cb8f9a328d1841a993939a7286f8c2b97b3ff"},"kubernetes":{"container_name":"nuvo","namespace_name":"alto","pod_name":"nuvo-cd476ddb7-mw8ts","container_image":"sha256:14869d30ab4117d4d7c6d7a6a048a978e784d03436f84b201a58d8ff7eccc8d0","container_image_id":"gcr.io/kumo-scratch/services/nuvo@sha256:df0bbc42dc3d4cfb0e89d4a0d6eaba257704328a9ac7b10d41912e4004bb13b2","pod_id":"3fecaa23-c24d-4532-a670-88f977113e50","labels":{"agent-inject":"true","app":"nuvo","bom":"acx-service-7157-C","build":"557","build_commit_sha":"45762a53ffd2075052f00ee0fedaf1aed797a499","deployedby":"jason.chuang","deployeddatetime":"2023-02-14-02-59-06","deployedts":"1676343546","lastdeployed":"0","pod-template-hash":"cd476ddb7","primary_protocol":"http","project":"acx","pver_route":"acx","version":"0.0.1","security_istio_io/tlsMode":"istio","service_istio_io/canonical-name":"nuvo","service_istio_io/canonical-revision":"0.0.1","topology_istio_io/network":"alto-dev-200221-alto-devolve"},"host":"gke-devolve-cluster-core-2-8a424766-7thj","master_url":"https://10.137.32.1:443/api","namespace_id":"fe9f5068-055c-40cf-b6dc-6ddadf3866ce","namespace_labels":{"argocd_argoproj_io/instance":"argocd-core","istio_io/rev":"asm-1154-2","kubernetes_io/metadata_name":"alto"}},"thread":"org.springframework.amqp.rabbit.RabbitListenerEndpointContainer#1-2","serviceName":"nuvo","servicePver":"servicePver_IS_UNDEFINED","imageName":"gcr.io/kumo-scratch/services/nuvo","imageTag":"master--557","eventId":"nuvo-001","tenantId":"f91b36cbfb9941e8b45b337a37f330c0","notificationId":"93fa8093-1b55-4c14-ac59-507f2644a1ff","protocol":"EMAIL","to":"mahesh.manyam@ruckuswireless.com","eventTime":"2023-03-07T06:52:21.241"}',
      entity_type: 'Notification',
      event_datetime: '2023-03-07T06:52:21Z',
      id: 'e07ee7708e2043c0a83e3292f1386809',
      entity_id: 'Ruckus Cloud',
      message: '{ "message_template": "An EMAIL notification was sent to mahesh.manyam@ruckuswireless.com successfully." }'
    }
  ],
  subsequentQueries: [
    {
      fields: [
        'apName',
        'switchName',
        'networkName',
        'networkId',
        'administratorEmail',
        'venueName',
        'apGroupId',
        'apGroupName',
        'floorPlanName',
        'recipientName'
      ],
      url: '/api/eventalarmapi/662b4f2c76a0428a9e7faaa64534d67a/event/meta'
    }
  ],
  totalCount: 2,
  fields: [
    'event_datetime',
    'severity',
    'entity_type',
    'entity_id',
    'message',
    'apMac',
    'clientMac',
    'serialNumber',
    'ssid',
    'radio',
    'raw_event',
    'product',
    'sourceType',
    'adminName',
    'clientName',
    'userName',
    'hostname',
    'adminEmail',
    'venueId',
    'transactionId'
  ]
}

export const eventsMeta = {
  data: [
    {
      id: '2e0d0ce655904d3b8e1404064b1175d9',
      isApExists: false,
      isSwitchExists: false
    }
  ],
  fields: [
    'apName',
    'switchName',
    'networkName',
    'networkId',
    'administratorEmail',
    'venueName',
    'apGroupId',
    'floorPlanName',
    'recipientName'
  ]
}
