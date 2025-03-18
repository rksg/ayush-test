import { AlgorithmType, CertificateStatusType, ExtendedKeyUsages, KeyUsageType, Persona, PersonaGroup, ServerCertificate, UsageType } from '@acx-ui/rc/utils'

/* eslint-disable max-len */
export const certificateAuthorityList =
{
  fields: null,
  totalCount: 3,
  totalPages: 1,
  page: 1,
  data: [
    {
      id: '5eb07265d99242d78004cff1a9a53cf0',
      name: 'onboard2',
      commonName: 'testcommaon',
      organization: 'test',
      organizationUnit: 'test',
      startDate: '2022-11-30T20:00:00Z',
      expireDate: '2033-12-31T20:00:00Z',
      keyLength: 2048,
      algorithm: 'SHA_384',
      title: 'test',
      locality: 'test',
      state: 'test',
      country: 'test',
      publicKeyBase64: '-----BEGIN CERTIFICATE-----\nMIID/TCCAuWgAwIBAgIUeFArqCw+FD3kwcWnYHJmI1BY3MkwDQYJKoZIhvcNAQEM\nBQAwcDEUMBIGA1UEAwwLdGVzdGNvbW1hb24xDTALBgNVBAoMBHRlc3QxDTALBgNV\nBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgMBHRlc3QxDTALBgNVBAYT\nBHRlc3QxDTALBgNVBAwMBHRlc3QwHhcNMjIxMTMwMjAwMDAwWhcNMzMxMjMxMjAw\nMDAwWjBwMRQwEgYDVQQDDAt0ZXN0Y29tbWFvbjENMAsGA1UECgwEdGVzdDENMAsG\nA1UECwwEdGVzdDENMAsGA1UEBwwEdGVzdDENMAsGA1UECAwEdGVzdDENMAsGA1UE\nBhMEdGVzdDENMAsGA1UEDAwEdGVzdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC\nAQoCggEBANaMtBU7H9VAKiad1PK2qPUcNfjqDYmk2SYXwW1dw+WkFrcBMWo0rDiL\n4KKdq+bGyx7msF4RGB0KYR31FpFlrancbbADIEBm57ohPYB+dFYQJpXr8Y9AIeWo\npsDwC4fmnsvt3gUcj31BtwKWR0gEBE75eY8DHfmFbIEaNw/zsr7CpGv3hwBXkeOa\nFLKEzP55PE5MBv9Z1VsZQ5lLsQQZKkheilJSTrvQUgyRnJeTjGNUKVEm2oQGkwcS\nPu4n+1t0b2/dLCSPCOJi9mMSpY4gCcLJaeNaxWpyAfGsZg2/rgUEigcGhZUF7o1q\nxQm7wmhYkTYoZTl2rd2HFWAun2rMhZ0CAwEAAaOBjjCBizAnBgNVHSUEIDAeBggr\nBgEFBQcDAgYIKwYBBQUHAwEGCCsGAQUFBwMJMCAGCCsGAQUFBwEBBBQwEjAQBggr\nBgEFBQcwAYYEdGVzdDAdBgNVHQ4EFgQU7cxqUQojAP8lAkza+gfD2xuUJy0wDgYD\nVR0PAQH/BAQDAgG2MA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQEMBQADggEB\nANLv4q01jtkG/aacMuz3HQsBjsS+forrVPsOZKZNTu8vCzJ9eCXipkyLtmBHil8K\no+Q9q/WdGsh7Soi55kk5dR/T/mYP9GNbtWBUBARt9hLEcd7HdADPM/dpxsFfRTpx\nnW+rUxCWxGSPB7pjMEBZPmSJRztycSf/BgzqJGId/snMH2HCQzkD6a9UgbsKLbu7\n52CilZSCGOslAd7S2DK6tge1eGLmxfmQhf1p+wq+GIpc7vfHg0GYi5PiZn+tL8cj\n9b3CTel57G98beKh/SqyDkoEhqDcdRykaN6A9Ux4/FWvBUDeGYd20he28oUyrkBN\n5KhzTwWKENOyVvzYK1BVDQM=\n-----END CERTIFICATE-----\n',
      privateKeyBase64: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA1oy0FTsf1UAqJp3U8rao9Rw1+OoNiaTZJhfBbV3D5aQWtwEx\najSsOIvgop2r5sbLHuawXhEYHQphHfUWkWWtqdxtsAMgQGbnuiE9gH50VhAmlevx\nj0Ah5aimwPALh+aey+3eBRyPfUG3ApZHSAQETvl5jwMd+YVsgRo3D/OyvsKka/eH\nAFeR45oUsoTM/nk8TkwG/1nVWxlDmUuxBBkqSF6KUlJOu9BSDJGcl5OMY1QpUSba\nhAaTBxI+7if7W3Rvb90sJI8I4mL2YxKljiAJwslp41rFanIB8axmDb+uBQSKBwaF\nlQXujWrFCbvCaFiRNihlOXat3YcVYC6fasyFnQIDAQABAoIBAACApN1V3Z24wECF\n5x1Iaz3juoaiObTkU3Pg412XtiFAEKOOF6kJhYu+XCDVYLUyKwCgBrK5tIZA43hX\n/h0KEW2P7BvY7gbolstbT5MQ+MHI2OZJ/q9YtZudmQJjrYs8cYvFu1rktbtT35Nc\neb9D7ySmNfAtUDEo7FejEZTye60xs2rVVTTehXXPq2RiZ13suC5PfniLFyv6JRFw\n38uyeRt8FFnIMDNoZ1GilT3IegpD/vnHlf5VUKr/JruZ//suthpI7u79K/z2XNam\niXdWDhA5y1lbOdFi8kaH3C14ml6BZZ7sC169TWr1nH6kVesZW7e2fRxrcvo3dXHU\nn4tk6DECgYEA69SCLxfjB5O9UpdZjodQSn6i14dx0wZRIG1ra8Gb5SGpVpC/CsCF\nGkqQsm71lNz6efg/9rAzXkB9bt6j9jO7KLOeq+k1l9eDUyC9OJJjerwznYPyEFiJ\nvbYrbFHa6f3Ym8fErZK+V1wMuaSTtD5VXtIJp482pSq0+tBWsiuN6ukCgYEA6OZC\naRUaxCDy7wuqaHIDPnpQU0NFC2QY8qnjNiGFGdwuY4SjI0zW7k/tG5SoRKvQhtyN\nNa6eq4AA1XndG12ax/4PcISOA5S2Rq1HDiIPR62ZAlLGpQn2LBaWTxImExC7+w6d\n6rbxcGXaXlxETntFYPg0tyWQQfWjI0CDFGkE7JUCgYEAk1vziOe9JgPsHgqSnFvz\nEMl2iYSJ3FmrIb8di3SsLA3PmVbS+S35PcdwCP8Kl11JaiN0HHpXbsKPXlLiUzpZ\n7YHnWPZdVacF2VCwzAO1A4FMI1XKUOpyD0ggdAvl5aaHzjeSrv7tzvqmvO2Ymd0F\nTT2jaL81XxmDguHh+mz6vdkCgYEAu5YK03yuLF6ljSiGPs3mEwKNhCLgj8Y12e5A\nFa9191hC/OEuTRZs31H9FoPr7DO/J4CpNB3LqzLUeR1Im+wO6RqW8PezMusqzU5v\nttB0IjWO0jI90VxurSAcPN/PTvfhkNs7Env7h55h/jKuyc+8F9iTDRjyUk448gHa\nEixsTOkCgYBcLWhH/jRTqOdsqiV567nM4cXjfO5/cvharbERwe4/MlrmjWlep0Xv\nDMBds7RnIqDRKQBqvWBsEW36L1lUm0FF7tbZGM/GBewtWy25Nx5xUJYp28W8MX2o\nstnUrPrMMa4qeVQWDcwHcqyMFF4QzuOkRqaN+RhXbjNl8Z74pZTBUw==\n-----END RSA PRIVATE KEY-----\n',
      publicKeyShaThumbprint: '31D00BD232304F7B5D234FA91FA808426DC067E7',
      serialNumber: '000000000078502ba82c3e143de4c1c5a7607266235058dcc9',
      ocspUrl: 'test',
      enabled: true,
      usages: [
        'CLIENT_AUTH'
      ],
      templateCount: 3,
      templateNames: [
        'testCertificateTemplate1',
        'testCertificateTemplate2',
        'testCertificateTemplate3'
      ],
      ocspName: '94B35FD003060653DB2DBEF969024280A2ACA389',
      ocspHash: 'EDCC6A510A2300FF25024CDAFA07C3DB1B94272D',
      keyUsages: [
        'DIGITAL_SIGNATURE',
        'KEY_ENCIPHERMENT',
        'DATA_ENCIPHERMENT',
        'KEY_CERT_SIGN',
        'CRL_SIGN'
      ]
    },
    {
      id: '109df36cd9464586b7d37271a1bc3cc5',
      name: 'onboard1',
      commonName: 'testcommaon',
      organization: 'test',
      organizationUnit: 'test',
      startDate: '2022-11-30T20:00:00Z',
      expireDate: '2033-12-31T20:00:00Z',
      keyLength: 2048,
      algorithm: 'SHA_384',
      title: 'test',
      locality: 'test',
      state: 'test',
      country: 'test',
      publicKeyBase64: '-----BEGIN CERTIFICATE-----\nMIID/TCCAuWgAwIBAgIUMSbGK8ehqTuYPrjKfebx5bJkWiIwDQYJKoZIhvcNAQEM\nBQAwcDEUMBIGA1UEAwwLdGVzdGNvbW1hb24xDTALBgNVBAoMBHRlc3QxDTALBgNV\nBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgMBHRlc3QxDTALBgNVBAYT\nBHRlc3QxDTALBgNVBAwMBHRlc3QwHhcNMjIxMTMwMjAwMDAwWhcNMzMxMjMxMjAw\nMDAwWjBwMRQwEgYDVQQDDAt0ZXN0Y29tbWFvbjENMAsGA1UECgwEdGVzdDENMAsG\nA1UECwwEdGVzdDENMAsGA1UEBwwEdGVzdDENMAsGA1UECAwEdGVzdDENMAsGA1UE\nBhMEdGVzdDENMAsGA1UEDAwEdGVzdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC\nAQoCggEBAKuExVMAVpeq5IYBMv5Wj/+U2I+OidSySgDGmDytDPzJvpo0f71PKj8d\n7hjvdZ/BRpqKNR2VDzOSk2wZd57UBE/dA/7KKU4zCUfXffAcnp/6J9bUKBj4OA5C\nVwilSPITZmlBNDEyNvMJA8uCxKPnZpwDdrQ4MP8UKPUwrUbphtdCjRlucLuRojQy\nj6xmPysEGCokvvy8zstN1IyL835UzFU2x9WsLQSfNRtcpxE1sJ/RYxacoHMbcTmi\nzQ1bNTA5QRAgB+lR/FruGnt1i+ldZiMFd8ZF9WJc1Wq6yOB57w879HWgoEkVSAGB\nMSSyJQk69apg1i8j5ratyWCT4l2P2AcCAwEAAaOBjjCBizAnBgNVHSUEIDAeBggr\nBgEFBQcDAgYIKwYBBQUHAwEGCCsGAQUFBwMJMCAGCCsGAQUFBwEBBBQwEjAQBggr\nBgEFBQcwAYYEdGVzdDAdBgNVHQ4EFgQUvzMvff3uYzunHelHJb6IPAeKfbQwDgYD\nVR0PAQH/BAQDAgG2MA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQEMBQADggEB\nAIK3aFFaOco33D2Ofeav9lNXpvZMNpzIxLyjHNVZpwHXm3xOuB8MckncRKen9EDL\nVFsvCcq/oyLSl7WEI7Q3XSLwRZ7MrINYQDWCtErYgGkfjC4Z9NdJK/XFrEP9pQ3a\n1BfvQHhwZnwP8LtdOFilLxymqzWk4EKsV4cBjSkMwJAcN0C5L9+VSArHVpa2lU7H\nTgNG5nO63epAAJY7MLQCNfZKQubst3AZNeTJgVLLZhxD0kIC4Rf0uPZ2qc1jjNZi\nE4pC9Aa1KYLh/5K4dreoiv5Ggh595RKdJPxqKY6zHm0Wl04ggvz5pelySnkOOnfY\nukKLjs569pHeHEK5g3yKzos=\n-----END CERTIFICATE-----\n',
      privateKeyBase64: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAq4TFUwBWl6rkhgEy/laP/5TYj46J1LJKAMaYPK0M/Mm+mjR/\nvU8qPx3uGO91n8FGmoo1HZUPM5KTbBl3ntQET90D/sopTjMJR9d98Byen/on1tQo\nGPg4DkJXCKVI8hNmaUE0MTI28wkDy4LEo+dmnAN2tDgw/xQo9TCtRumG10KNGW5w\nu5GiNDKPrGY/KwQYKiS+/LzOy03UjIvzflTMVTbH1awtBJ81G1ynETWwn9FjFpyg\ncxtxOaLNDVs1MDlBECAH6VH8Wu4ae3WL6V1mIwV3xkX1YlzVarrI4HnvDzv0daCg\nSRVIAYExJLIlCTr1qmDWLyPmtq3JYJPiXY/YBwIDAQABAoIBABjbLWN5bZMeO27m\nFpdAQS8HSZkITZYq3kmdfitw4qxxqjMbv5VWNyeddUdc0H1923cC526pjuHo8H9e\nc3TrgdJ3E6CleHXyNHqaUpBs/VnuvT5HUaZItorud0Fz/o3CXPmM7vzgK5Ft8YRZ\nJ5kfLEIYyGeWqxcUO1lJHBtmNVnVeJRh3DCzrZsJ7m5yjZmsHl0r3/QMRBXKuJ4a\nDM2GCJKgCyz96XHf64Pz2X1FlN7r7Juug6XE+rIITTCue/26pKdQTvdpcwGjGqXI\nemIgWrQ9CBuZ4cy9NRXkpXHXEgGc+suST1poYyZubSCwOCjtTCMvvWtjiqde9Xy8\nnIues1UCgYEA6iQODFo38H8kvSKAAYO6VHeXh4aDd9XTqahPWRHteh4+6p6CjOvP\nunvNG7aBRyYW4A/GE2IyA94Wbu8HfEj1a4HV57lUQWsEj2GbjzaFIAw8fliPcIaU\nlbxZcmO94UmfuiSqWoY8vypthq4rE2hMQ1p3j3mryGIcnQ8L3F0Rj1MCgYEAu4gN\nBR8dAupJvjRtXL1G7uk/0ETMDJp78vBZJotTJKTYTknaaG2gVq7VhQsv6dwJeV/I\n1fhhPZ72JPm32nueZBCyPkaz2am01veklfjrhhp1PpOf65sNBx1RjAF1PC67qL9P\njDbWf3cCUa91pZrNKdeW/q7dzZO+zCBPUS9mof0CgYBjzjquyUZPHeNrO+mUu7IR\nj2joPE6OJnezOiuYrCuugnYPTMIZj+tccqlbxtAUpAfcOt0UJidrvp+RahKmx/LV\ngOLNhBKGUDgBZnoI8hSNNKoUsWtza+qqaT83o4ytG9UaY8a6D76VPmCxqEx0WWEo\n1MdiQVsYb7oCuQc1R/bUQQKBgQCM31vggAncGcGBp4KLywfRCtjMDBI4WYhI6/Ic\neUbg3RA8Z1AxaECtPTLaeZfplkhrq9+DlMz/bD09c3WAI6LNSpmLHLOYC9r0LR2v\nJ0lN+OwgMOdOJrB3qreKc8HsjrKbxfLswnkJUY4lbKf02j/KcdBUy2mFN7p5PsA2\nnWP8xQKBgCvnyakwZw5pqdH9Wyd6iOz64hyVKwxuSmD1vtlD7PbiRJHBkpGkkj05\nwAQW4vOEo+E7dQU0z0NTMUS0HV/Vgw4cV1QEVy6d8DIQLuT1X3ZmYW8qcA3DsNiz\nR5k3DkN2eXCxIU8U8Lp2jTd5NG0IOCSUVnFJ1LN/CyhhyXHvQhYF\n-----END RSA PRIVATE KEY-----\n',
      publicKeyShaThumbprint: 'F995261F3AC961693F8E2E6D3509FB18A119B2A9',
      serialNumber: '00000000003126c62bc7a1a93b983eb8ca7de6f1e5b2645a22',
      ocspUrl: 'test',
      enabled: true,
      usages: [
        'CLIENT_AUTH'
      ],
      templateCount: 2,
      templateNames: [
        'test3',
        'test2'
      ],
      ocspName: '94B35FD003060653DB2DBEF969024280A2ACA389',
      ocspHash: 'BF332F7DFDEE633BA71DE94725BE883C078A7DB4',
      keyUsages: [
        'DIGITAL_SIGNATURE',
        'KEY_ENCIPHERMENT',
        'DATA_ENCIPHERMENT',
        'KEY_CERT_SIGN',
        'CRL_SIGN'
      ]
    },
    {
      id: 'ca7b5078b323448f9d6e5179c0178f65',
      name: 'onboard3',
      commonName: 'testcommaon123',
      organization: 'test',
      organizationUnit: 'test',
      startDate: '2022-11-30T20:00:00Z',
      expireDate: '2033-12-31T20:00:00Z',
      keyLength: 2048,
      algorithm: 'SHA_384',
      title: 'test',
      locality: 'test',
      state: 'test',
      country: 'test',
      publicKeyBase64: '-----BEGIN CERTIFICATE-----\nMIIEBDCCAuygAwIBAgIVANwh12ESMOCtmUF3+bIqqPqt58hbMA0GCSqGSIb3DQEB\nDAUAMHMxFzAVBgNVBAMMDnRlc3Rjb21tYW9uMTIzMQ0wCwYDVQQKDAR0ZXN0MQ0w\nCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0wCwYD\nVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTIyMTEzMDIwMDAwMFoXDTMzMTIz\nMTIwMDAwMFowczEXMBUGA1UEAwwOdGVzdGNvbW1hb24xMjMxDTALBgNVBAoMBHRl\nc3QxDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgMBHRlc3Qx\nDTALBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3QwggEiMA0GCSqGSIb3DQEBAQUA\nA4IBDwAwggEKAoIBAQDAo/0nwB8IYPkWWrUqzQHhirE6ujnZTW1bohpoFdhCUYNb\nKN+/QlhIwuSISImgqXwqm6j9NTGwaGXD9GcDavWyENAk9lqjG6F/0DKoFDJbK2AU\nFQzV7x6wo5YCusCtgX7urUjQlV50YtgkQvyp5fa+sv5rILKv+yRQRE9+iJm2zAxh\nfx8Q07ggURQGxsGZOyLGmpmQAUWWjgAj1+ksg4jrzCour0bAdmYfgrREZz/BxiNP\noV4evwfhvD7Xig5Bh0bwHSwDbZ7VgHyNFsE28RqZA2Ba551C8mh+MjO9VswWPsZS\nYdbi5aiDhYYvHiDSJIuWzxjHdy9pE8gkC7oHKTPrAgMBAAGjgY4wgYswJwYDVR0l\nBCAwHgYIKwYBBQUHAwIGCCsGAQUFBwMBBggrBgEFBQcDCTAgBggrBgEFBQcBAQQU\nMBIwEAYIKwYBBQUHMAGGBHRlc3QwHQYDVR0OBBYEFK0azw/8nw447dm0xzYh9UuD\n2fQHMA4GA1UdDwEB/wQEAwIBtjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEB\nDAUAA4IBAQAOX3MdHk1ldttzUJQwVMDjTLe75ZL/5sH3qYcQfZqCIiB7d8OQdUHN\naNyJ59sH2d9i51oXmSZwhor+tUEGpdsZ3ZNbjLlpFtI3fWtt72sK/+94tijpxjP6\nWZf1svblcJGQAiRL/vTR8XtXmOjPyo/IuWMhqY67b9zUfJdeOTz9zjP67ORKnbhQ\noQylTf79MnEtpg7S7ER+ChEegnnTgNnPuzI4iDHX+UD6yjHOLGISE66IUzf3yZp7\n9ryGQ5jwmR4hx3tRrtL6MVUdtWqnQgwrEKyENlW+kVKX9EpxJnmbGrj3pU8XUokT\nvGN81aLzHWDGRGsM3jorSHj0y/6bGcTH\n-----END CERTIFICATE-----\n',
      privateKeyBase64: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAwKP9J8AfCGD5Flq1Ks0B4YqxOro52U1tW6IaaBXYQlGDWyjf\nv0JYSMLkiEiJoKl8Kpuo/TUxsGhlw/RnA2r1shDQJPZaoxuhf9AyqBQyWytgFBUM\n1e8esKOWArrArYF+7q1I0JVedGLYJEL8qeX2vrL+ayCyr/skUERPfoiZtswMYX8f\nENO4IFEUBsbBmTsixpqZkAFFlo4AI9fpLIOI68wqLq9GwHZmH4K0RGc/wcYjT6Fe\nHr8H4bw+14oOQYdG8B0sA22e1YB8jRbBNvEamQNgWuedQvJofjIzvVbMFj7GUmHW\n4uWog4WGLx4g0iSLls8Yx3cvaRPIJAu6Bykz6wIDAQABAoIBACRRZmNNnawjOCKm\nRDyG/OFMGACl5k0ZA1KAu7C+2ZAbNQQFLzWsKN/C2nn1Dvlaqp2Pziq6kh0beYAZ\nfihPTHXfJJarWUgh5+8kTcCRWjME+O6gT1Sv6Z3MoXXvRm8PmGIgCjfEyVNw5SXk\n+SSAxeWK8ls5BWcXFnAJiOEmmLA08SmYVpF4zaKL8YsJtYkfpe+OgSzj5EZnzhKW\nE3U9FZKIEOrrirsEg9V4isThvnOr3yPwWIOdlNKnuvqvEeiJtEJu584Sy9US9g7L\nVCJk46G04JPhGMOZVhNJhMYo+/U29DenY6AmbvERGzEtCR/anVEqV1KzRgc17eZz\nUnLU3ykCgYEA4umyJhhtC9NDYsDXolmXFjaJ7prWfp7+sx/MaM1fp873O0l7a+R5\nnSPpCZaxoMJ3l5y/LFe2DshNwwDC5gC4C56Dfs9xozjeNNInqgoZByRe5ozYRXX4\nUaK4na7LNEYTtlbGycQ6eKkab84fH1XvKGB4EdBmuPf6M1oS/S7ttqMCgYEA2VWf\nsm9Fh6wHtolMYQwBBC1uW0293JTpmNIGYgAr3uIEPKVF+JSKnP7dvFfw1J8EOotZ\n3GnzXSYkU2gX4Onjh9qS2DT0vkuNZw2GOFz8QHIyiIVUsC+kJCAof8JIILk+b8RV\nirXY8a8s+a0v+wM7kZuacuHAlY1vS6lyn1DwChkCgYEAlXsIDcqHg4O/331UUDIe\nstZo1RORe8Z32T54ZQ3uFtjjy12j/bZ8WwV+DgAEsfeJ2wm6cpaxa1mOyIhm3Cfb\nFmRtEYvMu47J6xgKYxzV0fumvNBJ5LBLTlQYtF+io6QKdlMCD4bCUhxsOv0ZSYZN\nz1aFoo6cLPvHCi8rVTimBmsCgYEAkM4+E1OUTitPEE42t8qZusDScL9Bq4EEi7AU\nVKOsl1qcXBP6pP/Dw4sFDoLBkclJtgA3JWbqobvSJEiM8GymD1SQ1sGh+FC6rFkU\nfuVlpULxbIj5vlJf2TocAdPe3v7OHQYBwOQc4htHqiu8dlDXFdNJexXzjTGpYA5M\nst3osbECgYATTE9ykREPwmnX5aOa1TDndLWY7U+Ei5a31TqEG3IkWi8an2q7MxML\n+o1V2RYGzC4/zGuMIQe+OO8P0IZdaVH0XIaLJHuTeD9RdzZRGr3To1OkMx3XUk9q\n35nNIAkjl3PwVRPSawdU6RXJlMx55qHb2G5NAS0vf4LpWQjqK6XKjA==\n-----END RSA PRIVATE KEY-----\n',
      publicKeyShaThumbprint: '3EA4A7BE640F6F369C390B187825E4CC863921D6',
      serialNumber: '0000000000dc21d7611230e0ad994177f9b22aa8faade7c85b',
      ocspUrl: 'test',
      enabled: true,
      usages: [
        'CLIENT_AUTH'
      ],
      templateCount: 0,
      templateNames: [],
      ocspName: '81FA62A4FF1CB50F10316E0E5C711C3FC1070C9F',
      ocspHash: 'AD1ACF0FFC9F0E38EDD9B4C73621F54B83D9F407',
      keyUsages: [
        'DIGITAL_SIGNATURE',
        'KEY_ENCIPHERMENT',
        'DATA_ENCIPHERMENT',
        'KEY_CERT_SIGN',
        'CRL_SIGN'
      ]
    }
  ]
}

