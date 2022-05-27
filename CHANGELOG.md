# Changelog

## [0.8.0](https://github.com/Skn0tt/datapact/compare/v0.7.1...v0.8.0) (2022-05-27)


### Features

* allow removal of notification emails ([053f314](https://github.com/Skn0tt/datapact/commit/053f314420faa2b2879c02754c04ceece2b0601b))
* make emails more beautiful ([c7f6983](https://github.com/Skn0tt/datapact/commit/c7f6983dca63a7e992403460f3bc12d896417da9))

### [0.7.1](https://github.com/Skn0tt/datapact/compare/v0.7.0...v0.7.1) (2022-05-26)


### Bug Fixes

* doc build ([e859d1f](https://github.com/Skn0tt/datapact/commit/e859d1f7fbab7a1dc0f6c8a5924d1abb61eef022))
* represent int64 as string ([bf7a6fb](https://github.com/Skn0tt/datapact/commit/bf7a6fba527f57e22a7117a4001c3f946e230058))

## [0.7.0](https://github.com/Skn0tt/datapact/compare/v0.6.0...v0.7.0) (2022-05-25)


### ⚠ BREAKING CHANGES

* add a bunch of tests, remove __enter__, __exit__

### Features

* add .check ([7e56b11](https://github.com/Skn0tt/datapact/commit/7e56b117ec35a88e6d8ae50273bf9eb0672b9452))
* add a bunch of tests, remove __enter__, __exit__ ([033e86f](https://github.com/Skn0tt/datapact/commit/033e86f3928275d32c238922fc8c099e2093a86f))
* collect "failed_sample ([bf054f6](https://github.com/Skn0tt/datapact/commit/bf054f661da41644ea68f69ac0ee5f36bb8f25d4))
* collect more failed samples ([c1db317](https://github.com/Skn0tt/datapact/commit/c1db317182f54f79e117668f86a67f8b7524198a))
* docs + add expectation ([4ce78dd](https://github.com/Skn0tt/datapact/commit/4ce78dd6016725457fe2ac3744d7ab9e808793a7))
* implement be_date ([36bdd87](https://github.com/Skn0tt/datapact/commit/36bdd876603f7c79bb50cec602e8f3c07f547fd0))
* implement be_datetime ([2ce4519](https://github.com/Skn0tt/datapact/commit/2ce45195e7b9d4ebecaf4e9db216fa4eb9addd70))
* implement be_unix_epoch ([b47eca5](https://github.com/Skn0tt/datapact/commit/b47eca5c98345460e339e03200313aceea351e2b))
* implement keyword capturing for var-args ([2b7b571](https://github.com/Skn0tt/datapact/commit/2b7b571a2d72daabcaeeda9c7e6935c0d2898dc3))
* implement sensible default viz ([bf3154d](https://github.com/Skn0tt/datapact/commit/bf3154dca58119c874ee1ef303c3fcf78e9bd8ff))
* remove placeholder stats ([920249e](https://github.com/Skn0tt/datapact/commit/920249ebd6cc70e3a6d57a8925d7062b4f10f3f2))


### Bug Fixes

* distribution viz ([f748e7a](https://github.com/Skn0tt/datapact/commit/f748e7a01eb897dd75cf7185eeb194e8a7b27c76))
* dont go over tuple bounds ([d86d61e](https://github.com/Skn0tt/datapact/commit/d86d61e618dd74c7b13878ec74de28551e7e40b9))


### Miscellaneous Chores

* release 0.7.0 ([e40c489](https://github.com/Skn0tt/datapact/commit/e40c4890dd16a869085940eeaa0c0fc7aa9d44ca))

## [0.6.0](https://github.com/Skn0tt/datapact/compare/v0.5.0...v0.6.0) (2022-05-20)


### Features

* detect gravatar URLs ([f139bc9](https://github.com/Skn0tt/datapact/commit/f139bc973351e7805d5260737fbbc8edf5794796))
* implement be_one_of ([e5a525c](https://github.com/Skn0tt/datapact/commit/e5a525c6c8039afca0ef1fbfa2d0493e402ce977))


### Bug Fixes

* include entrypoint.js in distro ([5065ae7](https://github.com/Skn0tt/datapact/commit/5065ae79ae83347b6986aba29b39ade170742d94))

## [0.5.0](https://github.com/Skn0tt/datapact/compare/v0.4.0...v0.5.0) (2022-05-20)


### Features

* add bundle step to Makefile ([df8872c](https://github.com/Skn0tt/datapact/commit/df8872caf09af198b313dc5e55e7688138fbc127))
* add docs link ([1e6b8f8](https://github.com/Skn0tt/datapact/commit/1e6b8f8da36515963d822fd704ab55f0ddc61acf))
* add footer ([d10abc9](https://github.com/Skn0tt/datapact/commit/d10abc999e679cd59842cf702c2be5eb4147bffe))
* add links to footer ([39677de](https://github.com/Skn0tt/datapact/commit/39677deee718f1d5bb7ee9727e2b57f4359320e7))
* add login redirect ([efeb492](https://github.com/Skn0tt/datapact/commit/efeb49245a9dfc970991437c9fb7d48aaaa343df))
* add nice illustration ([877c12f](https://github.com/Skn0tt/datapact/commit/877c12f5c598e861b2f9529b6caf5c5f00d1c9a3))
* implement warning email (Closes [#53](https://github.com/Skn0tt/datapact/issues/53)) ([d6f6665](https://github.com/Skn0tt/datapact/commit/d6f6665eb8d1cc417dc94e98f25b77ff75320a0e))
* styling ([c7af5ee](https://github.com/Skn0tt/datapact/commit/c7af5ee318f926b7fb287bc29a46f6d420b0dc8e))


### Bug Fixes

* dont use pwd ([be20d28](https://github.com/Skn0tt/datapact/commit/be20d28731a644339b6f7188641e631589d376ce))
* exclude test files from bundle ([f0989de](https://github.com/Skn0tt/datapact/commit/f0989de84d0f98556600e58b2435b4494d1df4f3))
* listen on $PORT ([2a86a81](https://github.com/Skn0tt/datapact/commit/2a86a8100736b8633d277be94c935574e33ef179))
* remove dollar signs ([c34bb62](https://github.com/Skn0tt/datapact/commit/c34bb62334a37936cf8ca080861fdace9a7a10c7))
* types ([0e8fad3](https://github.com/Skn0tt/datapact/commit/0e8fad30e872c3e8aecbb4671448518144e58716))

## [0.4.0](https://github.com/Skn0tt/datapact/compare/v0.3.5...v0.4.0) (2022-05-18)


### Features

* add support for custom assertions ([00019e1](https://github.com/Skn0tt/datapact/commit/00019e1fee1684ae1a7549c6c5b684177f9681df))
* implement __dir__, move schema file into main file, show full summary from all return values ([57dd087](https://github.com/Skn0tt/datapact/commit/57dd0872d17cf50bf611f5cfc5d857f9ab69b106))
* infer name for custom assertion from function name ([282af4d](https://github.com/Skn0tt/datapact/commit/282af4d95741ef3b2edf182626d156638eb68942))


### Bug Fixes

* **deps:** update dependency chakra-react-select to v3.3.7 ([#45](https://github.com/Skn0tt/datapact/issues/45)) ([53df7e9](https://github.com/Skn0tt/datapact/commit/53df7e9e6fd8e49bdf2b4eac13f3f349d9f7e297))
* **deps:** update dependency zod to v3.16.0 ([#60](https://github.com/Skn0tt/datapact/issues/60)) ([37a7350](https://github.com/Skn0tt/datapact/commit/37a73506ae4dffe380952a495911f404bf0db461))
* **deps:** update prisma monorepo to v3.14.0 ([#61](https://github.com/Skn0tt/datapact/issues/61)) ([034513c](https://github.com/Skn0tt/datapact/commit/034513cecbfc00d190d6c1754994a7faac2243cf))
* **deps:** update react monorepo to v18.1.0 ([#70](https://github.com/Skn0tt/datapact/issues/70)) ([7a506f0](https://github.com/Skn0tt/datapact/commit/7a506f079c127c9b3bda8208a55a4204f132e1c9))

### [0.3.5](https://github.com/Skn0tt/datapact/compare/v0.3.4...v0.3.5) (2022-05-17)


### Bug Fixes

* import from .schema ([c362a6a](https://github.com/Skn0tt/datapact/commit/c362a6a626cad91784f73d56e70d83595e5c8c4d))

### [0.3.4](https://github.com/Skn0tt/datapact/compare/v0.3.3...v0.3.4) (2022-05-17)


### Bug Fixes

* right "visualiser" script ([a9a6d19](https://github.com/Skn0tt/datapact/commit/a9a6d196f5630aff00ba19eecd4b296299a8345f))

### [0.3.3](https://github.com/Skn0tt/datapact/compare/v0.3.2...v0.3.3) (2022-05-17)


### Bug Fixes

* **deps:** update blitz to v2.0.0-alpha.24 ([#54](https://github.com/Skn0tt/datapact/issues/54)) ([e270cdd](https://github.com/Skn0tt/datapact/commit/e270cddeeeb8916dbdc5799c5810c2db592b5cd0))

### [0.3.2](https://github.com/Skn0tt/datapact/compare/v0.3.1...v0.3.2) (2022-05-12)


### Bug Fixes

* run docker on every release ([75076fd](https://github.com/Skn0tt/datapact/commit/75076fd0df2c7f11bf985a91538c7e4928922745))

### [0.3.1](https://github.com/Skn0tt/datapact/compare/v0.3.0...v0.3.1) (2022-05-12)


### Bug Fixes

* enable flavor: true ([b174ff9](https://github.com/Skn0tt/datapact/commit/b174ff9570ee217634d4f35d989f2cba905f98dc))
* update tagging logic ([4f51ae1](https://github.com/Skn0tt/datapact/commit/4f51ae1bccc76000d5d9dc0047c916e8919fca06))


### Documentation

* add skn0tt as a contributor for code, doc, ideas, maintenance ([#8](https://github.com/Skn0tt/datapact/issues/8)) ([4c3e6e5](https://github.com/Skn0tt/datapact/commit/4c3e6e5d489e1ac06b6167659f5e0fc284a1d3f0))

## [0.3.0](https://github.com/Skn0tt/datapact/compare/v0.2.1...v0.3.0) (2022-05-12)


### Features

* add docker image pusher ([ea17485](https://github.com/Skn0tt/datapact/commit/ea174856be7dd200e75760fd034f3a9e2c590568))


### Bug Fixes

* pre-commit stuff ([8fcbd70](https://github.com/Skn0tt/datapact/commit/8fcbd708764a77c33b45b230ef427ba741dad597))

### [0.2.1](https://github.com/Skn0tt/expact/compare/v0.2.0...v0.2.1) (2022-05-11)

### Bug Fixes

- update package name ([be02482](https://github.com/Skn0tt/expact/commit/be02482f2070cc370fff66d90f19a39881b90654))

## [0.2.0](https://github.com/Skn0tt/datapact/compare/v0.1.0...v0.2.0) (2022-05-11)

### Features

- add release stuff ([6fc7e3f](https://github.com/Skn0tt/datapact/commit/6fc7e3f838803696471ff390ef875774ac7a25a3))

## 0.1.0 (2022-05-11)

### Features

- try out release-please ([74dadaa](https://github.com/Skn0tt/datapact/commit/74dadaae168bafd888a363ac37c984e01f9dd585))
