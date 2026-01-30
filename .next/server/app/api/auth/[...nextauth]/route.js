"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cfxcze%5COneDrive%5CPulpit%5C%D1%81%D0%B0%D0%B9%D1%82%20%D0%BA%D0%BB%D0%B0%D0%BD%D0%B0%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cfxcze%5COneDrive%5CPulpit%5C%D1%81%D0%B0%D0%B9%D1%82%20%D0%BA%D0%BB%D0%B0%D0%BD%D0%B0&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cfxcze%5COneDrive%5CPulpit%5C%D1%81%D0%B0%D0%B9%D1%82%20%D0%BA%D0%BB%D0%B0%D0%BD%D0%B0%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cfxcze%5COneDrive%5CPulpit%5C%D1%81%D0%B0%D0%B9%D1%82%20%D0%BA%D0%BB%D0%B0%D0%BD%D0%B0&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_fxcze_OneDrive_Pulpit_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\fxcze\\\\OneDrive\\\\Pulpit\\\\сайт клана\\\\app\\\\api\\\\auth\\\\[...nextauth]\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_fxcze_OneDrive_Pulpit_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNmeGN6ZSU1Q09uZURyaXZlJTVDUHVscGl0JTVDJUQxJTgxJUQwJUIwJUQwJUI5JUQxJTgyJTIwJUQwJUJBJUQwJUJCJUQwJUIwJUQwJUJEJUQwJUIwJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNmeGN6ZSU1Q09uZURyaXZlJTVDUHVscGl0JTVDJUQxJTgxJUQwJUIwJUQwJUI5JUQxJTgyJTIwJUQwJUJBJUQwJUJCJUQwJUIwJUQwJUJEJUQwJUIwJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUN1QztBQUNwSDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2FsY29ob2wtcGV0cmEtdHJhY2tlci8/Y2VlOSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxmeGN6ZVxcXFxPbmVEcml2ZVxcXFxQdWxwaXRcXFxc0YHQsNC50YIg0LrQu9Cw0L3QsFxcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcWy4uLm5leHRhdXRoXVxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxmeGN6ZVxcXFxPbmVEcml2ZVxcXFxQdWxwaXRcXFxc0YHQsNC50YIg0LrQu9Cw0L3QsFxcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcWy4uLm5leHRhdXRoXVxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cfxcze%5COneDrive%5CPulpit%5C%D1%81%D0%B0%D0%B9%D1%82%20%D0%BA%D0%BB%D0%B0%D0%BD%D0%B0%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cfxcze%5COneDrive%5CPulpit%5C%D1%81%D0%B0%D0%B9%D1%82%20%D0%BA%D0%BB%D0%B0%D0%BD%D0%B0&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _src_server_authOptions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/src/server/authOptions */ \"(rsc)/./src/server/authOptions.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_src_server_authOptions__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFpQztBQUNzQjtBQUV2RCxNQUFNRSxVQUFVRixnREFBUUEsQ0FBQ0MsZ0VBQVdBO0FBRU8iLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hbGNvaG9sLXBldHJhLXRyYWNrZXIvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cz9jOGE0Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tIFwibmV4dC1hdXRoXCI7XHJcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSBcIkAvc3JjL3NlcnZlci9hdXRoT3B0aW9uc1wiO1xyXG5cclxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcclxuXHJcbmV4cG9ydCB7IGhhbmRsZXIgYXMgR0VULCBoYW5kbGVyIGFzIFBPU1QgfTtcclxuXHJcbiJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsImF1dGhPcHRpb25zIiwiaGFuZGxlciIsIkdFVCIsIlBPU1QiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/server/authOptions.ts":
/*!***********************************!*\
  !*** ./src/server/authOptions.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_discord__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/discord */ \"(rsc)/./node_modules/next-auth/providers/discord.js\");\n/* harmony import */ var _src_server_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/src/server/prisma */ \"(rsc)/./src/server/prisma.ts\");\n\n\nconst authOptions = {\n    secret: process.env.NEXTAUTH_SECRET,\n    session: {\n        strategy: \"jwt\"\n    },\n    jwt: {\n        maxAge: 60 * 60 * 24 * 14\n    },\n    providers: [\n        (0,next_auth_providers_discord__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            clientId: process.env.DISCORD_CLIENT_ID ?? \"\",\n            clientSecret: process.env.DISCORD_CLIENT_SECRET ?? \"\"\n        })\n    ],\n    pages: {\n        signIn: \"/signin\",\n        error: \"/signin\"\n    },\n    callbacks: {\n        async jwt ({ token, account, profile }) {\n            // On first sign-in, profile/account are available\n            const discordId = profile?.id ?? account?.providerAccountId ?? null;\n            if (discordId) {\n                const name = profile?.global_name ?? profile?.username ?? token.name ?? \"Unknown\";\n                const isOwner = process.env.OWNER_DISCORD_ID ? process.env.OWNER_DISCORD_ID === discordId : false;\n                const existing = await _src_server_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findUnique({\n                    where: {\n                        discordId\n                    }\n                });\n                const shouldBootstrapOwner =  true && !isOwner && !existing && !await _src_server_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findFirst({\n                    where: {\n                        role: \"OWNER\"\n                    }\n                });\n                const user = existing ?? await _src_server_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.create({\n                    data: {\n                        discordId,\n                        name,\n                        role: isOwner || shouldBootstrapOwner ? \"OWNER\" : \"VIEWER\",\n                        isBlocked: false,\n                        isApproved: isOwner || shouldBootstrapOwner\n                    }\n                });\n                if (user.isBlocked) {\n                    // Soft fail: session will be rejected via signIn callback\n                    token.isBlocked = true;\n                }\n                token.userId = user.id;\n                token.role = user.role;\n                token.isBlocked = user.isBlocked;\n                token.isApproved = user.isApproved;\n                token.moderatesAlco = user.moderatesAlco ?? false;\n                token.moderatesPetra = user.moderatesPetra ?? false;\n                token.isFrozen = user.isFrozen ?? false;\n                token.frozenReason = user.frozenReason ?? null;\n                token.name = user.name;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.userId;\n                session.user.role = token.role ?? \"VIEWER\";\n                session.user.isBlocked = Boolean(token.isBlocked);\n                session.user.isApproved = Boolean(token.isApproved);\n                session.user.moderatesAlco = Boolean(token.moderatesAlco);\n                session.user.moderatesPetra = Boolean(token.moderatesPetra);\n                session.user.isFrozen = Boolean(token.isFrozen);\n                session.user.frozenReason = token.frozenReason ?? null;\n            }\n            return session;\n        },\n        async signIn ({ account, profile }) {\n            const discordId = profile?.id ?? account?.providerAccountId ?? null;\n            if (!discordId) return false;\n            const user = await _src_server_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findUnique({\n                where: {\n                    discordId\n                }\n            });\n            if (user?.isBlocked) return false;\n            // Allow any Discord user to sign in; approval is checked later via requireSession\n            return true;\n        },\n        async redirect ({ url, baseUrl }) {\n            try {\n                const parsed = new URL(url);\n                if (parsed.origin === baseUrl) return url;\n                return baseUrl;\n            } catch  {\n                if (url.startsWith(\"/\")) return `${baseUrl}${url}`;\n                return baseUrl;\n            }\n        }\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvc2VydmVyL2F1dGhPcHRpb25zLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUMwRDtBQUNiO0FBRXRDLE1BQU1FLGNBQStCO0lBQzFDQyxRQUFRQyxRQUFRQyxHQUFHLENBQUNDLGVBQWU7SUFDbkNDLFNBQVM7UUFBRUMsVUFBVTtJQUFNO0lBQzNCQyxLQUFLO1FBQ0hDLFFBQVEsS0FBSyxLQUFLLEtBQUs7SUFDekI7SUFDQUMsV0FBVztRQUNUWCx1RUFBZUEsQ0FBQztZQUNkWSxVQUFVUixRQUFRQyxHQUFHLENBQUNRLGlCQUFpQixJQUFJO1lBQzNDQyxjQUFjVixRQUFRQyxHQUFHLENBQUNVLHFCQUFxQixJQUFJO1FBQ3JEO0tBQ0Q7SUFDREMsT0FBTztRQUNMQyxRQUFRO1FBQ1JDLE9BQU87SUFDVDtJQUNBQyxXQUFXO1FBQ1QsTUFBTVYsS0FBSSxFQUFFVyxLQUFLLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFFO1lBQ25DLGtEQUFrRDtZQUNsRCxNQUFNQyxZQUNKLFNBQXFDQyxNQUFPSCxTQUFTSSxxQkFBcUI7WUFFNUUsSUFBSUYsV0FBVztnQkFDYixNQUFNRyxPQUNKLFNBQWlFQyxlQUNoRUwsU0FBMENNLFlBQzNDUixNQUFNTSxJQUFJLElBQ1Y7Z0JBRUYsTUFBTUcsVUFBVXpCLFFBQVFDLEdBQUcsQ0FBQ3lCLGdCQUFnQixHQUN4QzFCLFFBQVFDLEdBQUcsQ0FBQ3lCLGdCQUFnQixLQUFLUCxZQUNqQztnQkFFSixNQUFNUSxXQUFXLE1BQU05QixzREFBTUEsQ0FBQytCLElBQUksQ0FBQ0MsVUFBVSxDQUFDO29CQUFFQyxPQUFPO3dCQUFFWDtvQkFBVTtnQkFBRTtnQkFDckUsTUFBTVksdUJBQ0ovQixLQUFzQyxJQUN0QyxDQUFDeUIsV0FDRCxDQUFDRSxZQUNELENBQUUsTUFBTTlCLHNEQUFNQSxDQUFDK0IsSUFBSSxDQUFDSSxTQUFTLENBQUM7b0JBQUVGLE9BQU87d0JBQUVHLE1BQU07b0JBQVE7Z0JBQUU7Z0JBRTNELE1BQU1MLE9BQ0pELFlBQ0MsTUFBTTlCLHNEQUFNQSxDQUFDK0IsSUFBSSxDQUFDTSxNQUFNLENBQUM7b0JBQ3hCQyxNQUFNO3dCQUNKaEI7d0JBQ0FHO3dCQUNBVyxNQUFNUixXQUFXTSx1QkFBdUIsVUFBVTt3QkFDbERLLFdBQVc7d0JBQ1hDLFlBQVlaLFdBQVdNO29CQUN6QjtnQkFDRjtnQkFFRixJQUFJSCxLQUFLUSxTQUFTLEVBQUU7b0JBQ2xCLDBEQUEwRDtvQkFDMURwQixNQUFNb0IsU0FBUyxHQUFHO2dCQUNwQjtnQkFFQXBCLE1BQU1zQixNQUFNLEdBQUdWLEtBQUtSLEVBQUU7Z0JBQ3RCSixNQUFNaUIsSUFBSSxHQUFHTCxLQUFLSyxJQUFJO2dCQUN0QmpCLE1BQU1vQixTQUFTLEdBQUdSLEtBQUtRLFNBQVM7Z0JBQ2hDcEIsTUFBTXFCLFVBQVUsR0FBR1QsS0FBS1MsVUFBVTtnQkFDbENyQixNQUFNdUIsYUFBYSxHQUFHLEtBQWNBLGFBQWEsSUFBSTtnQkFDckR2QixNQUFNd0IsY0FBYyxHQUFHLEtBQWNBLGNBQWMsSUFBSTtnQkFDdkR4QixNQUFNeUIsUUFBUSxHQUFHLEtBQWNBLFFBQVEsSUFBSTtnQkFDM0N6QixNQUFNMEIsWUFBWSxHQUFHLEtBQWNBLFlBQVksSUFBSTtnQkFDbkQxQixNQUFNTSxJQUFJLEdBQUdNLEtBQUtOLElBQUk7WUFDeEI7WUFFQSxPQUFPTjtRQUNUO1FBQ0EsTUFBTWIsU0FBUSxFQUFFQSxPQUFPLEVBQUVhLEtBQUssRUFBRTtZQUM5QixJQUFJYixRQUFReUIsSUFBSSxFQUFFO2dCQUNoQnpCLFFBQVF5QixJQUFJLENBQUNSLEVBQUUsR0FBR0osTUFBTXNCLE1BQU07Z0JBQzlCbkMsUUFBUXlCLElBQUksQ0FBQ0ssSUFBSSxHQUFHLE1BQU9BLElBQUksSUFBcUM7Z0JBQ3BFOUIsUUFBUXlCLElBQUksQ0FBQ1EsU0FBUyxHQUFHTyxRQUFRM0IsTUFBTW9CLFNBQVM7Z0JBQ2hEakMsUUFBUXlCLElBQUksQ0FBQ1MsVUFBVSxHQUFHTSxRQUFRM0IsTUFBTXFCLFVBQVU7Z0JBQ2xEbEMsUUFBUXlCLElBQUksQ0FBQ1csYUFBYSxHQUFHSSxRQUFRLE1BQWVKLGFBQWE7Z0JBQ2pFcEMsUUFBUXlCLElBQUksQ0FBQ1ksY0FBYyxHQUFHRyxRQUFRLE1BQWVILGNBQWM7Z0JBQ25FckMsUUFBUXlCLElBQUksQ0FBQ2EsUUFBUSxHQUFHRSxRQUFRLE1BQWVGLFFBQVE7Z0JBQ3ZEdEMsUUFBUXlCLElBQUksQ0FBQ2MsWUFBWSxHQUFHLE1BQWdCQSxZQUFZLElBQWtDO1lBQzVGO1lBQ0EsT0FBT3ZDO1FBQ1Q7UUFDQSxNQUFNVSxRQUFPLEVBQUVJLE9BQU8sRUFBRUMsT0FBTyxFQUFFO1lBQy9CLE1BQU1DLFlBQ0osU0FBcUNDLE1BQU9ILFNBQVNJLHFCQUFxQjtZQUM1RSxJQUFJLENBQUNGLFdBQVcsT0FBTztZQUV2QixNQUFNUyxPQUFPLE1BQU0vQixzREFBTUEsQ0FBQytCLElBQUksQ0FBQ0MsVUFBVSxDQUFDO2dCQUFFQyxPQUFPO29CQUFFWDtnQkFBVTtZQUFFO1lBQ2pFLElBQUlTLE1BQU1RLFdBQVcsT0FBTztZQUU1QixrRkFBa0Y7WUFDbEYsT0FBTztRQUNUO1FBQ0EsTUFBTVEsVUFBUyxFQUFFQyxHQUFHLEVBQUVDLE9BQU8sRUFBRTtZQUM3QixJQUFJO2dCQUNGLE1BQU1DLFNBQVMsSUFBSUMsSUFBSUg7Z0JBQ3ZCLElBQUlFLE9BQU9FLE1BQU0sS0FBS0gsU0FBUyxPQUFPRDtnQkFDdEMsT0FBT0M7WUFDVCxFQUFFLE9BQU07Z0JBQ04sSUFBSUQsSUFBSUssVUFBVSxDQUFDLE1BQU0sT0FBTyxDQUFDLEVBQUVKLFFBQVEsRUFBRUQsSUFBSSxDQUFDO2dCQUNsRCxPQUFPQztZQUNUO1FBQ0Y7SUFDRjtBQUNGLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hbGNvaG9sLXBldHJhLXRyYWNrZXIvLi9zcmMvc2VydmVyL2F1dGhPcHRpb25zLnRzPzc4ODQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBOZXh0QXV0aE9wdGlvbnMgfSBmcm9tIFwibmV4dC1hdXRoXCI7XHJcbmltcG9ydCBEaXNjb3JkUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvZGlzY29yZFwiO1xyXG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9zcmMvc2VydmVyL3ByaXNtYVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XHJcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXHJcbiAgc2Vzc2lvbjogeyBzdHJhdGVneTogXCJqd3RcIiB9LFxyXG4gIGp3dDoge1xyXG4gICAgbWF4QWdlOiA2MCAqIDYwICogMjQgKiAxNCxcclxuICB9LFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgRGlzY29yZFByb3ZpZGVyKHtcclxuICAgICAgY2xpZW50SWQ6IHByb2Nlc3MuZW52LkRJU0NPUkRfQ0xJRU5UX0lEID8/IFwiXCIsXHJcbiAgICAgIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuRElTQ09SRF9DTElFTlRfU0VDUkVUID8/IFwiXCIsXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHBhZ2VzOiB7XHJcbiAgICBzaWduSW46IFwiL3NpZ25pblwiLFxyXG4gICAgZXJyb3I6IFwiL3NpZ25pblwiLFxyXG4gIH0sXHJcbiAgY2FsbGJhY2tzOiB7XHJcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgYWNjb3VudCwgcHJvZmlsZSB9KSB7XHJcbiAgICAgIC8vIE9uIGZpcnN0IHNpZ24taW4sIHByb2ZpbGUvYWNjb3VudCBhcmUgYXZhaWxhYmxlXHJcbiAgICAgIGNvbnN0IGRpc2NvcmRJZCA9XHJcbiAgICAgICAgKHByb2ZpbGUgYXMgeyBpZD86IHN0cmluZyB9IHwgbnVsbCk/LmlkID8/IChhY2NvdW50Py5wcm92aWRlckFjY291bnRJZCA/PyBudWxsKTtcclxuXHJcbiAgICAgIGlmIChkaXNjb3JkSWQpIHtcclxuICAgICAgICBjb25zdCBuYW1lID1cclxuICAgICAgICAgIChwcm9maWxlIGFzIHsgdXNlcm5hbWU/OiBzdHJpbmc7IGdsb2JhbF9uYW1lPzogc3RyaW5nIH0gfCBudWxsKT8uZ2xvYmFsX25hbWUgPz9cclxuICAgICAgICAgIChwcm9maWxlIGFzIHsgdXNlcm5hbWU/OiBzdHJpbmcgfSB8IG51bGwpPy51c2VybmFtZSA/P1xyXG4gICAgICAgICAgdG9rZW4ubmFtZSA/P1xyXG4gICAgICAgICAgXCJVbmtub3duXCI7XHJcblxyXG4gICAgICAgIGNvbnN0IGlzT3duZXIgPSBwcm9jZXNzLmVudi5PV05FUl9ESVNDT1JEX0lEXHJcbiAgICAgICAgICA/IHByb2Nlc3MuZW52Lk9XTkVSX0RJU0NPUkRfSUQgPT09IGRpc2NvcmRJZFxyXG4gICAgICAgICAgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHsgd2hlcmU6IHsgZGlzY29yZElkIH0gfSk7XHJcbiAgICAgICAgY29uc3Qgc2hvdWxkQm9vdHN0cmFwT3duZXIgPVxyXG4gICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJlxyXG4gICAgICAgICAgIWlzT3duZXIgJiZcclxuICAgICAgICAgICFleGlzdGluZyAmJlxyXG4gICAgICAgICAgIShhd2FpdCBwcmlzbWEudXNlci5maW5kRmlyc3QoeyB3aGVyZTogeyByb2xlOiBcIk9XTkVSXCIgfSB9KSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVzZXIgPVxyXG4gICAgICAgICAgZXhpc3RpbmcgPz9cclxuICAgICAgICAgIChhd2FpdCBwcmlzbWEudXNlci5jcmVhdGUoe1xyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgZGlzY29yZElkLFxyXG4gICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgcm9sZTogaXNPd25lciB8fCBzaG91bGRCb290c3RyYXBPd25lciA/IFwiT1dORVJcIiA6IFwiVklFV0VSXCIsXHJcbiAgICAgICAgICAgICAgaXNCbG9ja2VkOiBmYWxzZSxcclxuICAgICAgICAgICAgICBpc0FwcHJvdmVkOiBpc093bmVyIHx8IHNob3VsZEJvb3RzdHJhcE93bmVyLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICBpZiAodXNlci5pc0Jsb2NrZWQpIHtcclxuICAgICAgICAgIC8vIFNvZnQgZmFpbDogc2Vzc2lvbiB3aWxsIGJlIHJlamVjdGVkIHZpYSBzaWduSW4gY2FsbGJhY2tcclxuICAgICAgICAgIHRva2VuLmlzQmxvY2tlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0b2tlbi51c2VySWQgPSB1c2VyLmlkO1xyXG4gICAgICAgIHRva2VuLnJvbGUgPSB1c2VyLnJvbGU7XHJcbiAgICAgICAgdG9rZW4uaXNCbG9ja2VkID0gdXNlci5pc0Jsb2NrZWQ7XHJcbiAgICAgICAgdG9rZW4uaXNBcHByb3ZlZCA9IHVzZXIuaXNBcHByb3ZlZDtcclxuICAgICAgICB0b2tlbi5tb2RlcmF0ZXNBbGNvID0gKHVzZXIgYXMgYW55KS5tb2RlcmF0ZXNBbGNvID8/IGZhbHNlO1xyXG4gICAgICAgIHRva2VuLm1vZGVyYXRlc1BldHJhID0gKHVzZXIgYXMgYW55KS5tb2RlcmF0ZXNQZXRyYSA/PyBmYWxzZTtcclxuICAgICAgICB0b2tlbi5pc0Zyb3plbiA9ICh1c2VyIGFzIGFueSkuaXNGcm96ZW4gPz8gZmFsc2U7XHJcbiAgICAgICAgdG9rZW4uZnJvemVuUmVhc29uID0gKHVzZXIgYXMgYW55KS5mcm96ZW5SZWFzb24gPz8gbnVsbDtcclxuICAgICAgICB0b2tlbi5uYW1lID0gdXNlci5uYW1lO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdG9rZW47XHJcbiAgICB9LFxyXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcclxuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xyXG4gICAgICAgIHNlc3Npb24udXNlci5pZCA9IHRva2VuLnVzZXJJZCBhcyBzdHJpbmc7XHJcbiAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSAodG9rZW4ucm9sZSBhcyBcIk9XTkVSXCIgfCBcIkFETUlOXCIgfCBcIlZJRVdFUlwiKSA/PyBcIlZJRVdFUlwiO1xyXG4gICAgICAgIHNlc3Npb24udXNlci5pc0Jsb2NrZWQgPSBCb29sZWFuKHRva2VuLmlzQmxvY2tlZCk7XHJcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlzQXBwcm92ZWQgPSBCb29sZWFuKHRva2VuLmlzQXBwcm92ZWQpO1xyXG4gICAgICAgIHNlc3Npb24udXNlci5tb2RlcmF0ZXNBbGNvID0gQm9vbGVhbigodG9rZW4gYXMgYW55KS5tb2RlcmF0ZXNBbGNvKTtcclxuICAgICAgICBzZXNzaW9uLnVzZXIubW9kZXJhdGVzUGV0cmEgPSBCb29sZWFuKCh0b2tlbiBhcyBhbnkpLm1vZGVyYXRlc1BldHJhKTtcclxuICAgICAgICBzZXNzaW9uLnVzZXIuaXNGcm96ZW4gPSBCb29sZWFuKCh0b2tlbiBhcyBhbnkpLmlzRnJvemVuKTtcclxuICAgICAgICBzZXNzaW9uLnVzZXIuZnJvemVuUmVhc29uID0gKCh0b2tlbiBhcyBhbnkpLmZyb3plblJlYXNvbiBhcyBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKSA/PyBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzZXNzaW9uO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHNpZ25Jbih7IGFjY291bnQsIHByb2ZpbGUgfSkge1xyXG4gICAgICBjb25zdCBkaXNjb3JkSWQgPVxyXG4gICAgICAgIChwcm9maWxlIGFzIHsgaWQ/OiBzdHJpbmcgfSB8IG51bGwpPy5pZCA/PyAoYWNjb3VudD8ucHJvdmlkZXJBY2NvdW50SWQgPz8gbnVsbCk7XHJcbiAgICAgIGlmICghZGlzY29yZElkKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7IHdoZXJlOiB7IGRpc2NvcmRJZCB9IH0pO1xyXG4gICAgICBpZiAodXNlcj8uaXNCbG9ja2VkKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAvLyBBbGxvdyBhbnkgRGlzY29yZCB1c2VyIHRvIHNpZ24gaW47IGFwcHJvdmFsIGlzIGNoZWNrZWQgbGF0ZXIgdmlhIHJlcXVpcmVTZXNzaW9uXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHJlZGlyZWN0KHsgdXJsLCBiYXNlVXJsIH0pIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XHJcbiAgICAgICAgaWYgKHBhcnNlZC5vcmlnaW4gPT09IGJhc2VVcmwpIHJldHVybiB1cmw7XHJcbiAgICAgICAgcmV0dXJuIGJhc2VVcmw7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGlmICh1cmwuc3RhcnRzV2l0aChcIi9cIikpIHJldHVybiBgJHtiYXNlVXJsfSR7dXJsfWA7XHJcbiAgICAgICAgcmV0dXJuIGJhc2VVcmw7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfSxcclxufTtcclxuXHJcbiJdLCJuYW1lcyI6WyJEaXNjb3JkUHJvdmlkZXIiLCJwcmlzbWEiLCJhdXRoT3B0aW9ucyIsInNlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJORVhUQVVUSF9TRUNSRVQiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJqd3QiLCJtYXhBZ2UiLCJwcm92aWRlcnMiLCJjbGllbnRJZCIsIkRJU0NPUkRfQ0xJRU5UX0lEIiwiY2xpZW50U2VjcmV0IiwiRElTQ09SRF9DTElFTlRfU0VDUkVUIiwicGFnZXMiLCJzaWduSW4iLCJlcnJvciIsImNhbGxiYWNrcyIsInRva2VuIiwiYWNjb3VudCIsInByb2ZpbGUiLCJkaXNjb3JkSWQiLCJpZCIsInByb3ZpZGVyQWNjb3VudElkIiwibmFtZSIsImdsb2JhbF9uYW1lIiwidXNlcm5hbWUiLCJpc093bmVyIiwiT1dORVJfRElTQ09SRF9JRCIsImV4aXN0aW5nIiwidXNlciIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsInNob3VsZEJvb3RzdHJhcE93bmVyIiwiZmluZEZpcnN0Iiwicm9sZSIsImNyZWF0ZSIsImRhdGEiLCJpc0Jsb2NrZWQiLCJpc0FwcHJvdmVkIiwidXNlcklkIiwibW9kZXJhdGVzQWxjbyIsIm1vZGVyYXRlc1BldHJhIiwiaXNGcm96ZW4iLCJmcm96ZW5SZWFzb24iLCJCb29sZWFuIiwicmVkaXJlY3QiLCJ1cmwiLCJiYXNlVXJsIiwicGFyc2VkIiwiVVJMIiwib3JpZ2luIiwic3RhcnRzV2l0aCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/server/authOptions.ts\n");