export const certificateTemplateList = {
  fields: null,
  totalCount: 3,
  totalPages: 1,
  page: 1,
  data: [
    {
      id: '84d3b18d00964fe0b4740eedb6623930',
      description: 'test',
      name: 'certificateTemplate1',
      caType: 'ONBOARD',
      defaultAccess: true,
      policySetId: null,
      onboard: {
        commonNamePattern: 'test',
        emailPattern: null,
        notAfterType: 'SPECIFIED_DATE',
        notAfterValue: null,
        notBeforeType: 'SPECIFIED_DATE',
        notBeforeValue: null,
        notAfterDate: '2030-01-24T23:59:59Z',
        notBeforeDate: '2024-01-24T16:00:00Z',
        ocspMonitorCutoffDays: 10,
        ocspMonitorEnabled: true,
        organizationPattern: 'test',
        organizationUnitPattern: 'test',
        localityPattern: 'test',
        statePattern: 'test',
        countryPattern: 'test',
        sanDnsNamePattern: 'test',
        sanIpPattern: 'test',
        sanOtherNamePattern: 'test',
        subjectAlternativeNamePattern: 'test',
        sanRidPattern: 'test',
        sanUriPattern: 'test',
        titlePattern: 'test',
        keyUsageList: null,
        certificateType: 'CLIENT',
        certificateAuthorityId: '5eb07265d99242d78004cff1a9a53cf0',
        certificateAuthorityName: 'onboard2'
      },
      microsoftCa: null,
      custom: null,
      incommon: null,
      networkFx: null,
      chromebook: {
        apiKey: null,
        certRemovalType: 'NONE',
        enrollmentType: 'DEVICE',
        notifyAppId: null,
        accountCredential: null,
        enabled: true
      },
      enabled: true,
      keyLength: 4096,
      algorithm: 'SHA_512',
      certificateCount: 2,
      certificateNames: [
        'testCertificate1',
        'testCertificate2'
      ],
      variables: ['var1', 'var2'],
      identityGroupId: 'persona-group-id-1'
    },
    {
      id: 'e86204218568452db9e1cb935c38f644',
      description: 'asfasfasfasf',
      name: 'certificateTemplate2',
      caType: 'ONBOARD',
      defaultAccess: true,
      policySetId: null,
      onboard: {
        commonNamePattern: 'test1',
        emailPattern: null,
        notAfterType: 'DAYS',
        notAfterValue: 2,
        notBeforeType: 'DAYS',
        notBeforeValue: 1,
        notAfterDate: null,
        notBeforeDate: null,
        ocspMonitorCutoffDays: 0,
        ocspMonitorEnabled: false,
        organizationPattern: 'test',
        organizationUnitPattern: 'Test',
        localityPattern: 'test',
        statePattern: 'test',
        countryPattern: 'test',
        sanDnsNamePattern: null,
        sanIpPattern: null,
        sanOtherNamePattern: null,
        subjectAlternativeNamePattern: null,
        sanRidPattern: null,
        sanUriPattern: null,
        titlePattern: null,
        keyUsageList: null,
        certificateType: 'CLIENT',
        certificateAuthorityId: '109df36cd9464586b7d37271a1bc3cc5',
        certificateAuthorityName: 'subcaupdated1111'
      },
      microsoftCa: null,
      custom: null,
      incommon: null,
      networkFx: null,
      chromebook: {
        apiKey: null,
        certRemovalType: 'NONE',
        enrollmentType: 'DEVICE',
        notifyAppId: null,
        accountCredential: null,
        enabled: false
      },
      enabled: true,
      keyLength: 4096,
      algorithm: 'SHA_512',
      certificateCount: 27,
      certificateNames: [
        'testCertificate1',
        'testCertificate2',
        'testCertificate3',
        'testCertificate4',
        'testCertificate5',
        'testCertificate6',
        'testCertificate7',
        'testCertificate8',
        'testCertificate9',
        'testCertificate10',
        'testCertificate11',
        'testCertificate12',
        'testCertificate13',
        'testCertificate14',
        'testCertificate15',
        'testCertificate16',
        'testCertificate17',
        'testCertificate18',
        'testCertificate19',
        'testCertificate20',
        'testCertificate21',
        'testCertificate22',
        'testCertificate23',
        'testCertificate24',
        'testCertificate25',
        'testCertificate26',
        'testCertificate27'
      ],
      networkIds: [
        'testNetworkId1',
        'testNetworkId2'
      ],
      identityGroupId: 'persona-group-id-1'
    },
    {
      id: '6b360dfaf8ef4cdfb1a2c48a8b10e754',
      description: 'test',
      name: 'certificateTemplate3',
      caType: 'ONBOARD',
      defaultAccess: true,
      policySetId: null,
      onboard: {
        commonNamePattern: 'common_patern',
        emailPattern: 'santosh.poddar@commscope.com',
        notAfterType: 'SPECIFIED_DATE',
        notAfterValue: null,
        notBeforeType: 'SPECIFIED_DATE',
        notBeforeValue: null,
        notAfterDate: '2024-11-30T20:00:01Z',
        notBeforeDate: '2023-11-30T20:00:01Z',
        ocspMonitorCutoffDays: 0,
        ocspMonitorEnabled: false,
        organizationPattern: '',
        organizationUnitPattern: '',
        localityPattern: '',
        statePattern: '',
        countryPattern: '',
        sanDnsNamePattern: '',
        sanIpPattern: '',
        sanOtherNamePattern: '',
        subjectAlternativeNamePattern: '',
        sanRidPattern: '',
        sanUriPattern: '',
        titlePattern: '',
        keyUsageList: null,
        certificateType: 'CLIENT',
        certificateAuthorityId: 'ca7b5078b323448f9d6e5179c0178f65',
        certificateAuthorityName: 'subCa1'
      },
      microsoftCa: null,
      custom: null,
      incommon: null,
      networkFx: null,
      chromebook: {
        apiKey: null,
        certRemovalType: 'NONE',
        enrollmentType: 'DEVICE',
        notifyAppId: null,
        accountCredential: null,
        enabled: false
      },
      enabled: true,
      keyLength: 512,
      algorithm: 'SHA_512',
      certificateCount: 0,
      certificateNames: [],
      identityGroupId: 'persona-group-id-1'
    }
  ]
}

export const certificateTemplate = {
  id: '84d3b18d00964fe0b4740eedb6623930',
  description: 'test',
  name: 'certificateTemplate1',
  caType: 'ONBOARD',
  defaultAccess: true,
  policySetId: null,
  onboard: {
    commonNamePattern: 'test',
    emailPattern: null,
    notAfterType: 'SPECIFIED_DATE',
    notAfterValue: null,
    notBeforeType: 'SPECIFIED_DATE',
    notBeforeValue: null,
    notAfterDate: '2050-01-24T23:59:59Z',
    notBeforeDate: '2024-01-24T16:00:00Z',
    ocspMonitorCutoffDays: 10,
    ocspMonitorEnabled: true,
    organizationPattern: 'test',
    organizationUnitPattern: 'test',
    localityPattern: 'test',
    statePattern: 'test',
    countryPattern: 'test',
    sanDnsNamePattern: 'test',
    sanIpPattern: 'test',
    sanOtherNamePattern: 'test',
    subjectAlternativeNamePattern: 'test',
    sanRidPattern: 'test',
    sanUriPattern: 'test',
    titlePattern: 'test',
    keyUsageList: null,
    certificateType: 'CLIENT',
    certificateAuthorityId: '5eb07265d99242d78004cff1a9a53cf0',
    certificateAuthorityName: 'onboard2'
  },
  microsoftCa: null,
  custom: null,
  incommon: null,
  networkFx: null,
  chromebook: {
    apiKey: null,
    certRemovalType: 'NONE',
    enrollmentType: 'DEVICE',
    notifyAppId: null,
    accountCredential: null,
    enabled: true
  },
  enabled: true,
  keyLength: 4096,
  algorithm: 'SHA_512',
  certificateCount: 2,
  certificateNames: [
    'test',
    'test'
  ],
  identityGroupId: 'persona-group-id-1'
}

