const axios = require("axios").default;
const TokenRepository = require('../models/strava.token');

const refreshUrl = "https://www.strava.com/api/v3/oauth/token";

// Our DTO (Data Transfer Object)
class TokenDto {
    constructor(token) {
        this.userId = token?.userId;
        this.accessToken = token?.accessToken;
        this.refreshToken = token?.refreshToken;
        this.expiresAt = token?.expiresAt;
    }
}

const getToken = async function (userId) {
    return new TokenDto(TokenRepository.findOne( {userId: userId}));
}

const refreshToken = async function(userId, refreshToken) {
    const token = await axios.post(refreshUrl, {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken
    });

    return new TokenDto(
        await TokenRepository.createOrUpdateToken( {
            userId: userId,
            ...token.data
        })
    );
}   

module.exports = {
    getToken,
    refreshToken
}