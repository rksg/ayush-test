const gc = require('expose-gc/function')

afterAll(() => {
  // eslint-disable-next-line no-console
  console.log('=====OOM Tuning: afterAll=====')
  if (gc) {
    // eslint-disable-next-line no-console
    console.log('=====OOM Tuning: afterAll - gc starts=====')
    gc()
    // eslint-disable-next-line no-console
    console.log('=====OOM Tuning: afterAll - gc ends=====')
  }
})
