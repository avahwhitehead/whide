# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
