const TokenRepository = require('../models/rwgps.token');

// Our DTO (Data Transfer Object)
class TokenDto {
    constructor(token) {
        this.userId = token?.userId;
        this.accessToken = token?.accessToken;
        this.tokenType = token?.tokenType;
        this.scope = token?.scope;
        this.createdAt = token?.createdAt;
        this.rwgpsUserId = token?.rwgpsUserId;
    }
}

const getToken = async function (userId) {
    try {
        return new TokenDto(await TokenRepository.findOne( {userId: userId}));   
    } catch (error) {
        console.log('Error retrieving token', error);        
    }
};

const deleteToken = async function (userId) {
    try {
        const result = await TokenRepository.deleteMany({userId: userId});
    } catch (error) {
        console.log('Error deleting token', error);              
    }
};



module.exports = {
    getToken,
    deleteToken
}