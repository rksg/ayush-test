import type { PendoParameters } from './pendo'

jest.mock('@acx-ui/config')

describe('renderPendo', () => {
  let renderPendo: (init: () => Promise<PendoParameters>) => void
  let get = jest.fn()
  let appendChild: jest.SpyInstance<Node, [node: Node]>
  let createTextNode: jest.SpyInstance<Text, [data: string]>
  beforeEach(() => {
    jest.resetModules()
    renderPendo = require('./pendo').renderPendo
    get = require('@acx-ui/config').get
    appendChild = jest.spyOn(document.body, 'appendChild')
    createTextNode = jest.spyOn(document, 'createTextNode')
  })
  afterEach(() => {
    appendChild.mockRestore()
    createTextNode.mockRestore()
  })
  it('does not render when DISABLE_PENDO is not false', () => {
    get.mockImplementationOnce(() => 'true')
    renderPendo(() => ({} as Promise<PendoParameters>))
    expect(window.pendoInitalization).toBe(undefined)
    expect(appendChild).not.toHaveBeenCalled()
  })
  it('renders when DISABLE_PENDO is false', async () => {
    get.mockImplementation((name: string) => ({
      DISABLE_PENDO: 'false',
      PENDO_API_KEY: 'key1'
    })[name] as string)
    const data = {
      visitor: {
        id: 'id1',
        full_name: 'full_name1',
        username: 'sub1',
        email: 'email1',
        role: 'role1',
        region: 'region1',
        version: 'version1',
        support: true,
        dogfood: false,
        delegated: false,
        var: false,
        varTenantId: 'varTenantId1'
      },
      account: {
        productName: 'RuckusOne',
        id: 'id2',
        name: 'name2'
      }
    }
    renderPendo(() => Promise.resolve(data) as Promise<PendoParameters>)
    expect(appendChild).toHaveBeenCalled()
    /* eslint-disable max-len */
    expect(createTextNode).toHaveBeenCalledWith(`
      (function(apiKey){
      (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=[];
        v=['initialize','identify','updateOptions','pageLoad'];for(w=0,x=v.length;w<x;++w)(function(m){
        o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
        y=e.createElement(n);y.async=!0;y.onload=window.pendoInitalization;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
        z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
      })('key1');
    `)
    /* eslint-enable max-len */
    window.pendo = { initialize: jest.fn() }
    await window.pendoInitalization()
    expect(window.pendo.initialize).toHaveBeenCalledWith(data)
  })
})
