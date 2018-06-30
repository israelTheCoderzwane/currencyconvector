// Installing ServiceWorker.
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function(event) {
        if (event.data.timestamp - currentTimestamp >4*60*1000) {
            document.location.reload();
        }
    });
    navigator.serviceWorker.register('/sw.js').catch(function (error) {
        console.log(error);
    });

}
// Offline ServiceWorker.
var cacheVersion = 'v1';
this.addEventListener('install', function(event) {
    event.waitUntil(caches.open(cacheVersion).then(function(cache) {
        return cache.addAll([
            'index.html',
            'styles/app.css',
            'scripts/app.js',
            'scripts/application.js',
            'https://openexchangerates.org/api/currencies.json',
            'https://openexchangerates.org/api/latest.json'
        ]).cache(function (error) {
            console.log('Error in install handler: ', error);
        });
    })
);
});

//Activating the ServiceWorker.
this.addEventListener('activate', function(event) {
    event.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.map(function (cacheName) {
            if (cacheName !== cacheVersion) {
                return caches.delete(cacheName);
            }
        })
    );
    })
);
});

// Cache with Network Fallback.
this.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
    })
);
});

// Cache the Network frequently updated resources.
this.addEventListener('fetch', function(event) {
    var requestUrl = new URL(event.request.url);

    if (requestUrl.hostname === 'openexchangerates.org') {
        event.respondWith(caches.open(cacheVersion).then(function(cache) {
            return cache.match(event.request).then(function(response) {
                if (response) {
                    fetchAndCache(event, cache);
                    return response;
                } else {
                    return fetchAndCache(event, cache);
                }
            }).catch(function(error) {
                console.error(' Error in fetch handler:', error);
                throw error;
            });
        })
    );
    } else {
        event.respondWith(
            cache.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }
});
// Function to fetch and cache.
function fetchAndCache(event, cache) {
    return fetch(event.request.clone()).then(function(response) {
        if (response.status < 400) {
            cache.put(event.request, response.clone());
        }
        return response;
    });
}

// Page notifications and updates
this.addEventListener('fetch', function(event) {
    // cache and update
    if (response) {
        fetchAndCache(event. cache).then(sendUpdatedNotification);
        return response;
    } else {
        return fetchAndCache(event, cache);
    }
    // Sending update notification
    function sendUpdateNotification(response) {
        clients.matchAll().then(function(clients) {
            clients.forEach(function(client) {
                client.postMessage({
                    type: 'UPDATE',
                    timestamp: Date.now()
                });
            });
        });
    }
});

// Background sync: Request it from the page
navigator.serviceWorker.ready.then(function(registration) {
    registration.periodicSync.register({
       tag: 'get-latest-rates',
       mainPeriod: 12*60*60*1000,
       powerState: 'avoid-draining',
       networkState: 'avoid-cellular' 
    }).then(function(periodicSyncReg) {
        // successful
        console.log('Successful Sync page');
    }, function () {
        // failure
        consol.log('Failed to Sync page')
    }) 
})

// Respond in the serviceWorker
this.addEventListener('periodicsync', function(event) {
    if (event.registration.tag == 'get-latest-rates') {
        event.waitUntil(fetchAndCache());
    } else {
        // unknown sync
        event.registration.unregister();
    }
});

//Using IndexedDB and Cache
// Creating IndexedDB object currencyStore
function createDb() {
    idb.open('storkExchange', 1, function(upgradeDB) {
        var currencyStore = upgradeDB.createObjectStore('currencies', {
            keyPath: 'id'
        });
        currencyStore.put({id: 001, name: 'AED', amount: 10.13});
        currencyStore.put({id: 002, name: 'AFN', amount: 16.06});
        currencyStore.put({id: 003, name: 'ALL', amount: 09.66});
        currencyStore.put({id: 004, name: 'AMD', amount: 08.66});
        currencyStore.put({id: 005, name: 'ANG', amount: 14.14});
        currencyStore.put({id: 006, name: 'AOA', amount: 13.00});
        currencyStore.put({id: 007, name: 'ARS', amount: 11.66});
        currencyStore.put({id: 010, name: 'GBP', amount: 15.76});
        currencyStore.put({id: 011, name: 'USD', amount: 13.66});
        currencyStore.put({id: 012, name: 'ZAR', amount: 13.66});
        currencyStore.put({id: 013, name: 'ZMW', amount: 09.66});
    } );
}

// Creating IndexedDB
self.addEventListener('active', function(event) {
    event.waitUntil(
        createDb()
    );
});

// Storing data into IndexedDB
function readDB() {
    idb.open('storkExchange', 1).then(function(db) {
        var tx = db.transaction(['currencies'], 'readonly');
        var currencyStore = tx.objectStore('currencies');
        return currencyStore.getAll();
    }).then(function(items){

    });
}

// Storing assets in the Cache interface
function cacheAssets() {
    return caches.open('v1')
    .then(function(cache) {
        return cache.addAll([
            './',
            'index.html',
            'styles/app.css',
            'scripts/app.js',
            'scripts/sw.js',
            'images'
        ]);
    });
}

//Retrieving fetch events
self.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then (function(response) {
        return response || fetch(event.request);
        })
    );
});