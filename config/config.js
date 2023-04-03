require('dotenv').config();

module.exports = {
    development: {
        myConfig: {
            sessionSecret: "topSecret!",
            refreshSessionSecret: "topSecret!",
            expiredSessionTime: "24h",
            expiredRefreshSessionTime: "24h",
            api_gateway_url: 'https://192.168.42.238:8443/',
            api_gateway_admin: 'https://192.168.42.238:8444/',
            cloud_url: 'http://103.124.115.141:3000/'
        }
    },
    test: {
        myConfig: {
            sessionSecret: "topSecret!",
            refreshSessionSecret: "topSecret!",
            expiredSessionTime: "24h",
            expiredRefreshSessionTime: "24h",
            api_gateway_url: 'https://192.168.42.238:8443/',
            api_gateway_admin: 'https://192.168.42.238:8444/',
            cloud_url: 'http://103.124.115.141:3000/'
        }
    },
    production: {
        myConfig: {
            sessionSecret: "topSecret!",
            refreshSessionSecret: "topSecret!",
            expiredSessionTime: "24h",
            expiredRefreshSessionTime: "24h",
            api_gateway_url: 'https://localhost:8443/',
            api_gateway_admin: 'https://localhost:8444/',
            cloud_url: 'http://103.124.115.141:3000/'
        }
    }
}   