export const certificateList = {
  fields: null,
  totalCount: 2,
  totalPages: 1,
  page: 1,
  data: [
    {
      id: '7edd1265d63242a0b27b05b60d7c7ebb',
      commonName: 'certificate1',
      createDate: '2024-02-02T01:38:45Z',
      notBeforeDate: '2024-01-24T16:00:00Z',
      notAfterDate: '2030-01-24T23:59:59Z',
      email: '',
      revocationDate: null,
      revocationReason: null,
      serialNumber: '0000000000fdd91e84afdc5fa61f1b8cb3b6d1e83d0f33a124',
      shaThumbprint: '91FEC59DDBC8E0A0166FCDC5C56CCE83715DE3E2',
      publicKeyBase64: '-----BEGIN CERTIFICATE-----\nMIIFpzCCBI+gAwIBAgIVAP3ZHoSv3F+mHxuMs7bR6D0PM6EkMA0GCSqGSIb3DQEB\nDQUAMHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYDVQQKDAR0ZXN0\nMQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0w\nCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTI0MDEyNDE2MDAwMFoXDTMw\nMDEyNDIzNTk1OVowWjENMAsGA1UEAwwEdGVzdDENMAsGA1UECgwEdGVzdDENMAsG\nA1UECwwEdGVzdDENMAsGA1UEBwwEdGVzdDENMAsGA1UECAwEdGVzdDENMAsGA1UE\nBhMEdGVzdDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAKMUuLlBX9Rk\nHWxhEwKEIn/TBdRVXL4OzBbHqix/QnhmZDT0Ql+c2dP9SYO4njfyBAc85hG6aBfz\nBgEstiiDvfh0rv2oeT2kyAvViRW7sjPaFQ8lHo/jMrhL1Dn2A42FSxccz4j8FSSb\ndLx0h3VryHXIYT4JvjTPGnzF4ekfJIDb3zFCmrDXM2RBKkaMOTwJr3+MtdVu/E0k\nJ1HEiQlxLbvDPMwxDjGoLL9tlbZE08WbB56ho8UNgYoacUYlkYiCZH3uQ/bOiFsj\nNOJc9lPfO9Z4o/qOQAT7ggUe5fdn/8R2aZubMVHlTGhWKMyDEhWnImaAL/qk9F5r\nhVMUs7GblHOkP00buL2PcoGcQrumeQ+MAvEzhJL4EiFkkj5wovK9oeiycTfz3LQ1\n3bcSWqtg/ptAcDO/hhcsze8a9kDLQNWcPmOt5rrGdGns1dZE0WFmBRHILCiLCfXt\nf0/pBBnm+u6XBY4Q+EYATUW5efLl0GH4uaaXP0WvKw7fLiruUI+t+n+Lj+smXpK8\ngW2Lv/nrp1rEG//f8i914K2L+ecMdaK+gIV0OAvYDaS691S/m9oXYQ1kSGq2M3Q7\n4UeUwlwsdreYHXQcqSB4tsJH/wCu6DwRDaoY93zkuoqeEKiMsILjTFdbS2v4/7rO\nV/g7OtwNYKgVfvJUBz5Ive79Mh2QYqI3AgMBAAGjggFGMIIBQjAdBgNVHQ4EFgQU\nzygpAliuFdKyDz1L36Fay6405cYwgbQGA1UdIwSBrDCBqYAUQ0QoCaZ57CQdDEm6\ndAfAT6ukngyheqR4MHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYD\nVQQKDAR0ZXN0MQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQI\nDAR0ZXN0MQ0wCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0ghUAqVmM48T7pclD\nEmQt3iJDkuRkkYAwFgYJKwYBBAGCNxQCBAkWB2ZvcklUMTEwIAYDVR0lBBkwFwYI\nKwYBBQUHAwIGCysGAQQBgr5oAQECMCAGCCsGAQUFBwEBBBQwEjAQBggrBgEFBQcw\nAYYEdGVzdDAOBgNVHQ8BAf8EBAMCBaAwDQYJKoZIhvcNAQENBQADggEBAECFJ1xZ\npN4g7wWwQR3MZPD7+mmdlqb18uvEzY/3Txieu7WU3UdfStuNc3jiTdexXMTbIPfI\n1fDzpI0VjHNubGr6w2v6B3XjD4QY9KZtdVj0i/mjI5BWdyUoiOzCIzatLQl6JvaL\nd8NaAdj6i6iR6jCG2vSYbM+Gb4qXUqBHYU2gwzXTr7PGheVJxRf2uP1JRBJ0iu2X\nL1xrFhLICzBrTeiy/TDb3ev/GIm38/DElhDfKjeukVoVkun/BzOFksHJvWF1+gr4\nclLtytfkn3y0DUJ3nQhg1bNOXqiTXUCbPQkQ984P+YnftOGpDS7B0zO1GRz0Si52\ngXSEZVShw7IpD8A=\n-----END CERTIFICATE-----\n',
      organization: 'test',
      keyLength: 4096,
      certificateTemplateId: '84d3b18d00964fe0b4740eedb6623930',
      certificateTemplateName: 'forIT11',
      certificateAuthoritiesId: '6362c7f967b24d6ab05ecf10ca05bd65',
      certificateAuthoritiesName: 'rootCaForIT1',
      locality: 'test',
      state: 'test',
      country: 'test',
      organizationUnit: 'test',
      keyUsage: [
        'DIGITAL_SIGNATURE',
        'KEY_ENCIPHERMENT'
      ],
      privateKeyBase64: null,
      chain: '-----BEGIN CERTIFICATE-----\nMIIECjCCAvKgAwIBAgIVAKlZjOPE+6XJQxJkLd4iQ5LkZJGAMA0GCSqGSIb3DQEB\nCwUAMHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYDVQQKDAR0ZXN0\nMQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0w\nCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTIyMTEzMDIwMDAwMFoXDTMz\nMTIzMTIwMDAwMFowdjEaMBgGA1UEAwwRbXlyb290Q2FAdGVzdC5jb20xDTALBgNV\nBAoMBHRlc3QxDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgM\nBHRlc3QxDTALBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3QwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDGzjw2qYcJj9Y3gs3L/aOx09tj+OeKFDxDuoPN\n0urjOoCCYmfIQrdxjgPr+BGKCNeXjuAs4CPm/mOuvYUtIratqfbkQurRs0nXRhIY\nKHD5I006AzbJOpTbtj95AGbfCXAmtutdjXH3qDwj+qyYSqMoVnPaTNey1cJPI6qM\nWDlbabeHLsjeqBifFsb5+OCxfDRXInzD5z9rvXc7z9tQl4tK6T4DlX3Ts/+Co4Uy\nsv1QcdEUUbgxK4ROP8QvHm7zUbv9ygheOE4MFFECMhXYOXo4r6e9ya9fb0PVSq67\nu7POPCQetOMY7qJvyPzuYrxRqzP68dh4HoSJzoU+j2DfDgY3AgMBAAGjgY4wgYsw\nJwYDVR0lBCAwHgYIKwYBBQUHAwIGCCsGAQUFBwMBBggrBgEFBQcDCTAgBggrBgEF\nBQcBAQQUMBIwEAYIKwYBBQUHMAGGBHRlc3QwHQYDVR0OBBYEFENEKAmmeewkHQxJ\nunQHwE+rpJ4MMA4GA1UdDwEB/wQEAwIBtjAPBgNVHRMBAf8EBTADAQH/MA0GCSqG\nSIb3DQEBCwUAA4IBAQBDZe4fYXz1GOU0cfmO5KGhVRoUG7gkRiqxElf3mDBrJCOf\nZVaIXq5dmH3XeQxJcfBpARIk1m705DCcDvXajORRDWJ50Kk0CvyXvW6XM5pq3Tai\nmBP3IcwLrxs/oErHyE56K+sXEpe9253WQuTFXrVph3j3jqUbr6w+mva86hfqBlXT\n1cakK4q2DAcVdjK9vw9wSaxVEEYAKATW6xV2YuXWm7Ug2RU9g5c9bI/HvObYpCeO\ntr8pbZWvleD8nbVKINR6YLVMamXxqEk1YkdTgCcJ2PBOx3w3O7FGnkWIrL3grzMm\nll5OvaZF9jgJd2kJ5c6zrFvWbT8vkU5mpVdUpftW\n-----END CERTIFICATE-----\n',
      details: '  [0]         Version: 3\n         SerialNumber: 1449216585246122075785627832691539938494567915812\n             IssuerDN: CN=myrootCa@test.com,O=test,OU=test,L=test,ST=test,C=test,T=test\n           Start Date: Wed Jan 24 16:00:00 GMT 2024\n           Final Date: Thu Jan 24 23:59:59 GMT 2030\n            SubjectDN: CN=test,O=test,OU=test,L=test,ST=test,C=test\n           Public Key: RSA Public Key [05:c4:31:47:e4:21:1e:da:6d:b2:97:b0:a4:2a:ce:0c:73:6d:b7:26],[56:66:d1:a4]\n        modulus: a314b8b9415fd4641d6c61130284227fd305d4555cbe0ecc16c7aa2c7f4278666434f4425f9cd9d3fd4983b89e37f204073ce611ba6817f306012cb62883bdf874aefda8793da4c80bd58915bbb233da150f251e8fe332b84bd439f6038d854b171ccf88fc15249b74bc7487756bc875c8613e09be34cf1a7cc5e1e91f2480dbdf31429ab0d73364412a468c393c09af7f8cb5d56efc4d242751c48909712dbbc33ccc310e31a82cbf6d95b644d3c59b079ea1a3c50d818a1a714625918882647dee43f6ce885b2334e25cf653df3bd678a3fa8e4004fb82051ee5f767ffc476699b9b3151e54c685628cc831215a72266802ffaa4f45e6b855314b3b19b9473a43f4d1bb8bd8f72819c42bba6790f8c02f1338492f8122164923e70a2f2bda1e8b27137f3dcb435ddb7125aab60fe9b407033bf86172ccdef1af640cb40d59c3e63ade6bac67469ecd5d644d161660511c82c288b09f5ed7f4fe90419e6faee97058e10f846004d45b979f2e5d061f8b9a6973f45af2b0edf2e2aee508fadfa7f8b8feb265e92bc816d8bbff9eba75ac41bffdff22f75e0ad8bf9e70c75a2be808574380bd80da4baf754bf9bda17610d64486ab633743be14794c25c2c76b7981d741ca92078b6c247ff00aee83c110daa18f77ce4ba8a9e10a88cb082e34c575b4b6bf8ffbace57f83b3adc0d60a8157ef254073e48bdeefd321d9062a237\npublic exponent: 10001\n\n  Signature Algorithm: SHA512WITHRSA\n            Signature: 4085275c59a4de20ef05b0411dcc64f0fbfa699d\n                       96a6f5f2ebc4cd8ff74f189ebbb594dd475f4adb\n                       8d7378e24dd7b15cc4db20f7c8d5f0f3a48d158c\n                       736e6c6afac36bfa0775e30f8418f4a66d7558f4\n                       8bf9a323905677252888ecc22336ad2d097a26f6\n                       8b77c35a01d8fa8ba891ea3086daf4986ccf866f\n                       8a9752a047614da0c335d3afb3c685e549c517f6\n                       b8fd494412748aed972f5c6b1612c80b306b4de8\n                       b2fd30dbddebff1889b7f3f0c49610df2a37ae91\n                       5a1592e9ff07338592c1c9bd6175fa0af87252ed\n                       cad7e49f7cb40d42779d0860d5b34e5ea8935d40\n                       9b3d0910f7ce0ff989dfb4e1a90d2ec1d333b519\n                       1cf44a2e768174846554a1c3b2290fc0\n       Extensions: \n                       critical(false) 2.5.29.14 value = DER Octet String[20] \n\n                       critical(false) 2.5.29.35 value = Sequence\n    Tagged [CONTEXT 0] IMPLICIT \n        DER Octet String[20] \n    Tagged [CONTEXT 1]\n        Tagged [CONTEXT 4]\n            Sequence\n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.3)\n                        UTF8String(myrootCa@test.com) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.10)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.11)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.7)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.8)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.6)\n                        PrintableString(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.12)\n                        UTF8String(test) \n    Tagged [CONTEXT 2] IMPLICIT \n        DER Octet String[21] \n\n                       critical(false) 1.3.6.1.4.1.311.20.2 value = IA5String(forIT11) \n\n                       critical(false) 2.5.29.37 value = Sequence\n    ObjectIdentifier(1.3.6.1.5.5.7.3.2)\n    ObjectIdentifier(1.3.6.1.4.1.40808.1.1.2)\n\n                       critical(false) 1.3.6.1.5.5.7.1.1 value = Sequence\n    Sequence\n        ObjectIdentifier(1.3.6.1.5.5.7.48.1)\n        Tagged [CONTEXT 6] IMPLICIT \n            DER Octet String[4] \n\n                       critical(true) KeyUsage: 0xa0\n',
      description: 'test',
      certificateType: null
    },
    {
      id: 'cb61d82eb10e4f77931b026cdf3d2bc2',
      commonName: 'certificate2',
      createDate: '2024-02-19T05:18:33Z',
      notBeforeDate: '2024-01-24T16:00:00Z',
      notAfterDate: '2030-01-24T23:59:59Z',
      email: '',
      revocationDate: '2024-01-25T16:00:00Z',
      revocationReason: 'revokeReason2',
      serialNumber: '5b9daab0d9dae4f65f2f608cdccdce344ce17d7c',
      shaThumbprint: 'AA9282FE55861773CF362CC9253DF3E2D24B5ADF',
      publicKeyBase64: '-----BEGIN CERTIFICATE-----\nMIIFpjCCBI6gAwIBAgIUW52qsNna5PZfL2CM3M3ONEzhfXwwDQYJKoZIhvcNAQEN\nBQAwdjEaMBgGA1UEAwwRbXlyb290Q2FAdGVzdC5jb20xDTALBgNVBAoMBHRlc3Qx\nDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgMBHRlc3QxDTAL\nBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3QwHhcNMjQwMTI0MTYwMDAwWhcNMzAw\nMTI0MjM1OTU5WjBaMQ0wCwYDVQQDDAR0ZXN0MQ0wCwYDVQQKDAR0ZXN0MQ0wCwYD\nVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0wCwYDVQQG\nEwR0ZXN0MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAm4HxBymRkBpw\nzL05VsHOYduU2ZSwcKj02lj26tVScFiVNsr7124ZwLuXoZQ+24n9o7CwbBOcDmeN\nggpAh1Qa9Mlr+a50Rsg+0wL3gSXtsbGKjwMh0VP88GEkvTzFVVuaQd0VU65aR5+e\n2bfTq3Bnh9laIeMUBpq39aQIAGxRfx58rJRNmaaILPv+HSN45XNBjhxDkrcQtD+V\n2BvOFyuJYLv9BdY5j2jQrAvMQrRJ/SltXy8pblN4hnEzJNO6zTKzgeTTLq6LYLf3\nPOJRD13NKcSaSwtsk+P9NhJSP0wryS7IkojFXOexIFTyn12b/zESmta1F2clapyQ\nIVE4iJ2z2fEEwXIm2ThNGqegwyfoRy9nhtKKu0kziM1tX4NXUdbSSYVMOafbXi9S\nR3YCBSKoo2rgQ/7GQ6qIjuqd9zLUtGpNu5o0djQ5ZaU5BTFTEg24R6AcYfQAEDGx\nOK5CgNZRr5vyMC+6qrbvkNjpPYy+cfMbbJkdQuRC/MSpDK2l4aRcI0omeghf+DNy\nIGm2uOVjaEu6wgrz6eJlbcp+6OFQOVjYRiAZr89Wcs9bgK9NsSTqeC2CA+ZHJuK6\nB2D16PCPJzd8hsqKanPNWzQ5SMbaTbDQ+zXc+IyX+fH7OogXOKeu4Q9UDUXWZKYc\n49mLxZ7yrax0AoV2N+9tPLI619jQQ3MCAwEAAaOCAUYwggFCMB0GA1UdDgQWBBS9\nfGFEfcL+v0VUJXA0VCNEpPQonjCBtAYDVR0jBIGsMIGpgBRDRCgJpnnsJB0MSbp0\nB8BPq6SeDKF6pHgwdjEaMBgGA1UEAwwRbXlyb290Q2FAdGVzdC5jb20xDTALBgNV\nBAoMBHRlc3QxDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgM\nBHRlc3QxDTALBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3SCFQCpWYzjxPulyUMS\nZC3eIkOS5GSRgDAWBgkrBgEEAYI3FAIECRYHZm9ySVQxMTAgBgNVHSUEGTAXBggr\nBgEFBQcDAgYLKwYBBAGCvmgBAQIwIAYIKwYBBQUHAQEEFDASMBAGCCsGAQUFBzAB\nhgR0ZXN0MA4GA1UdDwEB/wQEAwIFoDANBgkqhkiG9w0BAQ0FAAOCAQEAD2+/F1Hd\nYNgfbuarEs+6K2qEeTTOoja/lcp8AjYfG1nPhOd7Ii9azea1mIkwwJ78MizVKy4m\nHQw5sujcJj0ZUYNtjzbJjZj6gxOuE3NafS8+ZweaI40pVOHX/dDKvS9tCyruCNX2\ng74poqyzc1iVwXnekvHvl4DJeNunBvFYYJ/jOlZpgIuKcdLFzpfc+GRw14TO+kI6\nPzuLZxh7Ka0+H2yjqSQOBySBoqqnE72gVJT0NdfBVcHVLZ/1l0d0dzs8iN6XEEmA\nU5NDVtseN5kp3r3tJpp8WK+kBTfkUvuCTnZsorZfTlax3IptnQhHnrTgAI/BBvnI\nTSQW3+t0bXe/3Q==\n-----END CERTIFICATE-----\n',
      organization: 'test',
      keyLength: 4096,
      certificateTemplateId: '84d3b18d00964fe0b4740eedb6623930',
      certificateTemplateName: 'forIT11',
      certificateAuthoritiesId: '6362c7f967b24d6ab05ecf10ca05bd65',
      certificateAuthoritiesName: 'rootCaForIT1',
      locality: 'test',
      state: 'test',
      country: 'test',
      organizationUnit: 'test',
      keyUsage: [
        'DIGITAL_SIGNATURE',
        'KEY_ENCIPHERMENT'
      ],
      privateKeyBase64: '-----BEGIN RSA PRIVATE KEY-----\nMIIJKQIBAAKCAgEAm4HxBymRkBpwzL05VsHOYduU2ZSwcKj02lj26tVScFiVNsr7\n124ZwLuXoZQ+24n9o7CwbBOcDmeNggpAh1Qa9Mlr+a50Rsg+0wL3gSXtsbGKjwMh\n0VP88GEkvTzFVVuaQd0VU65aR5+e2bfTq3Bnh9laIeMUBpq39aQIAGxRfx58rJRN\nmaaILPv+HSN45XNBjhxDkrcQtD+V2BvOFyuJYLv9BdY5j2jQrAvMQrRJ/SltXy8p\nblN4hnEzJNO6zTKzgeTTLq6LYLf3POJRD13NKcSaSwtsk+P9NhJSP0wryS7IkojF\nXOexIFTyn12b/zESmta1F2clapyQIVE4iJ2z2fEEwXIm2ThNGqegwyfoRy9nhtKK\nu0kziM1tX4NXUdbSSYVMOafbXi9SR3YCBSKoo2rgQ/7GQ6qIjuqd9zLUtGpNu5o0\ndjQ5ZaU5BTFTEg24R6AcYfQAEDGxOK5CgNZRr5vyMC+6qrbvkNjpPYy+cfMbbJkd\nQuRC/MSpDK2l4aRcI0omeghf+DNyIGm2uOVjaEu6wgrz6eJlbcp+6OFQOVjYRiAZ\nr89Wcs9bgK9NsSTqeC2CA+ZHJuK6B2D16PCPJzd8hsqKanPNWzQ5SMbaTbDQ+zXc\n+IyX+fH7OogXOKeu4Q9UDUXWZKYc49mLxZ7yrax0AoV2N+9tPLI619jQQ3MCAwEA\nAQKCAgAtmJwjjXyw1A/e+Fyno4vwBYJPidlyLxgcLZm4oXPanR6jQkE1mYLTkC2V\novILTRqhtF0GU3mef55uUrM4+uAshiKywwQ0/OHu3R/VLlnTkEsgQ7rWtdmkYddz\n5S23KXTBeyGVt7mg5pydGdlmmz7ABmr3JK3qgdMOo1n1Rc1fiIDl2VYnhzzGc9y+\njngUTwcZtA/cJPEw6LP2+bAj+w/83SIDZBzcf88vowXxSQuov0zia+GqB69/PBHS\n6oILSKJ5o66IMYWMhmRn5bP+3XIanRrghij/9Al6oUScaqksBBurW48C/qxg3oeF\nUt06phjebbYLdqLx75YTLs10wUjKWUiBomKJP946VAu5MRVVzZSyaao+dNhq/JIB\njO53cIzNm9g25xlmUk4rTEBvR5cy2qYRjaexCB5XB8Fw1ijgnpH9fF+sM6bqc+Bq\nDuaZHc6xPjyQZ3Mtj46u4uXk/Qz0ielLMNquzX90Bjh2MqV0ifYP4Q3vVKncxkut\nyXQRR0zI9lcUxeE+RPScqUji+U4icczcQDqOCj/IlG6P8UoWpRVMbjGnkN1f46/x\n9XmObbKzNB6URMrpXM4pt8AFWs6out+qsJ9dYCMkHWwcwN8mRcYqrPpMPQWSv+96\nn3VX60M+8+8BdS6QAc+QrJizu8st71JBkyhZl76vmAYtxTfrAQKCAQEA0fi1t3ej\nkIv1pdf7P0lPZL6LQyjHcbe6Vh+FTanbqOuGPeQBJrOapC2KEknSj9qd8E+N0SYb\nb6FAPLRT88JJdeNE1WNJxJzQLQ0njV0UZW85gAK86VsRXJqsy0XoWGZjZBDxdQCv\nEx4DY5svx+2Qv2/VKa5ROZfHSv9WJ64a8FifIM72WKDjZubg0znN97EYrA71Ln26\nY3ftXhkqX3Xu0mZnbTKQ3BfTpgIBJinCWsZ3xGjG9JqxeVADRueeaG0kPzMky6CG\nKja8OyVR0dOoUPgGDjgbhiL2pFyBxX0rxwW08Z48LAn2i1mnsspFxxCpjAxDHuG1\nEBvW0nlQKklZ+QKCAQEAvZjL2b/k1lYBKqErtUUjPI76TY/izSkatZXsjiMQuvQ3\nVWXW42qEFJGxvYPSHsMC5XNYxDQazca0syDxlh+LCsMwcwDOY9i4EezMmN45SELi\n5Uxk1AdoGEg7gYLHWM3cbuclOoqqvrMNEBpN/m0G8Cv+S3BuVAFN/G2MdpiQ1iT6\na9iJ6JQugh09DtjWb7Ts7vlqNXhXFCptLunXqV2z1cry5vA1uWnh3Xfne8Vz6k/m\nUI/aomQCoZZD+D9bA38dD5813mFJHeJyoQqp1b8kxqLPYmihdQ+Nx/ESg0uCvp7O\nBMxW6CIMr/oyLyg8bRs5s7F80vG0HCuSVY3ef1gDywKCAQEAqqJusnFkmBRVhfgW\ncyDVh26d5+8c3dpMcK7e+vVd0FHO3z8KfHQa6O8lNKWPm14zWdaczmokg7xMYsi9\nLOwoHMib6Lnuefxh5Sq6iNQqvh/8X35aHV3npxT/9ZWTMzvJ68klIEt0+5k5cdns\no5H5PsnYNi42ThJ9YAJO9qIzvDyY3OW0JuRgyQA5lw5zxqXCAhmJwMVmEm2klgLn\nf3psocmcpY4hUOuAEXmxi10GWBTPwerQPHn2Xjra3uVdw0lm2oFqlpyWS3n90CcM\n7fMO5vYYnbeVDpYdUAbpYx/M0sldebl49uUF2cr7UH225QYycuCIL3GHXlbxZkw2\nDJddqQKCAQEAiHM1EquWR+Nxx3pi+HyflW/ZGIUbV0fj3xfdPZZi7gng4OcANn9s\nO1l3r8r1KAp1RSk0k1BkkgAWAG0PMVnWOZKshbfo0dcg8lWYEdStKSJqJVhLoIUM\nF520pcq3KWRO5soX8v/lToWSOyqTQy64NZWT2Ds8S9z8gVVeJ+Q5KMVILOGUrvwm\nVKIyVUMdYRu3AW4jUAQht3OpTIAjI9M6H/2Fv0rVf3GCil9HC77ZY6LJQOWnFgQg\nGKcKl9kQ6X1MLvgITtl5Q7a7hMcl351HHGYEFvDycksVYPZQuolXuVSVNMLTMRGA\nTA4mm+W7R1K2vmpYSYCGfVemY0hM/x0a7QKCAQAwtPBAXA3l6EeQjpcPRzDqqDFL\ndsnf2Gff/ebda7KM3L0it/APaLA6C9VYCfRgmWF2qzHIShoGLVCDgwX8waMJU1qQ\nIVRDQ3ftavLffAeKYIcaTSZ/b/ro6PN/OvgaJSDbcvPp/kjWwff2wxqWDrrnkTLL\n4ApxmDDMKHQpPl3hEEXg9tQujXm6W/I+19gTe5xoejoT+2pngtN9r5omKntFM8UY\nI8IEgcGXdRze4B5tEyvM5dy4gk3HqNC4tkvZuUBHO/llrx2aGXwqjJbQlZsFBGoG\nbe2jTJMeb4scBuHY7efAk2FiuQYjSJB1zmMWD57MbJDARMviv9+lgHR7+hXc\n-----END RSA PRIVATE KEY-----\n',
      chain: '-----BEGIN CERTIFICATE-----\nMIIECjCCAvKgAwIBAgIVAKlZjOPE+6XJQxJkLd4iQ5LkZJGAMA0GCSqGSIb3DQEB\nCwUAMHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYDVQQKDAR0ZXN0\nMQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0w\nCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTIyMTEzMDIwMDAwMFoXDTMz\nMTIzMTIwMDAwMFowdjEaMBgGA1UEAwwRbXlyb290Q2FAdGVzdC5jb20xDTALBgNV\nBAoMBHRlc3QxDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgM\nBHRlc3QxDTALBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3QwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDGzjw2qYcJj9Y3gs3L/aOx09tj+OeKFDxDuoPN\n0urjOoCCYmfIQrdxjgPr+BGKCNeXjuAs4CPm/mOuvYUtIratqfbkQurRs0nXRhIY\nKHD5I006AzbJOpTbtj95AGbfCXAmtutdjXH3qDwj+qyYSqMoVnPaTNey1cJPI6qM\nWDlbabeHLsjeqBifFsb5+OCxfDRXInzD5z9rvXc7z9tQl4tK6T4DlX3Ts/+Co4Uy\nsv1QcdEUUbgxK4ROP8QvHm7zUbv9ygheOE4MFFECMhXYOXo4r6e9ya9fb0PVSq67\nu7POPCQetOMY7qJvyPzuYrxRqzP68dh4HoSJzoU+j2DfDgY3AgMBAAGjgY4wgYsw\nJwYDVR0lBCAwHgYIKwYBBQUHAwIGCCsGAQUFBwMBBggrBgEFBQcDCTAgBggrBgEF\nBQcBAQQUMBIwEAYIKwYBBQUHMAGGBHRlc3QwHQYDVR0OBBYEFENEKAmmeewkHQxJ\nunQHwE+rpJ4MMA4GA1UdDwEB/wQEAwIBtjAPBgNVHRMBAf8EBTADAQH/MA0GCSqG\nSIb3DQEBCwUAA4IBAQBDZe4fYXz1GOU0cfmO5KGhVRoUG7gkRiqxElf3mDBrJCOf\nZVaIXq5dmH3XeQxJcfBpARIk1m705DCcDvXajORRDWJ50Kk0CvyXvW6XM5pq3Tai\nmBP3IcwLrxs/oErHyE56K+sXEpe9253WQuTFXrVph3j3jqUbr6w+mva86hfqBlXT\n1cakK4q2DAcVdjK9vw9wSaxVEEYAKATW6xV2YuXWm7Ug2RU9g5c9bI/HvObYpCeO\ntr8pbZWvleD8nbVKINR6YLVMamXxqEk1YkdTgCcJ2PBOx3w3O7FGnkWIrL3grzMm\nll5OvaZF9jgJd2kJ5c6zrFvWbT8vkU5mpVdUpftW\n-----END CERTIFICATE-----\n',
      details: '  [0]         Version: 3\n         SerialNumber: 523034246409022721574999995590484643897172655484\n             IssuerDN: CN=myrootCa@test.com,O=test,OU=test,L=test,ST=test,C=test,T=test\n           Start Date: Wed Jan 24 16:00:00 GMT 2024\n           Final Date: Thu Jan 24 23:59:59 GMT 2030\n            SubjectDN: CN=test,O=test,OU=test,L=test,ST=test,C=test\n           Public Key: RSA Public Key [c7:0c:92:d6:a8:d7:c3:0c:50:0e:44:f2:06:e2:d2:78:ba:96:1a:9e],[56:66:d1:a4]\n        modulus: 9b81f1072991901a70ccbd3956c1ce61db94d994b070a8f4da58f6ead55270589536cafbd76e19c0bb97a1943edb89fda3b0b06c139c0e678d820a4087541af4c96bf9ae7446c83ed302f78125edb1b18a8f0321d153fcf06124bd3cc5555b9a41dd1553ae5a479f9ed9b7d3ab706787d95a21e314069ab7f5a408006c517f1e7cac944d99a6882cfbfe1d2378e573418e1c4392b710b43f95d81bce172b8960bbfd05d6398f68d0ac0bcc42b449fd296d5f2f296e537886713324d3bacd32b381e4d32eae8b60b7f73ce2510f5dcd29c49a4b0b6c93e3fd3612523f4c2bc92ec89288c55ce7b12054f29f5d9bff31129ad6b51767256a9c90215138889db3d9f104c17226d9384d1aa7a0c327e8472f6786d28abb493388cd6d5f835751d6d249854c39a7db5e2f524776020522a8a36ae043fec643aa888eea9df732d4b46a4dbb9a3476343965a539053153120db847a01c61f4001031b138ae4280d651af9bf2302fbaaab6ef90d8e93d8cbe71f31b6c991d42e442fcc4a90cada5e1a45c234a267a085ff833722069b6b8e563684bbac20af3e9e2656dca7ee8e1503958d8462019afcf5672cf5b80af4db124ea782d8203e64726e2ba0760f5e8f08f27377c86ca8a6a73cd5b343948c6da4db0d0fb35dcf88c97f9f1fb3a881738a7aee10f540d45d664a61ce3d98bc59ef2adac7402857637ef6d3cb23ad7d8d04373\npublic exponent: 10001\n\n  Signature Algorithm: SHA512WITHRSA\n            Signature: 0f6fbf1751dd60d81f6ee6ab12cfba2b6a847934\n                       cea236bf95ca7c02361f1b59cf84e77b222f5acd\n                       e6b5988930c09efc322cd52b2e261d0c39b2e8dc\n                       263d1951836d8f36c98d98fa8313ae13735a7d2f\n                       3e67079a238d2954e1d7fdd0cabd2f6d0b2aee08\n                       d5f683be29a2acb3735895c179de92f1ef9780c9\n                       78dba706f158609fe33a5669808b8a71d2c5ce97\n                       dcf86470d784cefa423a3f3b8b67187b29ad3e1f\n                       6ca3a9240e072481a2aaa713bda05494f435d7c1\n                       55c1d52d9ff5974774773b3c88de971049805393\n                       4356db1e379929debded269a7c58afa40537e452\n                       fb824e766ca2b65f4e56b1dc8a6d9d08479eb4e0\n                       008fc106f9c84d2416dfeb746d77bfdd\n       Extensions: \n                       critical(false) 2.5.29.14 value = DER Octet String[20] \n\n                       critical(false) 2.5.29.35 value = Sequence\n    Tagged [CONTEXT 0] IMPLICIT \n        DER Octet String[20] \n    Tagged [CONTEXT 1]\n        Tagged [CONTEXT 4]\n            Sequence\n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.3)\n                        UTF8String(myrootCa@test.com) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.10)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.11)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.7)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.8)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.6)\n                        PrintableString(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.12)\n                        UTF8String(test) \n    Tagged [CONTEXT 2] IMPLICIT \n        DER Octet String[21] \n\n                       critical(false) 1.3.6.1.4.1.311.20.2 value = IA5String(forIT11) \n\n                       critical(false) 2.5.29.37 value = Sequence\n    ObjectIdentifier(1.3.6.1.5.5.7.3.2)\n    ObjectIdentifier(1.3.6.1.4.1.40808.1.1.2)\n\n                       critical(false) 1.3.6.1.5.5.7.1.1 value = Sequence\n    Sequence\n        ObjectIdentifier(1.3.6.1.5.5.7.48.1)\n        Tagged [CONTEXT 6] IMPLICIT \n            DER Octet String[4] \n\n                       critical(true) KeyUsage: 0xa0\n',
      description: null,
      certificateType: null
    }
  ]
}

