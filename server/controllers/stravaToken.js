const axios = require("axios").default;
const TokenRepository = require('../models/strava.token');
const User = require("../models/user");

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
    try {
        return new TokenDto(await TokenRepository.findOne( {userId: userId}));   
    } catch (error) {
        console.log('Error retrieving token', error);        
    }
}

const deleteToken = async function (userId) {
    try {
        const result = await TokenRepository.deleteMany({userId: userId});
    } catch (error) {
        console.log('Error deleting token', error);              
    }
}

const refreshToken = async function(userId, refreshToken) {
    try {
        const result = await axios.post(refreshUrl, {
            client_id: process.env.STRAVA_CLIENT_ID,
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: refreshToken
        });

        // extract token from data
        const token = TokenRepository.createFromRefreshResult(userId, result.data);
        if (token) {
            const savedToken = await TokenRepository.createOrUpdateToken(token);

            // return TokenDTO
            return new TokenDto(savedToken);
        }
    } catch (error) {
        console.log(`Error refreshing token for user Id: ${userId}`, error);
    }

    return null;
}

// This method checks all current strava tokens and refreshes any that
// are within 1 hour of expiration
const refreshExpiringUserTokens = async function() {
    try {
        const now = new Date();
        const expirary = new Date(now.setHours(now.getHours() - 1));
        const expiringTokens = await TokenRepository.find( { expiresAt: {$lte: expirary} });
        if (expiringTokens?.length > 0) {
            console.log(`Found ${expiringTokens.length} tokens that need refreshing`);
            for (let i = 0; i < expiringTokens.length; i++) {
                const token = expiringTokens[i];
                const newToken = await this.refreshToken(token.userId, token.refreshToken);
                if (newToken) {
                    console.log(`Token successfully refreshed for user ${token.userId}`);
                }
            }
        }       
    } catch (error) {
        console.error('Error encountered while refreshing tokens', error);
    }
}

module.exports = {
    getToken,
    deleteToken,
    refreshToken,
    refreshExpiringUserTokens
}