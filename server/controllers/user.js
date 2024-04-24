const UserRepository = require('../models/user');

// Our DTO (Data Transfer Object) for users
class UserDto {
    constructor(user) {
        this.userId = user.getUserId() || user._id;
        this.id = user.id;
        this.provider = user.provider;
        this.name = user.displayName;

        // extract 1st email
        const [firstEmail] = user.emails;
        this.email = firstEmail?.value;
    }
}

// Get a user from Provider and Id
const getUserByProviderId = async function(provider, id) {
    const user = await UserRepository.findUserByProviderId(provider, id);
    return !user ? null : new UserDto(user);
};

// Get a user by userid
const getUserByUserId = async function(userId) {
    const user = await UserRepository.findById(userId);
    return !user ? null : new UserDto(user);
};

module.exports = {
    getUserByProviderId,
    getUserByUserId
}