export const certificate = {
  id: '7edd1265d63242a0b27b05b60d7c7ebb',
  commonName: 'certificate1',
  createDate: '2024-02-02T01:38:45Z',
  notBeforeDate: '2024-01-24T16:00:00Z',
  notAfterDate: '2030-01-24T23:59:59Z',
  email: '',
  revocationDate: '',
  revocationReason: '',
  serialNumber: '0000000000fdd91e84afdc5fa61f1b8cb3b6d1e83d0f33a124',
  shaThumbprint: '91FEC59DDBC8E0A0166FCDC5C56CCE83715DE3E2',
  publicKeyBase64: '-----BEGIN CERTIFICATE-----\nMIIFpzCCBI+gAwIBAgIVAP3ZHoSv3F+mHxuMs7bR6D0PM6EkMA0GCSqGSIb3DQEB\nDQUAMHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYDVQQKDAR0ZXN0\nMQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0w\nCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTI0MDEyNDE2MDAwMFoXDTMw\nMDEyNDIzNTk1OVowWjENMAsGA1UEAwwEdGVzdDENMAsGA1UECgwEdGVzdDENMAsG\nA1UECwwEdGVzdDENMAsGA1UEBwwEdGVzdDENMAsGA1UECAwEdGVzdDENMAsGA1UE\nBhMEdGVzdDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAKMUuLlBX9Rk\nHWxhEwKEIn/TBdRVXL4OzBbHqix/QnhmZDT0Ql+c2dP9SYO4njfyBAc85hG6aBfz\nBgEstiiDvfh0rv2oeT2kyAvViRW7sjPaFQ8lHo/jMrhL1Dn2A42FSxccz4j8FSSb\ndLx0h3VryHXIYT4JvjTPGnzF4ekfJIDb3zFCmrDXM2RBKkaMOTwJr3+MtdVu/E0k\nJ1HEiQlxLbvDPMwxDjGoLL9tlbZE08WbB56ho8UNgYoacUYlkYiCZH3uQ/bOiFsj\nNOJc9lPfO9Z4o/qOQAT7ggUe5fdn/8R2aZubMVHlTGhWKMyDEhWnImaAL/qk9F5r\nhVMUs7GblHOkP00buL2PcoGcQrumeQ+MAvEzhJL4EiFkkj5wovK9oeiycTfz3LQ1\n3bcSWqtg/ptAcDO/hhcsze8a9kDLQNWcPmOt5rrGdGns1dZE0WFmBRHILCiLCfXt\nf0/pBBnm+u6XBY4Q+EYATUW5efLl0GH4uaaXP0WvKw7fLiruUI+t+n+Lj+smXpK8\ngW2Lv/nrp1rEG//f8i914K2L+ecMdaK+gIV0OAvYDaS691S/m9oXYQ1kSGq2M3Q7\n4UeUwlwsdreYHXQcqSB4tsJH/wCu6DwRDaoY93zkuoqeEKiMsILjTFdbS2v4/7rO\nV/g7OtwNYKgVfvJUBz5Ive79Mh2QYqI3AgMBAAGjggFGMIIBQjAdBgNVHQ4EFgQU\nzygpAliuFdKyDz1L36Fay6405cYwgbQGA1UdIwSBrDCBqYAUQ0QoCaZ57CQdDEm6\ndAfAT6ukngyheqR4MHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYD\nVQQKDAR0ZXN0MQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQI\nDAR0ZXN0MQ0wCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0ghUAqVmM48T7pclD\nEmQt3iJDkuRkkYAwFgYJKwYBBAGCNxQCBAkWB2ZvcklUMTEwIAYDVR0lBBkwFwYI\nKwYBBQUHAwIGCysGAQQBgr5oAQECMCAGCCsGAQUFBwEBBBQwEjAQBggrBgEFBQcw\nAYYEdGVzdDAOBgNVHQ8BAf8EBAMCBaAwDQYJKoZIhvcNAQENBQADggEBAECFJ1xZ\npN4g7wWwQR3MZPD7+mmdlqb18uvEzY/3Txieu7WU3UdfStuNc3jiTdexXMTbIPfI\n1fDzpI0VjHNubGr6w2v6B3XjD4QY9KZtdVj0i/mjI5BWdyUoiOzCIzatLQl6JvaL\nd8NaAdj6i6iR6jCG2vSYbM+Gb4qXUqBHYU2gwzXTr7PGheVJxRf2uP1JRBJ0iu2X\nL1xrFhLICzBrTeiy/TDb3ev/GIm38/DElhDfKjeukVoVkun/BzOFksHJvWF1+gr4\nclLtytfkn3y0DUJ3nQhg1bNOXqiTXUCbPQkQ984P+YnftOGpDS7B0zO1GRz0Si52\ngXSEZVShw7IpD8A=\n-----END CERTIFICATE-----\n',
  organization: 'test',
  keyLength: 4096,
  certificateTemplateId: '84d3b18d00964fe0b4740eedb6623930',
  certificateTemplateName: 'forIT11',
  certificateAuthoritiesId: '6362c7f967b24d6ab05ecf10ca05bd65',
  certificateAuthoritiesName: 'rootCaForIT1',
  locality: 'test',
  state: 'test',
  country: 'test',
  organizationUnit: 'test',
  keyUsage: [
    KeyUsageType.DIGITAL_SIGNATURE,
    KeyUsageType.KEY_ENCIPHERMENT
  ],
  privateKeyBase64: '-----BEGIN CERTIFICATE-----\nMIIDbzCCAlegAwIBAgIVAMTVgJsTDczVdQYkON6HpSDuAWs1MA0GCSqGSIb3DQEB\nCwUAMBMxETAPBgNVBAMMCGFzZGZhc2RmMB4XDTI0MDIyMTA5NTYzOFoXDTI1MDMy\nMTA5NTYzOFowDzENMAsGA1UEAwwEZGdmaDCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBAMyVxpnCOLbgXQt5nBCYmRQAtqqq7EnhslB2/yFNTpXpejk1Y+mp\nCPwR6Q1WlC6g6gfzRZ5b23CXi6VClrJeCz561Od2/SHeL2eY2JrTUlE9sPeWcJCQ\n39vS56dLGN4ODF9x3MYolu0UQ7j/TyvYJ9NbJlHHZ4EbgX502bsBivnt/S51GpfN\nbgoEG7sNOE/8iKhh0x2uanNvGAprOEv5mx85Ogi+QicRfPV5AhL01cu/71C90Rn0\ngrgatdXNfijoNJ3vbujXQLx4b5jOmFvQTP9ImzIq5o0qWoy35D3LU34+X9RGJ2H4\n7vMf13vQ6CCmcmwESlus3uMXyrxRznMMVRcCAwEAAaOBvTCBujAdBgNVHQ4EFgQU\ndjOGrJFKguipRZUvq/wVIIYYHVcwTgYDVR0jBEcwRYAUK+h7zbmBLL0AhPBjh60D\nj+b6+FChF6QVMBMxETAPBgNVBAMMCGFzZGZhc2RmghRWVvbMN3p9sQrvg2risLJ1\n3CND2DAXBgkrBgEEAYI3FAIEChYIc2dkZmdmc2QwIAYDVR0lBBkwFwYIKwYBBQUH\nAwIGCysGAQQBgr5oAQECMA4GA1UdDwEB/wQEAwIFoDANBgkqhkiG9w0BAQsFAAOC\nAQEAgnlgYtn8DQDVeyGkeqBR/1I56Bm40bgI/jUevYE2+5uGie0qKGsUfV95WtMb\nIIvPBV/h7LoHnzIf+IPRT5P9aIxc7U4E0oqyL4cHdEKhTNgERwjqLkzGuSJUcj8J\nap0VSNE25+O66uX7Sjdc2tLNN6D4hLBk/xEtyGbQ91qSO0t6aob2TMzAin4XwLK5\nCLeZuvZmL7GHsn/fR68QWy2miSavbQs4XSCwS0XuNXSezk4wivZmgVrdckvXke7k\na1agVQiB8yf15/kJf7XmgWKeltDDt+Fviz2MtvBqfzv4gaoIrYo0MV/wGOlCpyjR\nCg1V7vMzvYC5/dKb6gh/WgmxHw==\n-----END CERTIFICATE-----\n',
  chain: '-----BEGIN CERTIFICATE-----\nMIIECjCCAvKgAwIBAgIVAKlZjOPE+6XJQxJkLd4iQ5LkZJGAMA0GCSqGSIb3DQEB\nCwUAMHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYDVQQKDAR0ZXN0\nMQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0w\nCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTIyMTEzMDIwMDAwMFoXDTMz\nMTIzMTIwMDAwMFowdjEaMBgGA1UEAwwRbXlyb290Q2FAdGVzdC5jb20xDTALBgNV\nBAoMBHRlc3QxDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgM\nBHRlc3QxDTALBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3QwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDGzjw2qYcJj9Y3gs3L/aOx09tj+OeKFDxDuoPN\n0urjOoCCYmfIQrdxjgPr+BGKCNeXjuAs4CPm/mOuvYUtIratqfbkQurRs0nXRhIY\nKHD5I006AzbJOpTbtj95AGbfCXAmtutdjXH3qDwj+qyYSqMoVnPaTNey1cJPI6qM\nWDlbabeHLsjeqBifFsb5+OCxfDRXInzD5z9rvXc7z9tQl4tK6T4DlX3Ts/+Co4Uy\nsv1QcdEUUbgxK4ROP8QvHm7zUbv9ygheOE4MFFECMhXYOXo4r6e9ya9fb0PVSq67\nu7POPCQetOMY7qJvyPzuYrxRqzP68dh4HoSJzoU+j2DfDgY3AgMBAAGjgY4wgYsw\nJwYDVR0lBCAwHgYIKwYBBQUHAwIGCCsGAQUFBwMBBggrBgEFBQcDCTAgBggrBgEF\nBQcBAQQUMBIwEAYIKwYBBQUHMAGGBHRlc3QwHQYDVR0OBBYEFENEKAmmeewkHQxJ\nunQHwE+rpJ4MMA4GA1UdDwEB/wQEAwIBtjAPBgNVHRMBAf8EBTADAQH/MA0GCSqG\nSIb3DQEBCwUAA4IBAQBDZe4fYXz1GOU0cfmO5KGhVRoUG7gkRiqxElf3mDBrJCOf\nZVaIXq5dmH3XeQxJcfBpARIk1m705DCcDvXajORRDWJ50Kk0CvyXvW6XM5pq3Tai\nmBP3IcwLrxs/oErHyE56K+sXEpe9253WQuTFXrVph3j3jqUbr6w+mva86hfqBlXT\n1cakK4q2DAcVdjK9vw9wSaxVEEYAKATW6xV2YuXWm7Ug2RU9g5c9bI/HvObYpCeO\ntr8pbZWvleD8nbVKINR6YLVMamXxqEk1YkdTgCcJ2PBOx3w3O7FGnkWIrL3grzMm\nll5OvaZF9jgJd2kJ5c6zrFvWbT8vkU5mpVdUpftW\n-----END CERTIFICATE-----\n',
  details: '  [0]         Version: 3\n         SerialNumber: 1449216585246122075785627832691539938494567915812\n             IssuerDN: CN=myrootCa@test.com,O=test,OU=test,L=test,ST=test,C=test,T=test\n           Start Date: Wed Jan 24 16:00:00 GMT 2024\n           Final Date: Thu Jan 24 23:59:59 GMT 2030\n            SubjectDN: CN=test,O=test,OU=test,L=test,ST=test,C=test\n           Public Key: RSA Public Key [05:c4:31:47:e4:21:1e:da:6d:b2:97:b0:a4:2a:ce:0c:73:6d:b7:26],[56:66:d1:a4]\n        modulus: a314b8b9415fd4641d6c61130284227fd305d4555cbe0ecc16c7aa2c7f4278666434f4425f9cd9d3fd4983b89e37f204073ce611ba6817f306012cb62883bdf874aefda8793da4c80bd58915bbb233da150f251e8fe332b84bd439f6038d854b171ccf88fc15249b74bc7487756bc875c8613e09be34cf1a7cc5e1e91f2480dbdf31429ab0d73364412a468c393c09af7f8cb5d56efc4d242751c48909712dbbc33ccc310e31a82cbf6d95b644d3c59b079ea1a3c50d818a1a714625918882647dee43f6ce885b2334e25cf653df3bd678a3fa8e4004fb82051ee5f767ffc476699b9b3151e54c685628cc831215a72266802ffaa4f45e6b855314b3b19b9473a43f4d1bb8bd8f72819c42bba6790f8c02f1338492f8122164923e70a2f2bda1e8b27137f3dcb435ddb7125aab60fe9b407033bf86172ccdef1af640cb40d59c3e63ade6bac67469ecd5d644d161660511c82c288b09f5ed7f4fe90419e6faee97058e10f846004d45b979f2e5d061f8b9a6973f45af2b0edf2e2aee508fadfa7f8b8feb265e92bc816d8bbff9eba75ac41bffdff22f75e0ad8bf9e70c75a2be808574380bd80da4baf754bf9bda17610d64486ab633743be14794c25c2c76b7981d741ca92078b6c247ff00aee83c110daa18f77ce4ba8a9e10a88cb082e34c575b4b6bf8ffbace57f83b3adc0d60a8157ef254073e48bdeefd321d9062a237\npublic exponent: 10001\n\n  Signature Algorithm: SHA512WITHRSA\n            Signature: 4085275c59a4de20ef05b0411dcc64f0fbfa699d\n                       96a6f5f2ebc4cd8ff74f189ebbb594dd475f4adb\n                       8d7378e24dd7b15cc4db20f7c8d5f0f3a48d158c\n                       736e6c6afac36bfa0775e30f8418f4a66d7558f4\n                       8bf9a323905677252888ecc22336ad2d097a26f6\n                       8b77c35a01d8fa8ba891ea3086daf4986ccf866f\n                       8a9752a047614da0c335d3afb3c685e549c517f6\n                       b8fd494412748aed972f5c6b1612c80b306b4de8\n                       b2fd30dbddebff1889b7f3f0c49610df2a37ae91\n                       5a1592e9ff07338592c1c9bd6175fa0af87252ed\n                       cad7e49f7cb40d42779d0860d5b34e5ea8935d40\n                       9b3d0910f7ce0ff989dfb4e1a90d2ec1d333b519\n                       1cf44a2e768174846554a1c3b2290fc0\n       Extensions: \n                       critical(false) 2.5.29.14 value = DER Octet String[20] \n\n                       critical(false) 2.5.29.35 value = Sequence\n    Tagged [CONTEXT 0] IMPLICIT \n        DER Octet String[20] \n    Tagged [CONTEXT 1]\n        Tagged [CONTEXT 4]\n            Sequence\n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.3)\n                        UTF8String(myrootCa@test.com) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.10)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.11)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.7)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.8)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.6)\n                        PrintableString(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.12)\n                        UTF8String(test) \n    Tagged [CONTEXT 2] IMPLICIT \n        DER Octet String[21] \n\n                       critical(false) 1.3.6.1.4.1.311.20.2 value = IA5String(forIT11) \n\n                       critical(false) 2.5.29.37 value = Sequence\n    ObjectIdentifier(1.3.6.1.5.5.7.3.2)\n    ObjectIdentifier(1.3.6.1.4.1.40808.1.1.2)\n\n                       critical(false) 1.3.6.1.5.5.7.1.1 value = Sequence\n    Sequence\n        ObjectIdentifier(1.3.6.1.5.5.7.48.1)\n        Tagged [CONTEXT 6] IMPLICIT \n            DER Octet String[4] \n\n                       critical(true) KeyUsage: 0xa0\n',
  description: 'test',
  certificateType: null
}

