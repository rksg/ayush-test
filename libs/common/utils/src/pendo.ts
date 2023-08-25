import { get } from '@acx-ui/config'

declare global {
  var pendo: { // eslint-disable-line no-var
    initialize(init: Record<string, Record<string, string | boolean>>): void
  }
  function pendoInitalization (): Promise<void>
}

export type PendoParameters = {
  visitor: {
    id: string
    full_name: string
    username: string
    email: string
    role: string
    region: string
    version: string
    support: boolean
    dogfood: boolean
    delegated: boolean
    var: boolean
    varTenantId: string
  },
  account: {
    productName: 'RuckusOne' | 'RuckusAi'
    id: string
    name: string
  }
}

export function renderPendo (pendoInitalization: () => Promise<PendoParameters>) {
  if (get('DISABLE_PENDO') === 'false') {
    const key = get('PENDO_API_KEY')
    const script = document.createElement('script')
    script.setAttribute('nonce', 'pendo-inline-script')
    script.defer = true
    /* eslint-disable max-len */
    script.appendChild(document.createTextNode(`
      (function(apiKey){
      (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=[];
        v=['initialize','identify','updateOptions','pageLoad'];for(w=0,x=v.length;w<x;++w)(function(m){
        o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
        y=e.createElement(n);y.async=!0;y.onload=window.pendoInitalization;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
        z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
      })('${key}');
    `))
    /* eslint-enable max-len */
    window.pendoInitalization = async () => window.pendo.initialize(await pendoInitalization())
    document.body.appendChild(script)
  }
}
