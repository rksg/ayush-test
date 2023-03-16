import { DetailLevel, UserProfile } from '@acx-ui/user'

/* eslint-disable max-len */
export const events = [{
  severity: 'Info',
  adminName: 'FisrtName 12 LastName 12',
  raw_event: '{"stream":"stdout","docker":{"container_id":"2ed4013eaa21517aa615ccfef560f4979e594537a8fbfacf997e894cd9a95fb2"},"kubernetes":{"container_name":"login","namespace_name":"alto","pod_name":"login-64c79b44cb-sklhr","container_image":"sha256:f85e0516b5c169050b1bdffbcff4cf95d153ec8680c810b1d665d4514487167e","container_image_id":"gcr.io/kumo-scratch/services/login@sha256:22942642e04ac9f2a2aeaae828e14eb4c69f619ba5b89062675f41832bbf618a","pod_id":"2fb67f34-52c5-4051-b67d-8379067fa820","labels":{"app":"login","bom":"acx-service-5409-C","build":"3659","build_commit_sha":"6f5e0a979372d6627fe683b8302f7f194ef672b9","deployedby":"shabarish.vaidyanath","deployeddatetime":"2022-12-06-06-37-18","deployedts":"1670308638","lastdeployed":"0","pod-template-hash":"64c79b44cb","primary_protocol":"http","project":"acx","pver_route":"acx","version":"0.0.1","security_istio_io/tlsMode":"istio","service_istio_io/canonical-name":"login","service_istio_io/canonical-revision":"0.0.1","topology_istio_io/network":"alto-dev-200221-alto-devolve"},"host":"gke-devolve-cluster-core-2-302d2f84-w5ok","master_url":"https://10.137.32.1:443/api","namespace_id":"fe9f5068-055c-40cf-b6dc-6ddadf3866ce","namespace_labels":{"argocd_argoproj_io/instance":"argocd-core","istio_io/rev":"asm-1137-0","kubernetes_io/metadata_name":"alto"}},"thread":"http-nio-8080-exec-1","serviceName":"login","servicePver":"servicePver_IS_UNDEFINED","imageName":"gcr.io/kumo-scratch/services/login","imageTag":"master--3659","eventId":"login-001","tenantId":"662b4f2c76a0428a9e7faaa64534d67a","eventDescription":"Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller","adminName":"FisrtName 12 LastName 12"}',
  entity_type: 'ADMIN',
  event_datetime: '2022-12-08T14:50:20Z',
  id: '2e0d0ce655904d3b8e1404064b1175d9',
  entity_id: '662b4f2c76a0428a9e7faaa64534d67a',
  message: '{ "message_template": "Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller." }'
}]

export const eventsMeta = [{
  id: '2e0d0ce655904d3b8e1404064b1175d9',
  isApExists: false,
  isSwitchExists: false
}]

export const fakeUserProfile = {
  region: '[NA]',
  allowedRegions: [
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://devalto.ruckuswireless.com',
      current: true
    }
  ],
  externalId: '0032h00000LUqcoAAD',
  pver: 'acx-hybrid',
  companyName: 'Dog Company 1551',
  firstName: 'FisrtName 1551',
  lastName: 'LastName 1551',
  username: 'dog1551@email.com',
  role: 'PRIME_ADMIN',
  roles: ['PRIME_ADMIN'],
  detailLevel: DetailLevel.DEBUGGING,
  dateFormat: 'mm/dd/yyyy',
  email: 'dog1551@email.com',
  var: false,
  tenantId: '8c36a0a9ab9d4806b060e112205add6f',
  varTenantId: '8c36a0a9ab9d4806b060e112205add6f',
  adminId: '4159559db15c4027903d9c3d4bdb8a7e',
  support: false,
  dogfood: false
} as UserProfile