export const serverCertificate: ServerCertificate = {
  id: '7edd1265d63242a0b27b05b60d7c7ebb',
  commonName: 'certificate1',
  name: 'certificate1',
  status: [CertificateStatusType.VALID],
  createDate: '2024-02-02T01:38:45Z',
  notBeforeDate: '2024-01-24T16:00:00Z',
  notAfterDate: '2030-01-24T23:59:59Z',
  email: '',
  revocationDate: '',
  revocationReason: '',
  serialNumber: '0000000000fdd91e84afdc5fa61f1b8cb3b6d1e83d0f33a124',
  shaThumbprint: '91FEC59DDBC8E0A0166FCDC5C56CCE83715DE3E2',
  publicKeyBase64: '-----BEGIN CERTIFICATE-----\nMIIFpzCCBI+gAwIBAgIVAP3ZHoSv3F+mHxuMs7bR6D0PM6EkMA0GCSqGSIb3DQEB\nDQUAMHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYDVQQKDAR0ZXN0\nMQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0w\nCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTI0MDEyNDE2MDAwMFoXDTMw\nMDEyNDIzNTk1OVowWjENMAsGA1UEAwwEdGVzdDENMAsGA1UECgwEdGVzdDENMAsG\nA1UECwwEdGVzdDENMAsGA1UEBwwEdGVzdDENMAsGA1UECAwEdGVzdDENMAsGA1UE\nBhMEdGVzdDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAKMUuLlBX9Rk\nHWxhEwKEIn/TBdRVXL4OzBbHqix/QnhmZDT0Ql+c2dP9SYO4njfyBAc85hG6aBfz\nBgEstiiDvfh0rv2oeT2kyAvViRW7sjPaFQ8lHo/jMrhL1Dn2A42FSxccz4j8FSSb\ndLx0h3VryHXIYT4JvjTPGnzF4ekfJIDb3zFCmrDXM2RBKkaMOTwJr3+MtdVu/E0k\nJ1HEiQlxLbvDPMwxDjGoLL9tlbZE08WbB56ho8UNgYoacUYlkYiCZH3uQ/bOiFsj\nNOJc9lPfO9Z4o/qOQAT7ggUe5fdn/8R2aZubMVHlTGhWKMyDEhWnImaAL/qk9F5r\nhVMUs7GblHOkP00buL2PcoGcQrumeQ+MAvEzhJL4EiFkkj5wovK9oeiycTfz3LQ1\n3bcSWqtg/ptAcDO/hhcsze8a9kDLQNWcPmOt5rrGdGns1dZE0WFmBRHILCiLCfXt\nf0/pBBnm+u6XBY4Q+EYATUW5efLl0GH4uaaXP0WvKw7fLiruUI+t+n+Lj+smXpK8\ngW2Lv/nrp1rEG//f8i914K2L+ecMdaK+gIV0OAvYDaS691S/m9oXYQ1kSGq2M3Q7\n4UeUwlwsdreYHXQcqSB4tsJH/wCu6DwRDaoY93zkuoqeEKiMsILjTFdbS2v4/7rO\nV/g7OtwNYKgVfvJUBz5Ive79Mh2QYqI3AgMBAAGjggFGMIIBQjAdBgNVHQ4EFgQU\nzygpAliuFdKyDz1L36Fay6405cYwgbQGA1UdIwSBrDCBqYAUQ0QoCaZ57CQdDEm6\ndAfAT6ukngyheqR4MHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYD\nVQQKDAR0ZXN0MQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQI\nDAR0ZXN0MQ0wCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0ghUAqVmM48T7pclD\nEmQt3iJDkuRkkYAwFgYJKwYBBAGCNxQCBAkWB2ZvcklUMTEwIAYDVR0lBBkwFwYI\nKwYBBQUHAwIGCysGAQQBgr5oAQECMCAGCCsGAQUFBwEBBBQwEjAQBggrBgEFBQcw\nAYYEdGVzdDAOBgNVHQ8BAf8EBAMCBaAwDQYJKoZIhvcNAQENBQADggEBAECFJ1xZ\npN4g7wWwQR3MZPD7+mmdlqb18uvEzY/3Txieu7WU3UdfStuNc3jiTdexXMTbIPfI\n1fDzpI0VjHNubGr6w2v6B3XjD4QY9KZtdVj0i/mjI5BWdyUoiOzCIzatLQl6JvaL\nd8NaAdj6i6iR6jCG2vSYbM+Gb4qXUqBHYU2gwzXTr7PGheVJxRf2uP1JRBJ0iu2X\nL1xrFhLICzBrTeiy/TDb3ev/GIm38/DElhDfKjeukVoVkun/BzOFksHJvWF1+gr4\nclLtytfkn3y0DUJ3nQhg1bNOXqiTXUCbPQkQ984P+YnftOGpDS7B0zO1GRz0Si52\ngXSEZVShw7IpD8A=\n-----END CERTIFICATE-----\n',
  organization: 'test',
  keyLength: 4096,
  certificateTemplateId: '84d3b18d00964fe0b4740eedb6623930',
  certificateTemplateName: 'forIT11',
  certificateAuthoritiesId: '6362c7f967b24d6ab05ecf10ca05bd65',
  certificateAuthoritiesName: 'rootCaForIT1',
  locality: 'test',
  state: 'test',
  country: 'test',
  organizationUnit: 'test',
  keyUsages: [
    KeyUsageType.DIGITAL_SIGNATURE,
    KeyUsageType.KEY_ENCIPHERMENT
  ],
  privateKeyBase64: '-----BEGIN CERTIFICATE-----\nMIIDbzCCAlegAwIBAgIVAMTVgJsTDczVdQYkON6HpSDuAWs1MA0GCSqGSIb3DQEB\nCwUAMBMxETAPBgNVBAMMCGFzZGZhc2RmMB4XDTI0MDIyMTA5NTYzOFoXDTI1MDMy\nMTA5NTYzOFowDzENMAsGA1UEAwwEZGdmaDCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBAMyVxpnCOLbgXQt5nBCYmRQAtqqq7EnhslB2/yFNTpXpejk1Y+mp\nCPwR6Q1WlC6g6gfzRZ5b23CXi6VClrJeCz561Od2/SHeL2eY2JrTUlE9sPeWcJCQ\n39vS56dLGN4ODF9x3MYolu0UQ7j/TyvYJ9NbJlHHZ4EbgX502bsBivnt/S51GpfN\nbgoEG7sNOE/8iKhh0x2uanNvGAprOEv5mx85Ogi+QicRfPV5AhL01cu/71C90Rn0\ngrgatdXNfijoNJ3vbujXQLx4b5jOmFvQTP9ImzIq5o0qWoy35D3LU34+X9RGJ2H4\n7vMf13vQ6CCmcmwESlus3uMXyrxRznMMVRcCAwEAAaOBvTCBujAdBgNVHQ4EFgQU\ndjOGrJFKguipRZUvq/wVIIYYHVcwTgYDVR0jBEcwRYAUK+h7zbmBLL0AhPBjh60D\nj+b6+FChF6QVMBMxETAPBgNVBAMMCGFzZGZhc2RmghRWVvbMN3p9sQrvg2risLJ1\n3CND2DAXBgkrBgEEAYI3FAIEChYIc2dkZmdmc2QwIAYDVR0lBBkwFwYIKwYBBQUH\nAwIGCysGAQQBgr5oAQECMA4GA1UdDwEB/wQEAwIFoDANBgkqhkiG9w0BAQsFAAOC\nAQEAgnlgYtn8DQDVeyGkeqBR/1I56Bm40bgI/jUevYE2+5uGie0qKGsUfV95WtMb\nIIvPBV/h7LoHnzIf+IPRT5P9aIxc7U4E0oqyL4cHdEKhTNgERwjqLkzGuSJUcj8J\nap0VSNE25+O66uX7Sjdc2tLNN6D4hLBk/xEtyGbQ91qSO0t6aob2TMzAin4XwLK5\nCLeZuvZmL7GHsn/fR68QWy2miSavbQs4XSCwS0XuNXSezk4wivZmgVrdckvXke7k\na1agVQiB8yf15/kJf7XmgWKeltDDt+Fviz2MtvBqfzv4gaoIrYo0MV/wGOlCpyjR\nCg1V7vMzvYC5/dKb6gh/WgmxHw==\n-----END CERTIFICATE-----\n',
  chain: '-----BEGIN CERTIFICATE-----\nMIIECjCCAvKgAwIBAgIVAKlZjOPE+6XJQxJkLd4iQ5LkZJGAMA0GCSqGSIb3DQEB\nCwUAMHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYDVQQKDAR0ZXN0\nMQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0w\nCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTIyMTEzMDIwMDAwMFoXDTMz\nMTIzMTIwMDAwMFowdjEaMBgGA1UEAwwRbXlyb290Q2FAdGVzdC5jb20xDTALBgNV\nBAoMBHRlc3QxDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgM\nBHRlc3QxDTALBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3QwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDGzjw2qYcJj9Y3gs3L/aOx09tj+OeKFDxDuoPN\n0urjOoCCYmfIQrdxjgPr+BGKCNeXjuAs4CPm/mOuvYUtIratqfbkQurRs0nXRhIY\nKHD5I006AzbJOpTbtj95AGbfCXAmtutdjXH3qDwj+qyYSqMoVnPaTNey1cJPI6qM\nWDlbabeHLsjeqBifFsb5+OCxfDRXInzD5z9rvXc7z9tQl4tK6T4DlX3Ts/+Co4Uy\nsv1QcdEUUbgxK4ROP8QvHm7zUbv9ygheOE4MFFECMhXYOXo4r6e9ya9fb0PVSq67\nu7POPCQetOMY7qJvyPzuYrxRqzP68dh4HoSJzoU+j2DfDgY3AgMBAAGjgY4wgYsw\nJwYDVR0lBCAwHgYIKwYBBQUHAwIGCCsGAQUFBwMBBggrBgEFBQcDCTAgBggrBgEF\nBQcBAQQUMBIwEAYIKwYBBQUHMAGGBHRlc3QwHQYDVR0OBBYEFENEKAmmeewkHQxJ\nunQHwE+rpJ4MMA4GA1UdDwEB/wQEAwIBtjAPBgNVHRMBAf8EBTADAQH/MA0GCSqG\nSIb3DQEBCwUAA4IBAQBDZe4fYXz1GOU0cfmO5KGhVRoUG7gkRiqxElf3mDBrJCOf\nZVaIXq5dmH3XeQxJcfBpARIk1m705DCcDvXajORRDWJ50Kk0CvyXvW6XM5pq3Tai\nmBP3IcwLrxs/oErHyE56K+sXEpe9253WQuTFXrVph3j3jqUbr6w+mva86hfqBlXT\n1cakK4q2DAcVdjK9vw9wSaxVEEYAKATW6xV2YuXWm7Ug2RU9g5c9bI/HvObYpCeO\ntr8pbZWvleD8nbVKINR6YLVMamXxqEk1YkdTgCcJ2PBOx3w3O7FGnkWIrL3grzMm\nll5OvaZF9jgJd2kJ5c6zrFvWbT8vkU5mpVdUpftW\n-----END CERTIFICATE-----\n',
  details: '  [0]         Version: 3\n         SerialNumber: 1449216585246122075785627832691539938494567915812\n             IssuerDN: CN=myrootCa@test.com,O=test,OU=test,L=test,ST=test,C=test,T=test\n           Start Date: Wed Jan 24 16:00:00 GMT 2024\n           Final Date: Thu Jan 24 23:59:59 GMT 2030\n            SubjectDN: CN=test,O=test,OU=test,L=test,ST=test,C=test\n           Public Key: RSA Public Key [05:c4:31:47:e4:21:1e:da:6d:b2:97:b0:a4:2a:ce:0c:73:6d:b7:26],[56:66:d1:a4]\n        modulus: a314b8b9415fd4641d6c61130284227fd305d4555cbe0ecc16c7aa2c7f4278666434f4425f9cd9d3fd4983b89e37f204073ce611ba6817f306012cb62883bdf874aefda8793da4c80bd58915bbb233da150f251e8fe332b84bd439f6038d854b171ccf88fc15249b74bc7487756bc875c8613e09be34cf1a7cc5e1e91f2480dbdf31429ab0d73364412a468c393c09af7f8cb5d56efc4d242751c48909712dbbc33ccc310e31a82cbf6d95b644d3c59b079ea1a3c50d818a1a714625918882647dee43f6ce885b2334e25cf653df3bd678a3fa8e4004fb82051ee5f767ffc476699b9b3151e54c685628cc831215a72266802ffaa4f45e6b855314b3b19b9473a43f4d1bb8bd8f72819c42bba6790f8c02f1338492f8122164923e70a2f2bda1e8b27137f3dcb435ddb7125aab60fe9b407033bf86172ccdef1af640cb40d59c3e63ade6bac67469ecd5d644d161660511c82c288b09f5ed7f4fe90419e6faee97058e10f846004d45b979f2e5d061f8b9a6973f45af2b0edf2e2aee508fadfa7f8b8feb265e92bc816d8bbff9eba75ac41bffdff22f75e0ad8bf9e70c75a2be808574380bd80da4baf754bf9bda17610d64486ab633743be14794c25c2c76b7981d741ca92078b6c247ff00aee83c110daa18f77ce4ba8a9e10a88cb082e34c575b4b6bf8ffbace57f83b3adc0d60a8157ef254073e48bdeefd321d9062a237\npublic exponent: 10001\n\n  Signature Algorithm: SHA512WITHRSA\n            Signature: 4085275c59a4de20ef05b0411dcc64f0fbfa699d\n                       96a6f5f2ebc4cd8ff74f189ebbb594dd475f4adb\n                       8d7378e24dd7b15cc4db20f7c8d5f0f3a48d158c\n                       736e6c6afac36bfa0775e30f8418f4a66d7558f4\n                       8bf9a323905677252888ecc22336ad2d097a26f6\n                       8b77c35a01d8fa8ba891ea3086daf4986ccf866f\n                       8a9752a047614da0c335d3afb3c685e549c517f6\n                       b8fd494412748aed972f5c6b1612c80b306b4de8\n                       b2fd30dbddebff1889b7f3f0c49610df2a37ae91\n                       5a1592e9ff07338592c1c9bd6175fa0af87252ed\n                       cad7e49f7cb40d42779d0860d5b34e5ea8935d40\n                       9b3d0910f7ce0ff989dfb4e1a90d2ec1d333b519\n                       1cf44a2e768174846554a1c3b2290fc0\n       Extensions: \n                       critical(false) 2.5.29.14 value = DER Octet String[20] \n\n                       critical(false) 2.5.29.35 value = Sequence\n    Tagged [CONTEXT 0] IMPLICIT \n        DER Octet String[20] \n    Tagged [CONTEXT 1]\n        Tagged [CONTEXT 4]\n            Sequence\n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.3)\n                        UTF8String(myrootCa@test.com) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.10)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.11)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.7)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.8)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.6)\n                        PrintableString(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.12)\n                        UTF8String(test) \n    Tagged [CONTEXT 2] IMPLICIT \n        DER Octet String[21] \n\n                       critical(false) 1.3.6.1.4.1.311.20.2 value = IA5String(forIT11) \n\n                       critical(false) 2.5.29.37 value = Sequence\n    ObjectIdentifier(1.3.6.1.5.5.7.3.2)\n    ObjectIdentifier(1.3.6.1.4.1.40808.1.1.2)\n\n                       critical(false) 1.3.6.1.5.5.7.1.1 value = Sequence\n    Sequence\n        ObjectIdentifier(1.3.6.1.5.5.7.48.1)\n        Tagged [CONTEXT 6] IMPLICIT \n            DER Octet String[4] \n\n                       critical(true) KeyUsage: 0xa0\n',
  description: 'test'
}

