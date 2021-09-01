# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.0](https://github.com/sonrad10/Whide/compare/v2.0.0...v2.1.0) (2021-09-01)


### Features

* added an "unsaved" marker to the code editor tabs ([0370488](https://github.com/sonrad10/Whide/commit/03704889cdd1107f9f24abfe215e82a3a8e19d47))
* added automatic browser dark theme detection ([1620436](https://github.com/sonrad10/Whide/commit/16204363a6bb1625f18341225a250fec15805049))
* added autosave for editor files ([00a12d4](https://github.com/sonrad10/Whide/commit/00a12d479edf19615a85e736afdbe3b9acbf2db8))
* added error highlighting support for extended WHILE ([9bf37b4](https://github.com/sonrad10/Whide/commit/9bf37b461dfe6eb3b16a2a7253ec43f2b0992f9c))
* added linting for pure WHILE programs ([8c0af8e](https://github.com/sonrad10/Whide/commit/8c0af8ee1bbac34700c521d60a4ba5c49088685d))
* added support for run configurations ([8686f7a](https://github.com/sonrad10/Whide/commit/8686f7a79cc62067b66f9101338a9ca75a05e0ff))
* added support for running code with While.js ([fd3b36b](https://github.com/sonrad10/Whide/commit/fd3b36beb8286e230d12a86c7e962c1ee5717066))
* created files now open in the editor after creation ([6ade94d](https://github.com/sonrad10/Whide/commit/6ade94dd03f728c47fd53aec842f600f0087818b))
* made file picker refresh when a folder is reopened ([dd11488](https://github.com/sonrad10/Whide/commit/dd114885be3ed1572dbae93584c230b48899f0fa))
* run and debug options disable when unavailable ([2aff784](https://github.com/sonrad10/Whide/commit/2aff784a3b1f154bb738420fba169d27aeefd64e))
* used file watchers to automatically update the file picker when the filesystem changes ([d04b73d](https://github.com/sonrad10/Whide/commit/d04b73d3335278a537bb55c714f67027ebe45c54))


### Bug Fixes

* fixed electron not building compiled versions ([1930c97](https://github.com/sonrad10/Whide/commit/1930c97ad81b7feafe9abccd919059760c6ca3cf))
* fixed ERR_STREAM_WRITE_AFTER_END error when debugging with HWhile ([df2612a](https://github.com/sonrad10/Whide/commit/df2612acb263b2ffee3dc8e8c65ce1b4a09c4bc4))
* improved styling for code editor tabs ([f36a23a](https://github.com/sonrad10/Whide/commit/f36a23a946409f0470025ca90b0f4410ae918b47))
* improved tabbed panel stylings ([f61fa1f](https://github.com/sonrad10/Whide/commit/f61fa1fe2391357af3049091ecbe80a2944e58dc))
* improved the "new file" interface ([8a75c17](https://github.com/sonrad10/Whide/commit/8a75c17b58cd49eb1728596e862e282eff66ae2c))
* made code editor fill the whole space ([a584000](https://github.com/sonrad10/Whide/commit/a584000603b9289029afd3ec41150f8f9ea4dc6c))
* moved "delete file/folder" popup into its own element to match with new file/folder ([a234df8](https://github.com/sonrad10/Whide/commit/a234df8f301e29d6b7ded037a58b492d114ac69d))
* Removed hangover '/settings' URL path ([84b9ed8](https://github.com/sonrad10/Whide/commit/84b9ed838d4c6521c4e4bce14e0f47acace13cd7))
* stopped error messages being shown as intrusive alerts ([1da00d2](https://github.com/sonrad10/Whide/commit/1da00d2632498dc485deac15d1458fb466bb39fb))

## [2.0.0](https://github.com/sonrad10/Whide/compare/v1.8.1...v2.0.0) (2021-06-16)


### Features

* improved run panel behind-the-scenes to support better debugging in the future ([516098e](https://github.com/sonrad10/Whide/commit/516098e75c947b9465adcea2312311fb0492ca49))
* refactored running/debugging process ([c4db0a0](https://github.com/sonrad10/Whide/commit/c4db0a09c4ff757966c9711360578df54cba9520))


### Bug Fixes

* error where no files would show if there was an error reading one ([e1a4a22](https://github.com/sonrad10/Whide/commit/e1a4a2288fd676c877a13fd7ba56cc1db3de5322))
* opening a tree in the viewer from the debug panel also transfers the conversion string ([1ada496](https://github.com/sonrad10/Whide/commit/1ada496f0a750d1214300ec873bb3e35fa25bbe6))

### [1.8.1](https://github.com/sonrad10/Whide/compare/v1.8.0...v1.8.1) (2021-05-10)


### Bug Fixes

* fixed programs not running with `nil` as input ([d01f4c8](https://github.com/sonrad10/Whide/commit/d01f4c8da92b2ea5df7ab49927019af68595b72a))
* fixed type error on build ([297eb65](https://github.com/sonrad10/Whide/commit/297eb65288c5aebcfc336e7145ec06cd5c70bf70))

## [1.8.0](https://github.com/sonrad10/Whide/compare/v1.7.0...v1.8.0) (2021-05-10)


### Features

* added a tree viewer to the input expression prompt ([9564b8e](https://github.com/sonrad10/Whide/commit/9564b8e78e8efadc3046a9e8453f233a52fd568e))
* made the tree viewer show using the full page ([87e7d6a](https://github.com/sonrad10/Whide/commit/87e7d6aed4b30ad6b73951d4ee32d91db311e76e))


### Bug Fixes

* tree viewer updates when an input is submitted with the enter key ([6e46ea8](https://github.com/sonrad10/Whide/commit/6e46ea8bf48dddddf14545b13da38c2161f35eac))
* updated dependencies with security vulnerabilities ([9d31349](https://github.com/sonrad10/Whide/commit/9d313498e151f25a8fa36c230ce965ece4af031a))
* updated tree-lang dependency to latest version ([1562aae](https://github.com/sonrad10/Whide/commit/1562aae46c3dc8d25b5aa8934a20ef52a44d17d4))

## [1.7.0](https://github.com/sonrad10/Whide/compare/v1.6.0...v1.7.0) (2021-05-03)


### Features

* switched to using the tree-lang tree parser to provide support for parsing numbers, lists, trees, and booleans ([4469367](https://github.com/sonrad10/Whide/commit/4469367f8c97ce619a13eafa343a8fa8c9a7ac47))


### Bug Fixes

* trees in the output panel no longer display on a new line ([af8014f](https://github.com/sonrad10/Whide/commit/af8014f5fe347a5ec6f66c3e7b434fdcaeb573cc))
* updated hwhile-wrapper to latest version ([4431557](https://github.com/sonrad10/Whide/commit/44315575cd6dcd070e91e9efdf6d256d845b47a8))

## [1.6.0](https://github.com/sonrad10/Whide/compare/v1.5.5...v1.6.0) (2021-05-02)


### Features

* added a popup tree viewer to the run panel output ([1c4551f](https://github.com/sonrad10/Whide/commit/1c4551fbea287d8bfcd38d08a961278b09302c4d))
* added maximum tree zoom-out level ([ad24f6f](https://github.com/sonrad10/Whide/commit/ad24f6f0e5c34feb9825c6af3843697e9b273f26))
* added support for booleans and literal integers (0,1,2,...) to the conversion language ([9dd5c7a](https://github.com/sonrad10/Whide/commit/9dd5c7a9805c5c9de4d64458cdd277f69e610a1e))
* set the tree viewer initial zoom level to show the entire graph ([ffa0043](https://github.com/sonrad10/Whide/commit/ffa0043f45db653cb54b8cc1064bb772c59af7d5))
* the converted tree value is shown in the run panel when set in the popup viewer ([eede526](https://github.com/sonrad10/Whide/commit/eede52627723f0fa0f4c2d391c7d113212605680))


### Bug Fixes

* fixed popover arrow covering content ([e40e7b7](https://github.com/sonrad10/Whide/commit/e40e7b7c659c5cdb702b832a11dc263e4b00af94))
* fixed run panel trees being hidden if there is a conversion error ([148068e](https://github.com/sonrad10/Whide/commit/148068e1b9f4fcdf198b9933e57d725d9618b5ec))
* fixed tree viewer conversion strings not working ([7f0f332](https://github.com/sonrad10/Whide/commit/7f0f332f524d6bc6a57ae58b1ab0aa865be47632))
* fixed typo ([ff6a59d](https://github.com/sonrad10/Whide/commit/ff6a59d674f6400a7a93f414ef30a0ba996598ba))
* increased popup tree viewer size ([38e5c86](https://github.com/sonrad10/Whide/commit/38e5c8622562210b6586a1f52d92d5acb937070b))
* made only the first level of lists display in green ([ce2fb41](https://github.com/sonrad10/Whide/commit/ce2fb4131370324b11e8aa2642ca36907b08aa61))
* made popup tree viewer use flexboxes ([cbbdf0d](https://github.com/sonrad10/Whide/commit/cbbdf0d3335b1b437c4a0514a98334990652bd7e))
* made the tree viewers expand with the page ([0b09378](https://github.com/sonrad10/Whide/commit/0b09378fb5591063559fcd2ea029cf5a1c3da54d))
* opening tree viewer from popup transfers the converter string ([d825aaa](https://github.com/sonrad10/Whide/commit/d825aaadcddeae7335580dba5d8720a558238efd))
* panning/zooming in the popup tree viewer doesn't affect the other viewer ([a170705](https://github.com/sonrad10/Whide/commit/a170705ca2bba27fac4c26aeb78026f28bd8bfba))
* popup tree viewer now displays the actual tree instead of 2 ([eb274ad](https://github.com/sonrad10/Whide/commit/eb274ad59dc80a0cc119c4015f9589a0720bc36a))
* removed redundant code ([248ff0c](https://github.com/sonrad10/Whide/commit/248ff0cbd0a609e32d87947fffc574eb26dd4289))
* renamed tree viewer focus button ([0a26ead](https://github.com/sonrad10/Whide/commit/0a26eadf28f35d74bc7696b8a8ff556a42f13e73))
* sped up rendering of large trees by combining components ([3e24369](https://github.com/sonrad10/Whide/commit/3e24369b00a9f82d164d991d1a31c96b7d10b2cc))
* stopped tree viewer displaying above other popups ([336dd2d](https://github.com/sonrad10/Whide/commit/336dd2d5d95d9edd56c9c5caca251f46138c8131))
* trees display centred in the viewer ([58e37b1](https://github.com/sonrad10/Whide/commit/58e37b19502a6833112ce6a738fb73e0ed89ef5c))

### [1.5.5](https://github.com/sonrad10/Whide/compare/v1.5.4...v1.5.5) (2021-04-24)


### Bug Fixes

* breakpoints are maintained when switching between tabs ([ef35fb8](https://github.com/sonrad10/Whide/commit/ef35fb870d66bf8dc1329228831d31278febf2b3))
* fixed tree viewer not scaling properly for large trees ([2699de0](https://github.com/sonrad10/Whide/commit/2699de03cc3c993ec0dcf9808a279f740bed508b))
* issue where only the first open tab was run ([b274c96](https://github.com/sonrad10/Whide/commit/b274c960a25f9542a88cd5cf6d412b5fb849982f))
* removed unused dependencies ([fbc0c45](https://github.com/sonrad10/Whide/commit/fbc0c45e8b6ce042e338a0454dc74fe42f940abc))

### [1.5.4](https://github.com/sonrad10/Whide/compare/v1.5.3...v1.5.4) (2021-04-12)


### Bug Fixes

* added save confirmation popup ([ca937a8](https://github.com/sonrad10/Whide/commit/ca937a89c6f41346beb994b7346c493901a1ec50))

### [1.5.3](https://github.com/sonrad10/Whide/compare/v1.5.2...v1.5.3) (2021-04-12)


### Bug Fixes

* fixed unable to change root directory ([9028197](https://github.com/sonrad10/Whide/commit/9028197257d5c297ddf10f1e3fe098a65e68e6f5))

### [1.5.2](https://github.com/sonrad10/Whide/compare/v1.5.1...v1.5.2) (2021-04-10)


### Bug Fixes

* removed unnecessary converter plugin ([5dd34f8](https://github.com/sonrad10/Whide/commit/5dd34f8b85db97d7d3d646ff3d210c1c5667e6d7))

### [1.5.1](https://github.com/sonrad10/Whide/compare/v1.5.0...v1.5.1) (2021-04-09)


### Bug Fixes

* fixed misaligned tree viewer buttons in full screen ([891f207](https://github.com/sonrad10/Whide/commit/891f2075a2f2071f1ccba2f5f0189273027dd5fa))
* removed hangover tree converter usages ([ebf5a38](https://github.com/sonrad10/Whide/commit/ebf5a38eb5e7536910c9bfa27cedc7b94f760155))

## [1.5.0](https://github.com/sonrad10/Whide/compare/v1.4.0...v1.5.0) (2021-04-09)


### Features

* added button to open settings window ([0086abf](https://github.com/sonrad10/Whide/commit/0086abf32b05e11ef41d8fee7f92ca12f0408db7))
* added global error catchers to display errors to the user ([e60fc35](https://github.com/sonrad10/Whide/commit/e60fc35d7f33d2751c20d332b855ef36736f541b))
* added popup support for prompts with arbitrary buttons ([6b334de](https://github.com/sonrad10/Whide/commit/6b334dee4d00e6abae1ab934de87d172bcdc2bbb))
* added zoom buttons to tree viewer ([7914a49](https://github.com/sonrad10/Whide/commit/7914a4977b1934073a4107cea7556c02ffe4db11))
* allowed changing directory from the file picker ([3f16b18](https://github.com/sonrad10/Whide/commit/3f16b18cf419bb613e8eeb498165f858e1b20aa9))
* made the debugger variable viewer use the conversion language ([9bea83b](https://github.com/sonrad10/Whide/commit/9bea83b65598d922ce85dbd65f1dcf7d5576cfa5))
* removed converters from the plugin system ([194acd5](https://github.com/sonrad10/Whide/commit/194acd50178ba5fb17bb67cc62c5153b3992d335))


### Bug Fixes

* added running error if hwhile path is not set in settings ([f3ba9f0](https://github.com/sonrad10/Whide/commit/f3ba9f0bea35102fd5662ecbf20b4ad94c001297))
* added scrollbar back to the file picker ([ed0f5f4](https://github.com/sonrad10/Whide/commit/ed0f5f4e98c41094533132fd78f1faf4ec95b1d5))
* clicking on a tree in program output opens the right page ([9937a70](https://github.com/sonrad10/Whide/commit/9937a7075f4bab447fe0f9ac5e8500c9738c3e20))
* deleted virtual folders are now persisted ([b66cb43](https://github.com/sonrad10/Whide/commit/b66cb4354c3897e952f01ff6a4387b7213848ed0))
* fixed `getInput` always returning undefined ([81ce4d5](https://github.com/sonrad10/Whide/commit/81ce4d588485363270fce17f90d4a5dd57243412))
* fixed menu items not always triggering when clicked ([db20e3b](https://github.com/sonrad10/Whide/commit/db20e3bf6cc6fa0c323a30d412a8d61fa8ff811f))
* fixed new files being created as folders ([cb251ee](https://github.com/sonrad10/Whide/commit/cb251ee4de2ee2e6aafb5487d95c43ff7703ef3a))
* fixed program run output not showing without selecting a tab ([08cb63d](https://github.com/sonrad10/Whide/commit/08cb63d945f6fb79096371fc561cab01b52f4b55))
* fixed scrolling in the run panel ([13ba2b5](https://github.com/sonrad10/Whide/commit/13ba2b5e65662b2b36b17ebfd84801536fe525f7))
* fixed tree viewer scaling breaking on resisize ([be18233](https://github.com/sonrad10/Whide/commit/be1823343e540ab76bac3891d378bf6dce215e19))
* fixed tree-lang dependency breaking build ([f2caff4](https://github.com/sonrad10/Whide/commit/f2caff4b98997f60bdb114a7168c35fe4b19766a))
* improved new folder / delete popup messages ([778e43c](https://github.com/sonrad10/Whide/commit/778e43c566aa4578a79e8375e8c2640ef921c404))
* improved run/debug popup messages ([f1d9e7e](https://github.com/sonrad10/Whide/commit/f1d9e7e19b3ebae13ce8b8747101604b53b28d2a))
* improved the menubar styling ([c3b7225](https://github.com/sonrad10/Whide/commit/c3b7225ee5f42c1d4f824cdfb244fae8a9efc9f6))
* made settings show the last saved settings value in inputs ([ab4d9c2](https://github.com/sonrad10/Whide/commit/ab4d9c2acd9c8fdf161a932d4fe90ed509e1847e))
* plugins without settings are hidden from the settings window ([768caa8](https://github.com/sonrad10/Whide/commit/768caa8953e24e45bdacbab5d9a1189a0b606c58))
* popups preserve line breaks ([6772fb5](https://github.com/sonrad10/Whide/commit/6772fb5d4e893268f5b1b0332314f38e2469727b))
* refactored/changed styling around inputs to improve input prompts ([9af2f5d](https://github.com/sonrad10/Whide/commit/9af2f5d47839256bbcdb92db165287643c025f39))
* removed finished TODO ([9e3ec5d](https://github.com/sonrad10/Whide/commit/9e3ec5d8b040ddeaf898c447e8abc9b748fe8f97))
* run panel opens new tabs automatically ([b28a830](https://github.com/sonrad10/Whide/commit/b28a830ed51d10097c16d862d0c60459680e7841))
* tree viewer no longer scrolls externally when zooming ([7a14d57](https://github.com/sonrad10/Whide/commit/7a14d576fe8bc025d9278b8a05566d20b92ebac0))
* tree viewer opens in a better sized window ([cbbb575](https://github.com/sonrad10/Whide/commit/cbbb575814cbb7244e92802e3699b8a6dc0a6fa0))
* tree viewer zooming is now consistent across browsers ([f6195c3](https://github.com/sonrad10/Whide/commit/f6195c369da9ee5e6e26ec712d25ed2a94a8d9fc))
* updated dependencies ([c3c8659](https://github.com/sonrad10/Whide/commit/c3c86598872c057195a6093868c0c8918d4eb2fe))

## [1.4.0](https://github.com/sonrad10/Whide/compare/v1.3.0...v1.4.0) (2021-04-04)


### Features

* added a help message with descriptions to input elements ([a230c19](https://github.com/sonrad10/Whide/commit/a230c19cb050a642aea606d3e088fb1e6183959d))
* added a settings page ([db9da20](https://github.com/sonrad10/Whide/commit/db9da203fd0d97e3d9b67db3cadf9e558090d318))
* added support for the tree conversion language ([fa1d69e](https://github.com/sonrad10/Whide/commit/fa1d69e00d2b6d47b3de00126a213fc50c106750))
* made list node elements display in a different colour ([022633a](https://github.com/sonrad10/Whide/commit/022633a33705157cf9191858c59f9e14c209166b))
* made settings persist across restarts ([a4482bb](https://github.com/sonrad10/Whide/commit/a4482bb6167e2c22d99e6055226f9dc57fb88df0))
* plugin descriptions are loaded from the package.json file ([5024c23](https://github.com/sonrad10/Whide/commit/5024c2379b885bcdacd76f89dc5e59ee412d2680))
* plugins can define settings for the settings menu ([bf14593](https://github.com/sonrad10/Whide/commit/bf145938320036540fc38e01510d5485381b423a))
* refactored to move specialist input elements into their own components ([429d6dd](https://github.com/sonrad10/Whide/commit/429d6dd058aba60a29eb771b350da72d17aaf9f0))


### Bug Fixes

* fixed using local package paths instead of versions ([92b191b](https://github.com/sonrad10/Whide/commit/92b191bfcc1d23b1997a4bae7df9bf4ac6c8f55b))

## [1.3.0](https://github.com/sonrad10/Whide/compare/v1.2.0...v1.3.0) (2021-03-26)


### Features

* allowed changing FilePicker root folder ([52711d5](https://github.com/sonrad10/Whide/commit/52711d53722e69c8f0943fd1dd91202a1842445f))
* folders can be expanded and collapsed in the file picker ([3bc4cb0](https://github.com/sonrad10/Whide/commit/3bc4cb05328a7bb7223b510ffd406c4a30377617))


### Bug Fixes

* added missing type declaration ([d3407e9](https://github.com/sonrad10/Whide/commit/d3407e9c0fbd6307dc983208da87e936dfab8296))
* double click to expand folders ([d916bdf](https://github.com/sonrad10/Whide/commit/d916bdff296c3a0fc2adf2dc3434c74e758aec5c))
* minor styling refactoring ([c8513db](https://github.com/sonrad10/Whide/commit/c8513dba91b9a9db92a0e0feceda9ef059a5a7dc))

## [1.2.0](https://github.com/sonrad10/Whide/compare/v1.1.3...v1.2.0) (2021-03-25)


### Features

* changed to drawing proper trees using d3 ([a613e07](https://github.com/sonrad10/Whide/commit/a613e07143aaa38a442ac966d41d80b161037894))
* moved circle and text tree elements into the nodegroup file for simplicity ([5fb3130](https://github.com/sonrad10/Whide/commit/5fb31308b59fc4570d7f5b814f43345b0a869086))
* trees can be dragged ([ae9bab7](https://github.com/sonrad10/Whide/commit/ae9bab7457fa4d67b797cfbab698cf8e2feaa05e))
* trees can be zoomed ([86e4332](https://github.com/sonrad10/Whide/commit/86e43322be3b4e304372cd8e04a588e6ec29ac2d))


### Bug Fixes

* trees only have circles on leaf nodes ([a2d50a7](https://github.com/sonrad10/Whide/commit/a2d50a74caa72ef807e8b7844a7031b6bbccfa20))

### [1.1.3](https://github.com/sonrad10/Whide/compare/v1.1.2...v1.1.3) (2021-03-24)


### Features

* added mac icon ([ef1cd0c](https://github.com/sonrad10/Whide/commit/ef1cd0c8d92c45b805d6beacfb48fb2fe0feb33f))
* made a program icon; now set as favicon and program icon ([1d2e974](https://github.com/sonrad10/Whide/commit/1d2e9744b5e58511fef81217e06762c452bc7367))


### Bug Fixes

* added author information to package.json ([cc3c91d](https://github.com/sonrad10/Whide/commit/cc3c91d095b9915cf1ea808cdd4493abb9831270))

### [1.1.2](https://github.com/sonrad10/Whide/compare/v1.1.1...v1.1.2) (2021-03-24)


### Bug Fixes

* fixed routing not working when running in electron ([225dc5d](https://github.com/sonrad10/Whide/commit/225dc5d162c2a6f05c3a4d7eed308baf351905e6))

### [1.1.1](https://github.com/sonrad10/Whide/compare/v1.1.0...v1.1.1) (2021-03-23)


### Features

* added multi platform build configurations for electron-builder ([d8fc5b9](https://github.com/sonrad10/Whide/commit/d8fc5b91b3dd130920fa44d14befff438eaffaf3))

## [1.1.0](https://github.com/sonrad10/Whide/compare/v1.0.0...v1.1.0) (2021-03-23)


### Features

* changed to using memfs instead of filer ([e57a4da](https://github.com/sonrad10/Whide/commit/e57a4daf8d49987f57aa49444863ae3a4da2dd69))
* made memfs data persist across refreshes/restarts ([ba5a046](https://github.com/sonrad10/Whide/commit/ba5a0463d74da4db9b588d71563a2174ea834482))
* renamed to just "whide" ([c6e6cd8](https://github.com/sonrad10/Whide/commit/c6e6cd845a321869570abcbd454cfcec83716c87))
* updated plugins to use the new fs format ([d6d52a5](https://github.com/sonrad10/Whide/commit/d6d52a59d208afde0761dcfa59eec6a76a9afc87))


### Bug Fixes

* fixed blank screen when running compiled version in electron ([0eb097d](https://github.com/sonrad10/Whide/commit/0eb097dcec61831452845e3aea20cd42573f2712))

## [1.0.0](https://github.com/sonrad10/Whide/compare/v0.9.10...v1.0.0) (2021-03-20)

### [0.9.10](https://github.com/sonrad10/Whide/compare/v0.9.9...v0.9.10) (2021-03-20)


### Features

* made files save before closing the tab ([0b09a95](https://github.com/sonrad10/Whide/commit/0b09a959c3d1ae259f15125e65791effad876b79))
* made output panel automatically scroll to the end of the output when updated ([6530d6c](https://github.com/sonrad10/Whide/commit/6530d6cfce20c5c23b9806a0515b5b34206607df))
* made the code editor fill 100% of its height ([da165dd](https://github.com/sonrad10/Whide/commit/da165ddc152c488d6aa303091faf4c0adc0bc60d))


### Bug Fixes

* made output panel tabs stay fixed while everything else scrolls ([5c0e2f5](https://github.com/sonrad10/Whide/commit/5c0e2f54c4f6c92b721d2c3c01dcfbebd03898b8))
* made variable table row underline behave like the output panel ([53bb04f](https://github.com/sonrad10/Whide/commit/53bb04f011cca87afdcac49c8910c735702becaf))
* scrolling the editor no longer hides the open tabs ([413deaf](https://github.com/sonrad10/Whide/commit/413deafad9a3f46faf41e7c5c2f11d712d671450))
* stopped output panel recognising '...' etc as a tree (now has to be `nil` or be surrounded by `<>`) ([53779f4](https://github.com/sonrad10/Whide/commit/53779f4ff6a57352c200036c7a67e8d51183343b))

### [0.9.9](https://github.com/sonrad10/Whide/compare/v0.9.8...v0.9.9) (2021-03-20)


### Features

* added support for debugging programs ([f166021](https://github.com/sonrad10/Whide/commit/f1660215f2e3349386ba96c6792f4e892815f3ca))
* added support for opening any tree string in the output console in a tree viewer ([6435a3c](https://github.com/sonrad10/Whide/commit/6435a3c62f9e88972fdaf7c88b0f3526c0942ed9))
* allowed control over opening/closing tabs in plugins ([aa51b1e](https://github.com/sonrad10/Whide/commit/aa51b1e9bfb00444c00c0edf7d8ab3c564abd697))


### Bug Fixes

* added support for clicking on any tree in the variable table to open it in a tree viewer ([4353c30](https://github.com/sonrad10/Whide/commit/4353c3082c57df0090c830237690d7dcdfa5ba04))
* the variable table is hidden if it doesn't have any data to show ([e8507af](https://github.com/sonrad10/Whide/commit/e8507afb35acee88eb2a973d359bca59dfc32e6a))
* updated config directory path to match with the package name ([0743af1](https://github.com/sonrad10/Whide/commit/0743af15c3d7d98e459a9d01da244e52519350d8))

### [0.9.8](https://github.com/sonrad10/Whide/compare/v0.9.7...v0.9.8) (2021-03-06)


### Features

* changed base program to use @whide/whide-types for types common with plugins ([7350593](https://github.com/sonrad10/Whide/commit/73505939bdbfe736d80779a17d717976d3c6e2fb))

### [0.9.7](https://github.com/sonrad10/Whide/compare/v0.9.6...v0.9.7) (2021-03-05)


### Features

* added a custom tree viewer which opens in a new window ([9593d0f](https://github.com/sonrad10/Whide/commit/9593d0fd9d2e4a722824d4b3748625dbaee09f9a))
* added vue-router back ([4aa3baa](https://github.com/sonrad10/Whide/commit/4aa3baa4466d2176554de666c080badd55f80e38))
* refactored so that plugins are only loaded once ([cb4a5bb](https://github.com/sonrad10/Whide/commit/cb4a5bb3e516a51d9eb6ee0681e33855f9dd7bb5))


### Bug Fixes

* updated typescript to latest version ([c5075ce](https://github.com/sonrad10/Whide/commit/c5075ced0395ba003c9a3e0e15bd6cf9f0b100b5))

### [0.9.6](https://github.com/sonrad10/Whide/compare/v0.9.4...v0.9.6) (2021-03-04)


### Features

* added support for running local files directly ([3738d73](https://github.com/sonrad10/Whide/commit/3738d73d90a21527a85f3f4fa272712d4766f57f))
* added support for specifying input type in plugin arguments and input controller ([ad381b3](https://github.com/sonrad10/Whide/commit/ad381b317522667ee589abeeb81e4f5a712f3312))
* allowed setting the working directory from the command line (-d or --working-dir) ([ced3414](https://github.com/sonrad10/Whide/commit/ced3414ac6d5f6b0bc928d63ca444c1fd1fa5edb))
* changed to using filer's `path` when in the browser ([b8b7de1](https://github.com/sonrad10/Whide/commit/b8b7de187a55be5e16ea54d21a7c13c096cb4c79))
* Improved encapsulation for InputPanel ([b6264e9](https://github.com/sonrad10/Whide/commit/b6264e964e58789d9e687c42a0892c9b041d7507))
* organised fileStore objects into folders ([88069b3](https://github.com/sonrad10/Whide/commit/88069b3710ff86520cb0824c2449791cab3f21c2))


### Bug Fixes

* fixed "save" and "download" buttons being always disabled ([3e38085](https://github.com/sonrad10/Whide/commit/3e38085435a98446c1a40fa4112b6460c65cff4c))
* fixed delete option not working ([6deb39a](https://github.com/sonrad10/Whide/commit/6deb39a76a54d0c3d107ff7d3db68533b3dcd44f))
* fixed input prompt button showing the wrong text ([2504f08](https://github.com/sonrad10/Whide/commit/2504f08f96674a47bafe085748c5561e6d3cf7c0))
* fixed input prompt file picker showing wrong directory ([b856631](https://github.com/sonrad10/Whide/commit/b856631b4ac0af3c76a1ad6f831734cd087a752b))
* Fixed unused variable error ([3701728](https://github.com/sonrad10/Whide/commit/370172848e546a3c1f5bb1ce4ecfc79b32a36cee))
* made some warnings use `console.error` ([a3d94f1](https://github.com/sonrad10/Whide/commit/a3d94f15f3ad99f56f90c88f5587998479c814a1))
* removed unused dependencies ([64c58ef](https://github.com/sonrad10/Whide/commit/64c58efe344285f1acf0136a93f85de6550c9f67))

### [0.9.5](https://github.com/sonrad10/Whide/compare/v0.9.4...v0.9.5) (2021-02-25)


### Bug Fixes

* fixed "save" and "download" buttons being always disabled ([3e38085](https://github.com/sonrad10/Whide/commit/3e38085435a98446c1a40fa4112b6460c65cff4c))

### [0.9.4](https://github.com/sonrad10/Whide/compare/v0.9.3...v0.9.4) (2021-02-25)


### Features

* added support for draggable tabs in RunPanel.vue ([e8c1642](https://github.com/sonrad10/Whide/commit/e8c16427c07d6e0f22c72f0419a14b4114da9642))
* added support for rearranging tabs by dragging ([80791b1](https://github.com/sonrad10/Whide/commit/80791b1bbbf2474be3bd9529f36bb91cb60ca9c5))
* changed tabs away from buttons, using background colours to show active tab ([bdf4bf9](https://github.com/sonrad10/Whide/commit/bdf4bf9c21b4d2b7548a1ad0c67d821a499a0730))
* made code editor focus on file tab when clicking on the file name in the file manager ([dcdf412](https://github.com/sonrad10/Whide/commit/dcdf412963a0f503d9a5a2a9684475ab0bde09f1))
* made new tabs open automatically ([d5a3392](https://github.com/sonrad10/Whide/commit/d5a33922a2edc25ec09f89467eaa2017e5374254))
* moved the menu bar into its own element, and Menu(Item)Element to `_internal/` ([420b919](https://github.com/sonrad10/Whide/commit/420b919ce944c499d82c078eff2ca8cb0a2f3493))


### Bug Fixes

* Fixed error where opening a single tab wouldn't update the editor every other time ([1079059](https://github.com/sonrad10/Whide/commit/1079059c9d712f4c0cd87229948b152cfb588efa))
* Minor update to package-lock files ([7b7782f](https://github.com/sonrad10/Whide/commit/7b7782f9bfbf4b2f070c242ef734ebb333374457))
* moved subfolders of private components into _internal ([2b73fd7](https://github.com/sonrad10/Whide/commit/2b73fd7a71d2305536403b97da3c867cc3f9aed4))
* renamed FilePicker onChange to onClick ([1cbe8e2](https://github.com/sonrad10/Whide/commit/1cbe8e280ec441b9061537bbc00eaf1aaf48918c))
* Wrapped CodeEditor in a Container ([562f528](https://github.com/sonrad10/Whide/commit/562f52875071135c6086ea4bb9f2ce45b604f30c))

### [0.9.3](https://github.com/sonrad10/Whide/compare/v0.9.2...v0.9.3) (2021-02-24)


### Features

* added fontawesome support ([4182384](https://github.com/sonrad10/Whide/commit/4182384eef4ea378d7d2cc0e12b123e639d59787))
* added support for running code in the editor through the console ([d84b871](https://github.com/sonrad10/Whide/commit/d84b87169391c3a8f262dcbf86ffd2f2a5bdf699))
* changed IOControllers to take a single object as args ([ff11c61](https://github.com/sonrad10/Whide/commit/ff11c611eef55cd7097a189e87a2aed68bfdfa0a))
* moved code run output to the output panel ([feb1c0c](https://github.com/sonrad10/Whide/commit/feb1c0c66379d515ca53f57e999a578e47ac6d9f))
* moved PluginFunctionParameters declaration into its own file ([6883bac](https://github.com/sonrad10/Whide/commit/6883bacfbba4f953021b5a1d1ba6dd64a70be4aa))
* removed collapsable feature from containers ([858e156](https://github.com/sonrad10/Whide/commit/858e1569b17456446261cb70ef395bdb80beb889))


### Bug Fixes

* changed from close button in tabs to close icon ([b33e704](https://github.com/sonrad10/Whide/commit/b33e704cdfe838df783a9b1585c9d6fc270eda78))
* changed to using organisation scope ([2c8888f](https://github.com/sonrad10/Whide/commit/2c8888fd7053582a29c897b9350bea865a309059))
* file paths now work from the project root automatically without requiring leading slash ([c5dd48f](https://github.com/sonrad10/Whide/commit/c5dd48f9248cfad5d14767fc227d9b26dafed8b3))
* fixed wrong import name ([88047ac](https://github.com/sonrad10/Whide/commit/88047acb0555c2fb34ea73d3dc6e6052f4824ab0))
* renamed a variable ([62c136b](https://github.com/sonrad10/Whide/commit/62c136b8cdbe2336111efba4c0169e19dc9ec1c1))
* upgraded @whide/run-code plugin to latest version of @whide/hwhile-wrapper ([58566ea](https://github.com/sonrad10/Whide/commit/58566eaea5a117da4584f3af9f372ac523ead1ef))

### [0.9.2](https://github.com/sonrad10/Whide/compare/v0.9.1...v0.9.2) (2021-02-18)


### Features

* added automatic install of system plugin dependencies ([e4cc956](https://github.com/sonrad10/Whide/commit/e4cc956f1d3177755c8bbedcd549bd2ba4bc55b1))


### Bug Fixes

* added warnings if plugins don't export any menus or functions ([df4447a](https://github.com/sonrad10/Whide/commit/df4447a18d1d3e28187b132dd82486f238a212e4))
* stopped system plugins' dependencies being recursively loaded as plugins ([bf478c5](https://github.com/sonrad10/Whide/commit/bf478c54b1a01bbe83fd095ce5db269875aa9c56))

### 0.9.1 (2021-02-17)


### Features

* added automatic versioning ([992cbb4](https://github.com/sonrad10/Whide/commit/992cbb4d2cd3448ea9f30dfa78ffc43bdef31908))
* added breakpoint widgets to code editor ([9b8d804](https://github.com/sonrad10/Whide/commit/9b8d804055ca41fb3e83c6f36f4c7de3b1476ac3))
* added full wrapper around all CodeMirror.Editor methods ([5aa07f8](https://github.com/sonrad10/Whide/commit/5aa07f84a0b64fd57a7462f575b8d1cb524fd04f))


### Bug Fixes

* added husky install to postinstall ([c639735](https://github.com/sonrad10/Whide/commit/c639735e258637c4c7276aa06dfeb711d88182bc))
* added user plugins' paths to the plugins toggler as title text ([d548950](https://github.com/sonrad10/Whide/commit/d548950af513e8381e9aa99fae89b28204978718))
* allowed serving in the browser; plugin loaders and electron are imported dynamically ([a5643ec](https://github.com/sonrad10/Whide/commit/a5643ec8db5ba58085c0ab8e7d85df52ce88e85f))
* changed EditorWidget to be for errors/warnings/info ([d4dd8eb](https://github.com/sonrad10/Whide/commit/d4dd8ebbd3961530c4d9a54285f8ea0d72a3c279))
* code editor now scrolls instead of covering the footer when many lines are entered ([302eee5](https://github.com/sonrad10/Whide/commit/302eee5cf6135839b317c513c3da2216ae733bf7))
* made code editor tabs left-aligned ([deba59b](https://github.com/sonrad10/Whide/commit/deba59be323f13e5afc936790b4e2d02c6d22954))
* made the editor take up the full page ([550e361](https://github.com/sonrad10/Whide/commit/550e36196a18eb2ed247042017b6311bd9b05663))
* moved `save` and `download` buttons to the right-hand side of the header bar ([d343588](https://github.com/sonrad10/Whide/commit/d343588a135ce1ec080815c3d6a1cd74f549e4d6))
* removed husky - stopping the error on `npm install` ([5e5b99c](https://github.com/sonrad10/Whide/commit/5e5b99c423842b1993231e4c0bb47e328019a9e4))
* removed some whitespace ([2aac288](https://github.com/sonrad10/Whide/commit/2aac288b0c7bd7714471a2755e98c5c3c0ef7796))
* renamed CodeEditorContainer to CodeEditorElement ([a9647c6](https://github.com/sonrad10/Whide/commit/a9647c60e440624f88d7dfc0c91f1e9b2a8f3ba3))
* set footer to grow with content ([b3c3236](https://github.com/sonrad10/Whide/commit/b3c3236597f95b49f8c786f292a9ba974ba2d13f))
* stopped user plugins from freezing the editor ([a792729](https://github.com/sonrad10/Whide/commit/a792729064c278d8da86af4b0bcd05a82be88c0b))
