#!/usr/bin/env node

'use strict';


const Fs = require('fs');
const _ = require('lodash');
const Cheerio = require('cheerio');
const Async = require('async');
const Request = require('request-promise');
const CookieKit = require('tough-cookie-kit');
const Etc2tc = require('etc2tc');
const Moment = require('moment');
const Bunyan = require('bunyan');
const Inquirer = require('inquirer');
const Chalk = require('chalk');


const Log = Bunyan.createLogger({
    name: 'zhihu-spider',
    src: true
});
// Log.trace, Log.debug, Log.info, Log.warn, Log.error, and Log.fatal


let gCookies = Request.jar(new CookieKit(Etc2tc('cookies.txt', 'cookies.json')));
const gRequest = Request.defaults({
    // 'proxy': 'http://8.8.8.8:8888',
    'gzip': true,
    'simple': false, // Get a rejection only if the request failed for technical reasons
    'resolveWithFullResponse': true, // Get the full response instead of just the body
    'followRedirect': false,
    'jar': gCookies
});

let gHeaders = {
    'Host': 'www.zhihu.com',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch, br',
    'Accept-Language': 'zh-CN,zh;q=0.8'
};


main();

function main() {
    return getHtml('https://www.zhihu.com/', gHeaders).then(function(res) {
        let $ = Cheerio.load(res.body);
        $('.feed-title a').each(function(i, elem) {
            console.log($(elem).text().trim());
        });
    });

    // let headers = _.assign({}, gHeaders, {
    //     'Origin': 'https://www.zhihu.com',
    //     'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    //     'Accept': '*/*',
    //     'X-Requested-With': 'XMLHttpRequest',
    //     'X-Xsrftoken': getXsrfCode(),
    //     'Referer': 'https://www.zhihu.com/',
    //     'Accept-Encoding': 'gzip, deflate, br'
    // });
    // let data = {
    //     'params': {
    //         'offset': 10,
    //         'start': "9"
    //     },
    //     'method': 'next'
    // };
    // return postJson('https://www.zhihu.com/node/TopStory2FeedList', headers, data).then(function(res) {
    //     console.log(res.body);
    // });
}

function getXsrfCode() {
    let arrCookies = gCookies.getCookieString('https://www.zhihu.com').split('; ');
    for(let i = 0, len = arrCookies.length; i < len; i++) {
        let value = arrCookies[i].split('=', 2);
        if ((value.length === 2) && (value[0].trim() === '_xsrf')) {
            return value[1].trim();
        }
    }
    return null;
}

function getHtml(url, headers, data) {
    let options = {
        'url': url,
        'headers': headers,
        'qs': data
    };
    return get(options);
}

function getJson(url, headers, data) {
    let options = {
        'url': url,
        'headers': headers,
        'qs': data,
        'json': true
    };
    return get(options);
}

function postJson(url, headers, json) {
    let options = {
        'url': url,
        'headers': headers,
        'form': json,
        'json': true
    };
    return post(options);
}

function postForm(url, headers, form) {
    let options = {
        'url': url,
        'headers': headers,
        'form': form
    };
    return post(options);
}

function get(options) {
    return reqHttp(_.assign({}, options, {
        'method': 'GET'
    }));
}

function post(options) {
    return reqHttp(_.assign({}, options, {
        'method': 'POST'
    }));
}

function reqHttp(options) {
    return gRequest(options)
        .then(procReqSucceeded)
        .catch(procReqFailed);
}

function procReqSucceeded(response) {
    return response;
}

function procReqFailed(error) {
    return Log.error(error);
}