export const policySetList = {
  paging: { totalCount: 3, page: 1, pageSize: 3, pageCount: 1 },
  content: [
    {
      id: 'e4fc0210-a491-460c-bd74-549a9334325a',
      name: 'ps12',
      description: 'ps12'
    },
    {
      id: 'a76cac94-3180-4f5f-9c3b-50319cb24ef8',
      name: 'ps2',
      description: 'ps2'
    },
    {
      id: '2f617cdd-a8b7-47e7-ba1e-fd41caf3dac8',
      name: 'ps4',
      description: 'ps4'
    }
  ]
}

export const certificateAuthority =
{
  id: '5eb07265d99242d78004cff1a9a53cf0',
  name: 'onboard2',
  commonName: 'testcommaon',
  organization: 'test',
  organizationUnit: 'test',
  startDate: '2022-11-30T20:00:00Z',
  expireDate: '2033-12-31T20:00:00Z',
  keyLength: 2048,
  algorithm: AlgorithmType.SHA_384,
  title: 'test',
  locality: 'test',
  state: 'test',
  country: 'test',
  publicKeyBase64: '-----BEGIN CERTIFICATE-----\nMIID/TCCAuWgAwIBAgIUeFArqCw+FD3kwcWnYHJmI1BY3MkwDQYJKoZIhvcNAQEM\nBQAwcDEUMBIGA1UEAwwLdGVzdGNvbW1hb24xDTALBgNVBAoMBHRlc3QxDTALBgNV\nBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgMBHRlc3QxDTALBgNVBAYT\nBHRlc3QxDTALBgNVBAwMBHRlc3QwHhcNMjIxMTMwMjAwMDAwWhcNMzMxMjMxMjAw\nMDAwWjBwMRQwEgYDVQQDDAt0ZXN0Y29tbWFvbjENMAsGA1UECgwEdGVzdDENMAsG\nA1UECwwEdGVzdDENMAsGA1UEBwwEdGVzdDENMAsGA1UECAwEdGVzdDENMAsGA1UE\nBhMEdGVzdDENMAsGA1UEDAwEdGVzdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC\nAQoCggEBANaMtBU7H9VAKiad1PK2qPUcNfjqDYmk2SYXwW1dw+WkFrcBMWo0rDiL\n4KKdq+bGyx7msF4RGB0KYR31FpFlrancbbADIEBm57ohPYB+dFYQJpXr8Y9AIeWo\npsDwC4fmnsvt3gUcj31BtwKWR0gEBE75eY8DHfmFbIEaNw/zsr7CpGv3hwBXkeOa\nFLKEzP55PE5MBv9Z1VsZQ5lLsQQZKkheilJSTrvQUgyRnJeTjGNUKVEm2oQGkwcS\nPu4n+1t0b2/dLCSPCOJi9mMSpY4gCcLJaeNaxWpyAfGsZg2/rgUEigcGhZUF7o1q\nxQm7wmhYkTYoZTl2rd2HFWAun2rMhZ0CAwEAAaOBjjCBizAnBgNVHSUEIDAeBggr\nBgEFBQcDAgYIKwYBBQUHAwEGCCsGAQUFBwMJMCAGCCsGAQUFBwEBBBQwEjAQBggr\nBgEFBQcwAYYEdGVzdDAdBgNVHQ4EFgQU7cxqUQojAP8lAkza+gfD2xuUJy0wDgYD\nVR0PAQH/BAQDAgG2MA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQEMBQADggEB\nANLv4q01jtkG/aacMuz3HQsBjsS+forrVPsOZKZNTu8vCzJ9eCXipkyLtmBHil8K\no+Q9q/WdGsh7Soi55kk5dR/T/mYP9GNbtWBUBARt9hLEcd7HdADPM/dpxsFfRTpx\nnW+rUxCWxGSPB7pjMEBZPmSJRztycSf/BgzqJGId/snMH2HCQzkD6a9UgbsKLbu7\n52CilZSCGOslAd7S2DK6tge1eGLmxfmQhf1p+wq+GIpc7vfHg0GYi5PiZn+tL8cj\n9b3CTel57G98beKh/SqyDkoEhqDcdRykaN6A9Ux4/FWvBUDeGYd20he28oUyrkBN\n5KhzTwWKENOyVvzYK1BVDQM=\n-----END CERTIFICATE-----\n',
  privateKeyBase64: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA1oy0FTsf1UAqJp3U8rao9Rw1+OoNiaTZJhfBbV3D5aQWtwEx\najSsOIvgop2r5sbLHuawXhEYHQphHfUWkWWtqdxtsAMgQGbnuiE9gH50VhAmlevx\nj0Ah5aimwPALh+aey+3eBRyPfUG3ApZHSAQETvl5jwMd+YVsgRo3D/OyvsKka/eH\nAFeR45oUsoTM/nk8TkwG/1nVWxlDmUuxBBkqSF6KUlJOu9BSDJGcl5OMY1QpUSba\nhAaTBxI+7if7W3Rvb90sJI8I4mL2YxKljiAJwslp41rFanIB8axmDb+uBQSKBwaF\nlQXujWrFCbvCaFiRNihlOXat3YcVYC6fasyFnQIDAQABAoIBAACApN1V3Z24wECF\n5x1Iaz3juoaiObTkU3Pg412XtiFAEKOOF6kJhYu+XCDVYLUyKwCgBrK5tIZA43hX\n/h0KEW2P7BvY7gbolstbT5MQ+MHI2OZJ/q9YtZudmQJjrYs8cYvFu1rktbtT35Nc\neb9D7ySmNfAtUDEo7FejEZTye60xs2rVVTTehXXPq2RiZ13suC5PfniLFyv6JRFw\n38uyeRt8FFnIMDNoZ1GilT3IegpD/vnHlf5VUKr/JruZ//suthpI7u79K/z2XNam\niXdWDhA5y1lbOdFi8kaH3C14ml6BZZ7sC169TWr1nH6kVesZW7e2fRxrcvo3dXHU\nn4tk6DECgYEA69SCLxfjB5O9UpdZjodQSn6i14dx0wZRIG1ra8Gb5SGpVpC/CsCF\nGkqQsm71lNz6efg/9rAzXkB9bt6j9jO7KLOeq+k1l9eDUyC9OJJjerwznYPyEFiJ\nvbYrbFHa6f3Ym8fErZK+V1wMuaSTtD5VXtIJp482pSq0+tBWsiuN6ukCgYEA6OZC\naRUaxCDy7wuqaHIDPnpQU0NFC2QY8qnjNiGFGdwuY4SjI0zW7k/tG5SoRKvQhtyN\nNa6eq4AA1XndG12ax/4PcISOA5S2Rq1HDiIPR62ZAlLGpQn2LBaWTxImExC7+w6d\n6rbxcGXaXlxETntFYPg0tyWQQfWjI0CDFGkE7JUCgYEAk1vziOe9JgPsHgqSnFvz\nEMl2iYSJ3FmrIb8di3SsLA3PmVbS+S35PcdwCP8Kl11JaiN0HHpXbsKPXlLiUzpZ\n7YHnWPZdVacF2VCwzAO1A4FMI1XKUOpyD0ggdAvl5aaHzjeSrv7tzvqmvO2Ymd0F\nTT2jaL81XxmDguHh+mz6vdkCgYEAu5YK03yuLF6ljSiGPs3mEwKNhCLgj8Y12e5A\nFa9191hC/OEuTRZs31H9FoPr7DO/J4CpNB3LqzLUeR1Im+wO6RqW8PezMusqzU5v\nttB0IjWO0jI90VxurSAcPN/PTvfhkNs7Env7h55h/jKuyc+8F9iTDRjyUk448gHa\nEixsTOkCgYBcLWhH/jRTqOdsqiV567nM4cXjfO5/cvharbERwe4/MlrmjWlep0Xv\nDMBds7RnIqDRKQBqvWBsEW36L1lUm0FF7tbZGM/GBewtWy25Nx5xUJYp28W8MX2o\nstnUrPrMMa4qeVQWDcwHcqyMFF4QzuOkRqaN+RhXbjNl8Z74pZTBUw==\n-----END RSA PRIVATE KEY-----\n',
  publicKeyShaThumbprint: '31D00BD232304F7B5D234FA91FA808426DC067E7',
  serialNumber: '000000000078502ba82c3e143de4c1c5a7607266235058dcc9',
  chain: '-----BEGIN CERTIFICATE-----\nMIIDIzCCAgugAwIBAgIUToirzcpqDuhgt90u3DTErJOwSO8wDQYJKoZIhvcNAQEL\nBQAwFTETMBEGA1UEAwwKdGVzdGFkZDIyMjAeFw0yNDAxMjIwNDExMTNaFw00NDAy\nMjIwNDExMTNaMBUxEzARBgNVBAMMCnRlc3RhZGQyMjIwggEiMA0GCSqGSIb3DQEB\nAQUAA4IBDwAwggEKAoIBAQCjzDGSD+0ggNRCiLgqgPik/HSqLg39GfpaK59HxEM9\n/tPuqtIK02L3QtizmcPe7Mks5fwxPMGDRZazoS7sNN7wQpImVDLmxXQQ5Cj93thZ\neS+dHOBMrLpUEygX8p9gmhSaoJQcqDsX55itYEz+3jw9HpmGQBMmbZ1yDhJQbxeS\nZbV2uvQnKNY62XsH8TZRDSP/DJwTzcIUf66mKif0EzqjozFwTnf1bvwM0/JIWvKD\nJ/4E50m7P9v/u35g3IRj63taHaMcsQ5F8aZbczzilPXeGUnWIEbCm3XumSvrFoV7\n7FrApeH7WSxK5QpVcGLjOivDgIVV1l4jVQd5bbCd/FsLAgMBAAGjazBpMCcGA1Ud\nJQQgMB4GCCsGAQUFBwMCBggrBgEFBQcDAQYIKwYBBQUHAwkwHQYDVR0OBBYEFKxu\nCPdf4GiCdyVIwuBmrAMj7t/LMA4GA1UdDwEB/wQEAwIBtjAPBgNVHRMBAf8EBTAD\nAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBCRNfFwGOlx9B0/+8qZFrMrEMcLnXYyMYp\n015tThoTGvp24m3svLVSJ9+17MFxBBPHKbpnoJRLpab1qwlN5NZeyQA9XzBW/QGc\nhE5uTGAbRpTLkpNYAoHSm2wfa0TfjqnlmcGpLbNRPsmKjrLwdHJM4/4mziS64jMr\n0/hhVKiHQgMOHwwHnyUKVLM/yWY5+urlEZ19DAWvfZuEUdjWU6IuajL5Ce6K/cCB\n3ZyBihw45CGNuve4RBVRVrUlo5vvqTNfY3fQvZKkbwhHMvQBjVWEPy2IcuWhV4Vx\nIL7S0PobonPCBu+zSjRcophnkQg+D0ldmjJPD44rWOfbNvfcx5OA\n-----END CERTIFICATE-----\n',
  ocspUrl: 'test',
  enabled: true,
  usages: [
    UsageType.CLIENT_AUTH
  ],
  templateCount: 3,
  templateNames: [
    'testCertificateTemplate1',
    'testCertificateTemplate2',
    'testCertificateTemplate3'
  ],
  ocspName: '94B35FD003060653DB2DBEF969024280A2ACA389',
  ocspHash: 'EDCC6A510A2300FF25024CDAFA07C3DB1B94272D',
  keyUsages: [
    KeyUsageType.DIGITAL_SIGNATURE,
    KeyUsageType.KEY_ENCIPHERMENT,
    KeyUsageType.CRL_SIGN
  ],
  status: [
    CertificateStatusType.VALID
  ]
}

