// Allez voir la page https://api.intra.42.fr/apidoc/guides/web_application_flow Documentation du systeme de connection

const request = require("request");

fetch("https://api.intra.42.fr/oauth/token", {
    headers: {'Content-Type' : 'application/json'},
})