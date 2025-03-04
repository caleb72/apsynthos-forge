'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "e2acd9967b2dfe27102960bf70e8e5c9",
"assets/AssetManifest.bin.json": "9fc4de3e1f201c1b701d6acff39a7ca2",
"assets/AssetManifest.json": "e87556780f24d830608d808933708890",
"assets/assets/card_templates/sovereign/augment_frame.png": "623aadcf97ca3745ecacd0eb5f1d3062",
"assets/assets/card_templates/sovereign/echo_frame.png": "922e102564ab481b9e5903f62355835d",
"assets/assets/card_templates/sovereign/effect_icons.png": "a17982dba92063bd73815fe2fb329d33",
"assets/assets/card_templates/sovereign/faction_icons.png": "dff02a003a5744a4abed431f8758bd19",
"assets/assets/card_templates/sovereign/forge_cost_icons.png": "8d35ebd29e0b25dbe66aa0d80c1d9e09",
"assets/assets/card_templates/sovereign/health_icons.png": "c76a2ade8fd6a39bde85c3fd7cf85d62",
"assets/assets/card_templates/sovereign/leader_frame.png": "3634f52f8fcb32f67a145ebad35d00ce",
"assets/assets/card_templates/sovereign/reflex_frame.png": "aff4d151e9c04f25847bc916672c2bf7",
"assets/assets/card_templates/sovereign/standard_frame.png": "cf6baf86417aed407f20ea9d9b913376",
"assets/assets/card_templates/sovereign/unit_stats.png": "52d1b744258c5e8eb5987c742ebf3485",
"assets/assets/data/sovereign.json": "6ec4eeeac2860af5758912942f0bfbfa",
"assets/FontManifest.json": "0faf31f1f2eb5f0e0055c9c798f6b9c7",
"assets/fonts/Arrows.ttf": "24e240d7b8d31c0cc28704360105c059",
"assets/fonts/gill-sans-mt-light.ttf": "261abfb350f6246ccbaa82484a7f7fab",
"assets/fonts/MaterialIcons-Regular.otf": "112e92e27b36e13ec88c671bd9bb2c25",
"assets/fonts/st-copperplate.ttf": "366402dc1827d771fc62328a83f8d900",
"assets/NOTICES": "c42c6396a0401f5731eaa6845b157860",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "738255d00768497e86aa4ca510cce1e1",
"canvaskit/canvaskit.js.symbols": "74a84c23f5ada42fe063514c587968c6",
"canvaskit/canvaskit.wasm": "9251bb81ae8464c4df3b072f84aa969b",
"canvaskit/chromium/canvaskit.js": "901bb9e28fac643b7da75ecfd3339f3f",
"canvaskit/chromium/canvaskit.js.symbols": "ee7e331f7f5bbf5ec937737542112372",
"canvaskit/chromium/canvaskit.wasm": "399e2344480862e2dfa26f12fa5891d7",
"canvaskit/skwasm.js": "5d4f9263ec93efeb022bb14a3881d240",
"canvaskit/skwasm.js.symbols": "c3c05bd50bdf59da8626bbe446ce65a3",
"canvaskit/skwasm.wasm": "4051bfc27ba29bf420d17aa0c3a98bce",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "b165f3fd25025e4f1b1eafc0c000405e",
"flutter.js": "383e55f7f3cce5be08fcf1f3881f585c",
"flutter_bootstrap.js": "a3657d0d37cd31e0a0dc0f8405d4c7d4",
"icons/Icon-192.png": "7f8af5b9a8940fc3ddc4ca087ebe5c45",
"icons/Icon-512.png": "6f4ac116854b9ef21aae04c3ba7f46af",
"icons/Icon-maskable-192.png": "fdcfb6211514e618c3341dcf33777b12",
"icons/Icon-maskable-512.png": "46d05643a998bad35fc0af0206c2e927",
"index.html": "b454914e758fa864d01db4d6e4555591",
"/": "b454914e758fa864d01db4d6e4555591",
"main.dart.js": "efe312b7e1896bb645ad1c21f8e9a060",
"manifest.json": "afae34dd6e469771ef32096ffdac8655",
"version.json": "12345ca75e7338208e9da22d4b359017"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