export const mockPersonaGroupWithIdentity: PersonaGroup = {
  id: 'persona-group-id-1',
  name: 'Class A',
  description: '',
  macRegistrationPoolId: 'mac-id-1',
  dpskPoolId: 'dpsk-pool-2',
  propertyId: 'propertyId-100',
  certificateTemplateId: 'cert-template-1'
}

export const mockPersonaList: Persona[] = [
  {
    id: 'b1d533e6-15b6-4168-8f5c-418198a7e3e7',
    groupId: 'persona-group-id-1',
    name: 'testccc-123',
    revoked: false
  }
]

export const serverCertificateList = {
  fields: null,
  totalCount: 2,
  totalPages: 1,
  page: 1,
  data: [
    {
      id: '7edd1265d63242a0b27b05b60d7c7ebb',
      name: 'certificate1',
      commonName: 'certificate1',
      createDate: '2024-02-02T01:38:45Z',
      notBeforeDate: '2024-01-24T16:00:00Z',
      notAfterDate: '2030-01-24T23:59:59Z',
      email: '',
      revocationDate: null,
      revocationReason: null,
      serialNumber: '0000000000fdd91e84afdc5fa61f1b8cb3b6d1e83d0f33a124',
      shaThumbprint: '91FEC59DDBC8E0A0166FCDC5C56CCE83715DE3E2',
      publicKeyBase64: '-----BEGIN CERTIFICATE-----\nMIIFpzCCBI+gAwIBAgIVAP3ZHoSv3F+mHxuMs7bR6D0PM6EkMA0GCSqGSIb3DQEB\nDQUAMHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYDVQQKDAR0ZXN0\nMQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0w\nCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTI0MDEyNDE2MDAwMFoXDTMw\nMDEyNDIzNTk1OVowWjENMAsGA1UEAwwEdGVzdDENMAsGA1UECgwEdGVzdDENMAsG\nA1UECwwEdGVzdDENMAsGA1UEBwwEdGVzdDENMAsGA1UECAwEdGVzdDENMAsGA1UE\nBhMEdGVzdDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAKMUuLlBX9Rk\nHWxhEwKEIn/TBdRVXL4OzBbHqix/QnhmZDT0Ql+c2dP9SYO4njfyBAc85hG6aBfz\nBgEstiiDvfh0rv2oeT2kyAvViRW7sjPaFQ8lHo/jMrhL1Dn2A42FSxccz4j8FSSb\ndLx0h3VryHXIYT4JvjTPGnzF4ekfJIDb3zFCmrDXM2RBKkaMOTwJr3+MtdVu/E0k\nJ1HEiQlxLbvDPMwxDjGoLL9tlbZE08WbB56ho8UNgYoacUYlkYiCZH3uQ/bOiFsj\nNOJc9lPfO9Z4o/qOQAT7ggUe5fdn/8R2aZubMVHlTGhWKMyDEhWnImaAL/qk9F5r\nhVMUs7GblHOkP00buL2PcoGcQrumeQ+MAvEzhJL4EiFkkj5wovK9oeiycTfz3LQ1\n3bcSWqtg/ptAcDO/hhcsze8a9kDLQNWcPmOt5rrGdGns1dZE0WFmBRHILCiLCfXt\nf0/pBBnm+u6XBY4Q+EYATUW5efLl0GH4uaaXP0WvKw7fLiruUI+t+n+Lj+smXpK8\ngW2Lv/nrp1rEG//f8i914K2L+ecMdaK+gIV0OAvYDaS691S/m9oXYQ1kSGq2M3Q7\n4UeUwlwsdreYHXQcqSB4tsJH/wCu6DwRDaoY93zkuoqeEKiMsILjTFdbS2v4/7rO\nV/g7OtwNYKgVfvJUBz5Ive79Mh2QYqI3AgMBAAGjggFGMIIBQjAdBgNVHQ4EFgQU\nzygpAliuFdKyDz1L36Fay6405cYwgbQGA1UdIwSBrDCBqYAUQ0QoCaZ57CQdDEm6\ndAfAT6ukngyheqR4MHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYD\nVQQKDAR0ZXN0MQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQI\nDAR0ZXN0MQ0wCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0ghUAqVmM48T7pclD\nEmQt3iJDkuRkkYAwFgYJKwYBBAGCNxQCBAkWB2ZvcklUMTEwIAYDVR0lBBkwFwYI\nKwYBBQUHAwIGCysGAQQBgr5oAQECMCAGCCsGAQUFBwEBBBQwEjAQBggrBgEFBQcw\nAYYEdGVzdDAOBgNVHQ8BAf8EBAMCBaAwDQYJKoZIhvcNAQENBQADggEBAECFJ1xZ\npN4g7wWwQR3MZPD7+mmdlqb18uvEzY/3Txieu7WU3UdfStuNc3jiTdexXMTbIPfI\n1fDzpI0VjHNubGr6w2v6B3XjD4QY9KZtdVj0i/mjI5BWdyUoiOzCIzatLQl6JvaL\nd8NaAdj6i6iR6jCG2vSYbM+Gb4qXUqBHYU2gwzXTr7PGheVJxRf2uP1JRBJ0iu2X\nL1xrFhLICzBrTeiy/TDb3ev/GIm38/DElhDfKjeukVoVkun/BzOFksHJvWF1+gr4\nclLtytfkn3y0DUJ3nQhg1bNOXqiTXUCbPQkQ984P+YnftOGpDS7B0zO1GRz0Si52\ngXSEZVShw7IpD8A=\n-----END CERTIFICATE-----\n',
      organization: 'test',
      keyLength: 4096,
      certificateTemplateId: '84d3b18d00964fe0b4740eedb6623930',
      certificateTemplateName: 'forIT11',
      certificateAuthoritiesId: '6362c7f967b24d6ab05ecf10ca05bd65',
      certificateAuthoritiesName: 'rootCaForIT1',
      locality: 'test',
      state: 'test',
      country: 'test',
      organizationUnit: 'test',
      keyUsage: [
        'DIGITAL_SIGNATURE',
        'KEY_ENCIPHERMENT'
      ],
      privateKeyBase64: null,
      chain: '-----BEGIN CERTIFICATE-----\nMIIECjCCAvKgAwIBAgIVAKlZjOPE+6XJQxJkLd4iQ5LkZJGAMA0GCSqGSIb3DQEB\nCwUAMHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYDVQQKDAR0ZXN0\nMQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0w\nCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTIyMTEzMDIwMDAwMFoXDTMz\nMTIzMTIwMDAwMFowdjEaMBgGA1UEAwwRbXlyb290Q2FAdGVzdC5jb20xDTALBgNV\nBAoMBHRlc3QxDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgM\nBHRlc3QxDTALBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3QwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDGzjw2qYcJj9Y3gs3L/aOx09tj+OeKFDxDuoPN\n0urjOoCCYmfIQrdxjgPr+BGKCNeXjuAs4CPm/mOuvYUtIratqfbkQurRs0nXRhIY\nKHD5I006AzbJOpTbtj95AGbfCXAmtutdjXH3qDwj+qyYSqMoVnPaTNey1cJPI6qM\nWDlbabeHLsjeqBifFsb5+OCxfDRXInzD5z9rvXc7z9tQl4tK6T4DlX3Ts/+Co4Uy\nsv1QcdEUUbgxK4ROP8QvHm7zUbv9ygheOE4MFFECMhXYOXo4r6e9ya9fb0PVSq67\nu7POPCQetOMY7qJvyPzuYrxRqzP68dh4HoSJzoU+j2DfDgY3AgMBAAGjgY4wgYsw\nJwYDVR0lBCAwHgYIKwYBBQUHAwIGCCsGAQUFBwMBBggrBgEFBQcDCTAgBggrBgEF\nBQcBAQQUMBIwEAYIKwYBBQUHMAGGBHRlc3QwHQYDVR0OBBYEFENEKAmmeewkHQxJ\nunQHwE+rpJ4MMA4GA1UdDwEB/wQEAwIBtjAPBgNVHRMBAf8EBTADAQH/MA0GCSqG\nSIb3DQEBCwUAA4IBAQBDZe4fYXz1GOU0cfmO5KGhVRoUG7gkRiqxElf3mDBrJCOf\nZVaIXq5dmH3XeQxJcfBpARIk1m705DCcDvXajORRDWJ50Kk0CvyXvW6XM5pq3Tai\nmBP3IcwLrxs/oErHyE56K+sXEpe9253WQuTFXrVph3j3jqUbr6w+mva86hfqBlXT\n1cakK4q2DAcVdjK9vw9wSaxVEEYAKATW6xV2YuXWm7Ug2RU9g5c9bI/HvObYpCeO\ntr8pbZWvleD8nbVKINR6YLVMamXxqEk1YkdTgCcJ2PBOx3w3O7FGnkWIrL3grzMm\nll5OvaZF9jgJd2kJ5c6zrFvWbT8vkU5mpVdUpftW\n-----END CERTIFICATE-----\n',
      details: '  [0]         Version: 3\n         SerialNumber: 1449216585246122075785627832691539938494567915812\n             IssuerDN: CN=myrootCa@test.com,O=test,OU=test,L=test,ST=test,C=test,T=test\n           Start Date: Wed Jan 24 16:00:00 GMT 2024\n           Final Date: Thu Jan 24 23:59:59 GMT 2030\n            SubjectDN: CN=test,O=test,OU=test,L=test,ST=test,C=test\n           Public Key: RSA Public Key [05:c4:31:47:e4:21:1e:da:6d:b2:97:b0:a4:2a:ce:0c:73:6d:b7:26],[56:66:d1:a4]\n        modulus: a314b8b9415fd4641d6c61130284227fd305d4555cbe0ecc16c7aa2c7f4278666434f4425f9cd9d3fd4983b89e37f204073ce611ba6817f306012cb62883bdf874aefda8793da4c80bd58915bbb233da150f251e8fe332b84bd439f6038d854b171ccf88fc15249b74bc7487756bc875c8613e09be34cf1a7cc5e1e91f2480dbdf31429ab0d73364412a468c393c09af7f8cb5d56efc4d242751c48909712dbbc33ccc310e31a82cbf6d95b644d3c59b079ea1a3c50d818a1a714625918882647dee43f6ce885b2334e25cf653df3bd678a3fa8e4004fb82051ee5f767ffc476699b9b3151e54c685628cc831215a72266802ffaa4f45e6b855314b3b19b9473a43f4d1bb8bd8f72819c42bba6790f8c02f1338492f8122164923e70a2f2bda1e8b27137f3dcb435ddb7125aab60fe9b407033bf86172ccdef1af640cb40d59c3e63ade6bac67469ecd5d644d161660511c82c288b09f5ed7f4fe90419e6faee97058e10f846004d45b979f2e5d061f8b9a6973f45af2b0edf2e2aee508fadfa7f8b8feb265e92bc816d8bbff9eba75ac41bffdff22f75e0ad8bf9e70c75a2be808574380bd80da4baf754bf9bda17610d64486ab633743be14794c25c2c76b7981d741ca92078b6c247ff00aee83c110daa18f77ce4ba8a9e10a88cb082e34c575b4b6bf8ffbace57f83b3adc0d60a8157ef254073e48bdeefd321d9062a237\npublic exponent: 10001\n\n  Signature Algorithm: SHA512WITHRSA\n            Signature: 4085275c59a4de20ef05b0411dcc64f0fbfa699d\n                       96a6f5f2ebc4cd8ff74f189ebbb594dd475f4adb\n                       8d7378e24dd7b15cc4db20f7c8d5f0f3a48d158c\n                       736e6c6afac36bfa0775e30f8418f4a66d7558f4\n                       8bf9a323905677252888ecc22336ad2d097a26f6\n                       8b77c35a01d8fa8ba891ea3086daf4986ccf866f\n                       8a9752a047614da0c335d3afb3c685e549c517f6\n                       b8fd494412748aed972f5c6b1612c80b306b4de8\n                       b2fd30dbddebff1889b7f3f0c49610df2a37ae91\n                       5a1592e9ff07338592c1c9bd6175fa0af87252ed\n                       cad7e49f7cb40d42779d0860d5b34e5ea8935d40\n                       9b3d0910f7ce0ff989dfb4e1a90d2ec1d333b519\n                       1cf44a2e768174846554a1c3b2290fc0\n       Extensions: \n                       critical(false) 2.5.29.14 value = DER Octet String[20] \n\n                       critical(false) 2.5.29.35 value = Sequence\n    Tagged [CONTEXT 0] IMPLICIT \n        DER Octet String[20] \n    Tagged [CONTEXT 1]\n        Tagged [CONTEXT 4]\n            Sequence\n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.3)\n                        UTF8String(myrootCa@test.com) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.10)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.11)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.7)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.8)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.6)\n                        PrintableString(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.12)\n                        UTF8String(test) \n    Tagged [CONTEXT 2] IMPLICIT \n        DER Octet String[21] \n\n                       critical(false) 1.3.6.1.4.1.311.20.2 value = IA5String(forIT11) \n\n                       critical(false) 2.5.29.37 value = Sequence\n    ObjectIdentifier(1.3.6.1.5.5.7.3.2)\n    ObjectIdentifier(1.3.6.1.4.1.40808.1.1.2)\n\n                       critical(false) 1.3.6.1.5.5.7.1.1 value = Sequence\n    Sequence\n        ObjectIdentifier(1.3.6.1.5.5.7.48.1)\n        Tagged [CONTEXT 6] IMPLICIT \n            DER Octet String[4] \n\n                       critical(true) KeyUsage: 0xa0\n',
      description: 'test',
      certificateType: null,
      status: ['VALID']
    },
    {
      id: 'cb61d82eb10e4f77931b026cdf3d2bc2',
      name: 'certificate2',
      commonName: 'certificate2',
      createDate: '2024-02-19T05:18:33Z',
      notBeforeDate: '2024-01-24T16:00:00Z',
      notAfterDate: '2030-01-24T23:59:59Z',
      email: '',
      revocationDate: '2024-01-25T16:00:00Z',
      revocationReason: 'revokeReason2',
      serialNumber: '5b9daab0d9dae4f65f2f608cdccdce344ce17d7c',
      shaThumbprint: 'AA9282FE55861773CF362CC9253DF3E2D24B5ADF',
      publicKeyBase64: '-----BEGIN CERTIFICATE-----\nMIIFpjCCBI6gAwIBAgIUW52qsNna5PZfL2CM3M3ONEzhfXwwDQYJKoZIhvcNAQEN\nBQAwdjEaMBgGA1UEAwwRbXlyb290Q2FAdGVzdC5jb20xDTALBgNVBAoMBHRlc3Qx\nDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgMBHRlc3QxDTAL\nBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3QwHhcNMjQwMTI0MTYwMDAwWhcNMzAw\nMTI0MjM1OTU5WjBaMQ0wCwYDVQQDDAR0ZXN0MQ0wCwYDVQQKDAR0ZXN0MQ0wCwYD\nVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0wCwYDVQQG\nEwR0ZXN0MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAm4HxBymRkBpw\nzL05VsHOYduU2ZSwcKj02lj26tVScFiVNsr7124ZwLuXoZQ+24n9o7CwbBOcDmeN\nggpAh1Qa9Mlr+a50Rsg+0wL3gSXtsbGKjwMh0VP88GEkvTzFVVuaQd0VU65aR5+e\n2bfTq3Bnh9laIeMUBpq39aQIAGxRfx58rJRNmaaILPv+HSN45XNBjhxDkrcQtD+V\n2BvOFyuJYLv9BdY5j2jQrAvMQrRJ/SltXy8pblN4hnEzJNO6zTKzgeTTLq6LYLf3\nPOJRD13NKcSaSwtsk+P9NhJSP0wryS7IkojFXOexIFTyn12b/zESmta1F2clapyQ\nIVE4iJ2z2fEEwXIm2ThNGqegwyfoRy9nhtKKu0kziM1tX4NXUdbSSYVMOafbXi9S\nR3YCBSKoo2rgQ/7GQ6qIjuqd9zLUtGpNu5o0djQ5ZaU5BTFTEg24R6AcYfQAEDGx\nOK5CgNZRr5vyMC+6qrbvkNjpPYy+cfMbbJkdQuRC/MSpDK2l4aRcI0omeghf+DNy\nIGm2uOVjaEu6wgrz6eJlbcp+6OFQOVjYRiAZr89Wcs9bgK9NsSTqeC2CA+ZHJuK6\nB2D16PCPJzd8hsqKanPNWzQ5SMbaTbDQ+zXc+IyX+fH7OogXOKeu4Q9UDUXWZKYc\n49mLxZ7yrax0AoV2N+9tPLI619jQQ3MCAwEAAaOCAUYwggFCMB0GA1UdDgQWBBS9\nfGFEfcL+v0VUJXA0VCNEpPQonjCBtAYDVR0jBIGsMIGpgBRDRCgJpnnsJB0MSbp0\nB8BPq6SeDKF6pHgwdjEaMBgGA1UEAwwRbXlyb290Q2FAdGVzdC5jb20xDTALBgNV\nBAoMBHRlc3QxDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgM\nBHRlc3QxDTALBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3SCFQCpWYzjxPulyUMS\nZC3eIkOS5GSRgDAWBgkrBgEEAYI3FAIECRYHZm9ySVQxMTAgBgNVHSUEGTAXBggr\nBgEFBQcDAgYLKwYBBAGCvmgBAQIwIAYIKwYBBQUHAQEEFDASMBAGCCsGAQUFBzAB\nhgR0ZXN0MA4GA1UdDwEB/wQEAwIFoDANBgkqhkiG9w0BAQ0FAAOCAQEAD2+/F1Hd\nYNgfbuarEs+6K2qEeTTOoja/lcp8AjYfG1nPhOd7Ii9azea1mIkwwJ78MizVKy4m\nHQw5sujcJj0ZUYNtjzbJjZj6gxOuE3NafS8+ZweaI40pVOHX/dDKvS9tCyruCNX2\ng74poqyzc1iVwXnekvHvl4DJeNunBvFYYJ/jOlZpgIuKcdLFzpfc+GRw14TO+kI6\nPzuLZxh7Ka0+H2yjqSQOBySBoqqnE72gVJT0NdfBVcHVLZ/1l0d0dzs8iN6XEEmA\nU5NDVtseN5kp3r3tJpp8WK+kBTfkUvuCTnZsorZfTlax3IptnQhHnrTgAI/BBvnI\nTSQW3+t0bXe/3Q==\n-----END CERTIFICATE-----\n',
      organization: 'test',
      keyLength: 4096,
      certificateTemplateId: '84d3b18d00964fe0b4740eedb6623930',
      certificateTemplateName: 'forIT11',
      certificateAuthoritiesId: '6362c7f967b24d6ab05ecf10ca05bd65',
      certificateAuthoritiesName: 'rootCaForIT1',
      locality: 'test',
      state: 'test',
      country: 'test',
      organizationUnit: 'test',
      keyUsage: [
        'DIGITAL_SIGNATURE',
        'KEY_ENCIPHERMENT'
      ],
      privateKeyBase64: '-----BEGIN RSA PRIVATE KEY-----\n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\n-----END RSA PRIVATE KEY-----\n',
      chain: '-----BEGIN CERTIFICATE-----\nMIIECjCCAvKgAwIBAgIVAKlZjOPE+6XJQxJkLd4iQ5LkZJGAMA0GCSqGSIb3DQEB\nCwUAMHYxGjAYBgNVBAMMEW15cm9vdENhQHRlc3QuY29tMQ0wCwYDVQQKDAR0ZXN0\nMQ0wCwYDVQQLDAR0ZXN0MQ0wCwYDVQQHDAR0ZXN0MQ0wCwYDVQQIDAR0ZXN0MQ0w\nCwYDVQQGEwR0ZXN0MQ0wCwYDVQQMDAR0ZXN0MB4XDTIyMTEzMDIwMDAwMFoXDTMz\nMTIzMTIwMDAwMFowdjEaMBgGA1UEAwwRbXlyb290Q2FAdGVzdC5jb20xDTALBgNV\nBAoMBHRlc3QxDTALBgNVBAsMBHRlc3QxDTALBgNVBAcMBHRlc3QxDTALBgNVBAgM\nBHRlc3QxDTALBgNVBAYTBHRlc3QxDTALBgNVBAwMBHRlc3QwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDGzjw2qYcJj9Y3gs3L/aOx09tj+OeKFDxDuoPN\n0urjOoCCYmfIQrdxjgPr+BGKCNeXjuAs4CPm/mOuvYUtIratqfbkQurRs0nXRhIY\nKHD5I006AzbJOpTbtj95AGbfCXAmtutdjXH3qDwj+qyYSqMoVnPaTNey1cJPI6qM\nWDlbabeHLsjeqBifFsb5+OCxfDRXInzD5z9rvXc7z9tQl4tK6T4DlX3Ts/+Co4Uy\nsv1QcdEUUbgxK4ROP8QvHm7zUbv9ygheOE4MFFECMhXYOXo4r6e9ya9fb0PVSq67\nu7POPCQetOMY7qJvyPzuYrxRqzP68dh4HoSJzoU+j2DfDgY3AgMBAAGjgY4wgYsw\nJwYDVR0lBCAwHgYIKwYBBQUHAwIGCCsGAQUFBwMBBggrBgEFBQcDCTAgBggrBgEF\nBQcBAQQUMBIwEAYIKwYBBQUHMAGGBHRlc3QwHQYDVR0OBBYEFENEKAmmeewkHQxJ\nunQHwE+rpJ4MMA4GA1UdDwEB/wQEAwIBtjAPBgNVHRMBAf8EBTADAQH/MA0GCSqG\nSIb3DQEBCwUAA4IBAQBDZe4fYXz1GOU0cfmO5KGhVRoUG7gkRiqxElf3mDBrJCOf\nZVaIXq5dmH3XeQxJcfBpARIk1m705DCcDvXajORRDWJ50Kk0CvyXvW6XM5pq3Tai\nmBP3IcwLrxs/oErHyE56K+sXEpe9253WQuTFXrVph3j3jqUbr6w+mva86hfqBlXT\n1cakK4q2DAcVdjK9vw9wSaxVEEYAKATW6xV2YuXWm7Ug2RU9g5c9bI/HvObYpCeO\ntr8pbZWvleD8nbVKINR6YLVMamXxqEk1YkdTgCcJ2PBOx3w3O7FGnkWIrL3grzMm\nll5OvaZF9jgJd2kJ5c6zrFvWbT8vkU5mpVdUpftW\n-----END CERTIFICATE-----\n',
      details: '  [0]         Version: 3\n         SerialNumber: 523034246409022721574999995590484643897172655484\n             IssuerDN: CN=myrootCa@test.com,O=test,OU=test,L=test,ST=test,C=test,T=test\n           Start Date: Wed Jan 24 16:00:00 GMT 2024\n           Final Date: Thu Jan 24 23:59:59 GMT 2030\n            SubjectDN: CN=test,O=test,OU=test,L=test,ST=test,C=test\n           Public Key: RSA Public Key [c7:0c:92:d6:a8:d7:c3:0c:50:0e:44:f2:06:e2:d2:78:ba:96:1a:9e],[56:66:d1:a4]\n        modulus: 9b81f1072991901a70ccbd3956c1ce61db94d994b070a8f4da58f6ead55270589536cafbd76e19c0bb97a1943edb89fda3b0b06c139c0e678d820a4087541af4c96bf9ae7446c83ed302f78125edb1b18a8f0321d153fcf06124bd3cc5555b9a41dd1553ae5a479f9ed9b7d3ab706787d95a21e314069ab7f5a408006c517f1e7cac944d99a6882cfbfe1d2378e573418e1c4392b710b43f95d81bce172b8960bbfd05d6398f68d0ac0bcc42b449fd296d5f2f296e537886713324d3bacd32b381e4d32eae8b60b7f73ce2510f5dcd29c49a4b0b6c93e3fd3612523f4c2bc92ec89288c55ce7b12054f29f5d9bff31129ad6b51767256a9c90215138889db3d9f104c17226d9384d1aa7a0c327e8472f6786d28abb493388cd6d5f835751d6d249854c39a7db5e2f524776020522a8a36ae043fec643aa888eea9df732d4b46a4dbb9a3476343965a539053153120db847a01c61f4001031b138ae4280d651af9bf2302fbaaab6ef90d8e93d8cbe71f31b6c991d42e442fcc4a90cada5e1a45c234a267a085ff833722069b6b8e563684bbac20af3e9e2656dca7ee8e1503958d8462019afcf5672cf5b80af4db124ea782d8203e64726e2ba0760f5e8f08f27377c86ca8a6a73cd5b343948c6da4db0d0fb35dcf88c97f9f1fb3a881738a7aee10f540d45d664a61ce3d98bc59ef2adac7402857637ef6d3cb23ad7d8d04373\npublic exponent: 10001\n\n  Signature Algorithm: SHA512WITHRSA\n            Signature: 0f6fbf1751dd60d81f6ee6ab12cfba2b6a847934\n                       cea236bf95ca7c02361f1b59cf84e77b222f5acd\n                       e6b5988930c09efc322cd52b2e261d0c39b2e8dc\n                       263d1951836d8f36c98d98fa8313ae13735a7d2f\n                       3e67079a238d2954e1d7fdd0cabd2f6d0b2aee08\n                       d5f683be29a2acb3735895c179de92f1ef9780c9\n                       78dba706f158609fe33a5669808b8a71d2c5ce97\n                       dcf86470d784cefa423a3f3b8b67187b29ad3e1f\n                       6ca3a9240e072481a2aaa713bda05494f435d7c1\n                       55c1d52d9ff5974774773b3c88de971049805393\n                       4356db1e379929debded269a7c58afa40537e452\n                       fb824e766ca2b65f4e56b1dc8a6d9d08479eb4e0\n                       008fc106f9c84d2416dfeb746d77bfdd\n       Extensions: \n                       critical(false) 2.5.29.14 value = DER Octet String[20] \n\n                       critical(false) 2.5.29.35 value = Sequence\n    Tagged [CONTEXT 0] IMPLICIT \n        DER Octet String[20] \n    Tagged [CONTEXT 1]\n        Tagged [CONTEXT 4]\n            Sequence\n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.3)\n                        UTF8String(myrootCa@test.com) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.10)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.11)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.7)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.8)\n                        UTF8String(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.6)\n                        PrintableString(test) \n                Set\n                    Sequence\n                        ObjectIdentifier(2.5.4.12)\n                        UTF8String(test) \n    Tagged [CONTEXT 2] IMPLICIT \n        DER Octet String[21] \n\n                       critical(false) 1.3.6.1.4.1.311.20.2 value = IA5String(forIT11) \n\n                       critical(false) 2.5.29.37 value = Sequence\n    ObjectIdentifier(1.3.6.1.5.5.7.3.2)\n    ObjectIdentifier(1.3.6.1.4.1.40808.1.1.2)\n\n                       critical(false) 1.3.6.1.5.5.7.1.1 value = Sequence\n    Sequence\n        ObjectIdentifier(1.3.6.1.5.5.7.48.1)\n        Tagged [CONTEXT 6] IMPLICIT \n            DER Octet String[4] \n\n                       critical(true) KeyUsage: 0xa0\n',
      description: null,
      certificateType: null,
      status: ['VALID']
    }
  ]
}

export const caList = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: '1',
      name: 'CA-1',
      status: ['VALID']
    },
    {
      id: '2',
      name: 'CA-2',
      status: ['VALID']
    }
  ]
}

export const certList = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: '1',
      name: 'Server-Cert-1',
      commonName: 'Server-Cert-1',
      extendedKeyUsages: [ExtendedKeyUsages.SERVER_AUTH],
      status: ['VALID']
    },
    {
      id: '2',
      name: 'Client-Cert-1',
      commonName: 'Client-Cert-1',
      extendedKeyUsages: [ExtendedKeyUsages.CLIENT_AUTH],
      status: ['VALID']
    }
  ]
}
