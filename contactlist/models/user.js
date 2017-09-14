const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const Post = require('../models/post');

const UserSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        index: { unique: true, dropDups: true }
    },
    email: {
        type: String,
        required: true,
        index: { unique: true, dropDups: true }
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    friends_list: [String],

    posts: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }]

});

// mongodb://localhost:27017/contactlist
const User = module.exports = mongoose.model('User', UserSchema);

module.exports.updateAvatar = function(username, url, callback) {
    console.log('user name is ' + username + ' url is' + url);
    User.findOneAndUpdate({ username: username }, { $set: { avatar: url } }, { new: true, upsert: true }, callback);
}

// this function gets the user that adds the friend, and the friend 
module.exports.addFriend = function(user, friendUsername, callback) {
    for (var i = 0; i < user.friends_list.length; i++) {
        if (user.friends_list[i] == friendUsername) {
            console.log('user already added as friend');
            // err = new Error('user already added as friend');
            // callback(err, null);
            return;
        }
    }
    var update = { $push: { 'friends_list': friendUsername } };
    User.findOneAndUpdate({ username: user.username }, update, { new: true, upsert: true }, callback);

}

module.exports.addPost = (post, callback) => {
    var update = { $push: { 'posts': post } };
    User.findOneAndUpdate({ username: post.author }, update, { new: true, upsert: true }, callback);
};


// module.exports.addPost = (post, callback) => {
//     User.findOne({ username: post.author }, update, { new: true, upsert: true }, callback);
// };



module.exports.getMembersWithouFriends = function(user, callback) {
    User.find({ username: { $nin: user.friends_list } }, callback)
}

module.exports.getFriendsList = function(user, callback) {
    User.find({ username: user.friends_list }, callback);
}

module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback) {
    const query = { username: username }
    User.findOne(query, callback);
}

module.exports.addUser = (newUser, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}

// module.exports.getAllMembers = function(username, callback) {
//     User.find(function(err, members) {
//         for (var i = 0; i < members.length; i++) {
//             if (members[i].username == username)
//                 console.log('index of member is ' + i);
//         }
//         callback(null, members);

//     })
// }