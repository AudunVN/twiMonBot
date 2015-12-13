/**
 * Created by Anton on 06.12.2015.
 */
var debug = require('debug')('index');
var debugLog = require('debug')('index:log');
debugLog.log = console.log.bind(console);
var Promise = require('bluebird');
var base = require('./base');
var Checker = require('./checker');
var Chat = require('./chat');
var TelegramBotApi = require('node-telegram-bot-api');
var EventEmitter = require('events').EventEmitter;
var Daemon = require('./daemon');

/**
 * @type {
 * {
 * config: {},
 * language: {
 * help: string,
 * offline: string,
 * emptyServiceList: string,
 * enterChannelName: string,
 * enterService: string,
 * serviceIsNotSupported: string,
 * channelExists: string,
 * channelAdded: string,
 * commandCanceled: string,
 * channelDontExist: string,
 * channelDeleted: string,
 * cleared: string,
 * channelNameIsEmpty: string,
 * selectDelChannel: string,
 * channelIsNotFound: string,
 * clearSure: string,
 * users: string,
 * channels: string,
 * preview: string,
 * watchOn: string,
 * online: string
 * },
 * storage: {chatList: {}, lastStreamList: Array},
 * serviceList: string[],
 * serviceToTitle: {goodgame: string, twitch: string, youtube: string, hitbox: string}}
 * }
 */
var options = {
    config: {},
    language: {},
    storage: {
        chatList: {},
        lastStreamList: []
    },
    serviceList: ['twitch', 'goodgame', 'youtube', 'hitbox'],
    serviceToTitle: {
        goodgame: 'GoodGame',
        twitch: 'Twitch',
        youtube: 'Youtube',
        hitbox: 'Hitbox'
    },
    serviceMatchRe: {
        goodgame: /goodgame\.ru\/channel\/([^\/]+)/i,
        twitch: /twitch\.tv\/([^\/]+)/i,
        youtube: [/youtube\.com\/user\/([^\/]+)/i, /youtube\.com\/channel\/([^\/]+)/i],
        hitbox: /hitbox\.tv\/([^\/]+)/i
    },
    services: {},
    events: null
};

(function() {
    "use strict";
    return Promise.resolve().then(function() {
        options.events = new EventEmitter();
    }).then(function() {
        return base.loadConfig().then(function(config) {
            options.config = config;
        });
    }).then(function() {
        return base.loadLanguage().then(function(language) {
            options.language = language;
        });
    }).then(function() {
        return base.storage.get(Object.keys(options.storage)).then(function(storage) {
            for (var key in storage) {
                options.storage[key] = storage[key];
            }
        });
    }).then(function() {
        return Promise.all(options.serviceList.map(function(name) {
            return Promise.resolve().then(function() {
                var service = require('./services/' + name);
                service = options.services[name] = new service(options);
                return service.onReady;
            });
        }));
    }).then(function() {
        options.daemon = new Daemon(options);

        (typeof gc === 'function') && options.events.on('tickTack', function() {
            gc();
        });
    }).then(function() {
        /**
         * @type {{
         * sendMessage: function,
         * sendPhoto: function,
         * on: function,
         * _polling: {lastUpdate: number},
         * initPolling: function
         * }}
         */
        options.bot = new TelegramBotApi(options.config.token, {
            polling: {
                timeout: options.config.pollongTimeout || 120
            }
        });
    }).then(function() {
        if (options.config.botanToken) {
            options.botan = require('botanio')(options.config.botanToken);
        } else {
            options.botan = {track: function(data, action){debugLog("Track %s, %j", action, data)}};
        }
    }).then(function() {
        options.chat = new Chat(options);
    }).then(function() {
        options.checker = new Checker(options);
    }).catch(function(err) {
        debug('Loading error %s', err);
    });
})();