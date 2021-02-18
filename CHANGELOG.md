# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