/***/ }),

/***/ "(rsc)/./src/server/prisma.ts":
/*!******************************!*\
  !*** ./src/server/prisma.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = globalThis.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log: [\n        \"error\",\n        \"warn\"\n    ]\n});\nif (true) globalThis.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvc2VydmVyL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBOEM7QUFPdkMsTUFBTUMsU0FDWEMsV0FBV0QsTUFBTSxJQUNqQixJQUFJRCx3REFBWUEsQ0FBQztJQUNmRyxLQUFLO1FBQUM7UUFBUztLQUFPO0FBQ3hCLEdBQUc7QUFFTCxJQUFJQyxJQUFxQyxFQUFFRixXQUFXRCxNQUFNLEdBQUdBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWxjb2hvbC1wZXRyYS10cmFja2VyLy4vc3JjL3NlcnZlci9wcmlzbWEudHM/ZmUyNiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tIFwiQHByaXNtYS9jbGllbnRcIjtcclxuXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdmFyXHJcbiAgdmFyIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgcHJpc21hOiBQcmlzbWFDbGllbnQgPVxyXG4gIGdsb2JhbFRoaXMucHJpc21hID8/XHJcbiAgbmV3IFByaXNtYUNsaWVudCh7XHJcbiAgICBsb2c6IFtcImVycm9yXCIsIFwid2FyblwiXSxcclxuICB9KTtcclxuXHJcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIGdsb2JhbFRoaXMucHJpc21hID0gcHJpc21hO1xyXG5cclxuIl0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsInByaXNtYSIsImdsb2JhbFRoaXMiLCJsb2ciLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/server/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/@babel","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5Cfxcze%5COneDrive%5CPulpit%5C%D1%81%D0%B0%D0%B9%D1%82%20%D0%BA%D0%BB%D0%B0%D0%BD%D0%B0%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cfxcze%5COneDrive%5CPulpit%5C%D1%81%D0%B0%D0%B9%D1%82%20%D0%BA%D0%BB%D0%B0%D0%BD%D0%B0&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();