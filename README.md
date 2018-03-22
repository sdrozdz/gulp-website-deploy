>Zip and deploy files to ftp server

## Install

```
$ npm install --save gulp-website-deploy
```

## Usage
```js
const gulp = require('gulp');
const websiteDeploy = require('gulp-website-deploy');

gulp.task('deploy', () =>
    websiteDeploy({
        ftpConfig: '.ftp',
        url: '',
        directory: 'testpkg',
        destination: 'deploy',
        name: 'LP',
        dateFormat: 'YYYYMMDD_HHmmSS',
        zip: false,
        password: ''
    });	
);
```

## API

### websiteDeploy([options])

#### ftpConfig
  
Path to ftp config file in json format. Default: `'.ftp'`
  
Type: `string`

Supports config from [ftp](https://www.npmjs.com/package/ftp) package. For example: 
```json
{
  "host": "",
  "port": 21,
  "user": "",
  "password": ""
}
```

#### url
  
Url from which site will be served. Default: `''` 
  
Type: `string`

#### directory
  
Source directory of package to process. Default: `'testpkg'` 
  
Type: `string`

#### destination
  
Destination directory on remote server. Default: `'deploy'` 
  
Type: `string`

#### dateFormat
  
Format of date which will be appended to uploaded package. Default: `'YYYYMMDD_HHmmSS'` 
  
Type: `string`

#### zip
  
Should script create and upload zip file. Default: `false` 
  
Type: `boolean`

#### password
  
Password to be applied for zip package. Requires `zip` command in shell path. Default: `''` 
  
Type: `string`
