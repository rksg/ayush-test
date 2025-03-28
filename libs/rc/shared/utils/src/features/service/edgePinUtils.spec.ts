import { genDhcpConfigByPinSetting } from './edgePinUtils'

describe('Network Segmentation Utils', () => {

  const keaConfig = `{
    "Dhcp4": {
      "subnet4": [{
        "subnet": "192.168.0.0/24",
        "pools": [
          { "pool": "192.168.0.2 - 192.168.0.254" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.0.1"
          }
        ]
      },{
        "subnet": "192.168.1.0/24",
        "pools": [
          { "pool": "192.168.1.2 - 192.168.1.254" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.1.1"
          }
        ]
      },{
        "subnet": "192.168.2.0/24",
        "pools": [
          { "pool": "192.168.2.2 - 192.168.2.254" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.2.1"
          }
        ]
      },{
        "subnet": "192.168.3.0/24",
        "pools": [
          { "pool": "192.168.3.2 - 192.168.3.254" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.3.1"
          }
        ]
      },{
        "subnet": "192.168.4.0/24",
        "pools": [
          { "pool": "192.168.4.2 - 192.168.4.254" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.4.1"
          }
        ]
      },{
        "subnet": "192.168.5.0/24",
        "pools": [
          { "pool": "192.168.5.2 - 192.168.5.254" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.5.1"
          }
        ]
      },{
        "subnet": "192.168.6.0/24",
        "pools": [
          { "pool": "192.168.6.2 - 192.168.6.254" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.6.1"
          }
        ]
      },{
        "subnet": "192.168.7.0/24",
        "pools": [
          { "pool": "192.168.7.2 - 192.168.7.254" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.7.1"
          }
        ]
      },{
        "subnet": "192.168.8.0/24",
        "pools": [
          { "pool": "192.168.8.2 - 192.168.8.254" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.8.1"
          }
        ]
      },{
        "subnet": "192.168.9.0/24",
        "pools": [
          { "pool": "192.168.9.2 - 192.168.9.254" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "192.168.9.1"
          }
        ]
      }
      ]
    }
  }`

  const iscConfig = `subnet 192.168.0.0 netmask 255.255.255.0 {
    range 192.168.0.2 192.168.0.254;
    option routers 192.168.0.1;
}

subnet 192.168.1.0 netmask 255.255.255.0 {
    range 192.168.1.2 192.168.1.254;
    option routers 192.168.1.1;
}

subnet 192.168.2.0 netmask 255.255.255.0 {
    range 192.168.2.2 192.168.2.254;
    option routers 192.168.2.1;
}

subnet 192.168.3.0 netmask 255.255.255.0 {
    range 192.168.3.2 192.168.3.254;
    option routers 192.168.3.1;
}

subnet 192.168.4.0 netmask 255.255.255.0 {
    range 192.168.4.2 192.168.4.254;
    option routers 192.168.4.1;
}

subnet 192.168.5.0 netmask 255.255.255.0 {
    range 192.168.5.2 192.168.5.254;
    option routers 192.168.5.1;
}

subnet 192.168.6.0 netmask 255.255.255.0 {
    range 192.168.6.2 192.168.6.254;
    option routers 192.168.6.1;
}

subnet 192.168.7.0 netmask 255.255.255.0 {
    range 192.168.7.2 192.168.7.254;
    option routers 192.168.7.1;
}

subnet 192.168.8.0 netmask 255.255.255.0 {
    range 192.168.8.2 192.168.8.254;
    option routers 192.168.8.1;
}

subnet 192.168.9.0 netmask 255.255.255.0 {
    range 192.168.9.2 192.168.9.254;
    option routers 192.168.9.1;
}\n\n`
  it('genDhcpConfigByPinSetting successfully', () => {
    const configs = genDhcpConfigByPinSetting('192.168.0.1','192.168.11.200',10,253)
    expect(configs.keaDhcpConfig).toBe(keaConfig)
    expect(configs.iscDhcpConfig).toBe(iscConfig)
  })

  it('genDhcpConfigByPinSetting failed', () => {
    const mockedErrorHandler = jest.fn()
    try{
      genDhcpConfigByPinSetting('10.0.0.1', '10.0.10.100', 100, 253)
    }catch(err) {
      mockedErrorHandler(err)
    }
    expect(mockedErrorHandler).toBeCalledWith(
      new Error(`error: DHCP pool size is too small to configure 100 PANs
    Currently range can hold 10 number of PANs`)
    )
  })

})