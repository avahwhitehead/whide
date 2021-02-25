# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
