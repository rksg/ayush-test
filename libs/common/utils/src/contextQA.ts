import { get } from '@acx-ui/config'
export function renderContextQA () {
  // eslint-disable-next-line no-console
  console.log(get('ENABLE_CONTEXTQA'))
  if (get('ENABLE_CONTEXTQA') === 'true') {
    const key = get('CONTEXT_QA_KEY')
    const script = document.createElement('script')
    script.setAttribute('nonce', 'contextQA')
    script.defer = true
    script.appendChild(document.createTextNode(`
      !function(t,e){var
          o,n,p,r;e.__SV||(window.contextqa=e,e._i=[],e.init=function(i){
          window.cqakey = i;
          const script = document.createElement('script');
          script.src = "https://cqa-media.s3.us-east-2.amazonaws.com/contextqa_init.js";
          document.head.appendChild(script);
          },e.__SV=1)}(document,window.contextqa||[]);
          window.contextqa.init(${key});
    `))
    document.body.appendChild(script)
  }
}