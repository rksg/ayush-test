This doc is for I18n management for local development  

### Extraction
```sh
 npm run extract -- 'apps/main/src/**/*.ts*' --ignore='**/*.d.ts' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '[$t]' 
 ```

### Compiling Messages
```sh
npm run compile -- apps/main/src/locales/en-US.json --ast --out-file compiled-lang/en-US.json
```

### OR Extract & Compile
```sh
npm run formatjs extract 'apps/*/src/**/*.ts*' --ignore='**/*.d.ts' --out-file temp.json --flatten --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '[$t]' 
&& formatjs compile 'temp.json' --out-file apps/main/src/locales/en-US.json 
&& rm temp.json 
```

### Translation Management System (TMS) Integration
```sh
npm run extract -- 'apps/main/src/**/*.ts*' --ignore='**/*.d.ts' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --format formatter.js
```

