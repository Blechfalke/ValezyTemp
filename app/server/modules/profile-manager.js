var crypto = require('crypto');
var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
var moment = require('moment');

var dbPort = 27017;
var dbHost = 'localhost';
var dbName = 'node-login';

/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function (e, d) {
    if (e) {
        console.log(e);
    } else {
        console.log('connected to database :: ' + dbName);

        var myCursor = db.collection('profiles').find({});

        myCursor.toArray(function (err, docs) {
            if (!err)
                console.log(docs);
        })
    }
});
var profiles = db.collection('profiles');

/* record insertion, update & deletion methods */

exports.addNewProfile = function (newData, callback) {
    // append date stamp when record was created //
    newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
    profiles.insert(newData, {safe: true}, callback);
};

exports.updateProfile = function (newData, callback) {
    profiles.findOne({_id: getObjectId(newData.id)}, function (e, o) {
        o.profileName = newData.profileName;
        o.description = newData.description;
        o.name = newData.name;
        o.age = newData.age;
        profiles.save(o, {safe: true}, function (err) {
            if (err)
                callback(err);
            else
                callback(null, o);
        });
    });
}

/* account lookup methods */

exports.deleteProfile = function(id, callback)
{
    profiles.remove({_id: getObjectId(id)}, callback);
}

exports.getAllProfiles = function (callback) {
    profiles.find().toArray(function (e, res) {
        if (e)
            callback(e);
        else
            callback(null, res)
    });
};

exports.getProfilesFromUser = function (user, callback) {
    profiles.find({user: user}).toArray(function (e, res) {
        if (e)
            callback(e);
        else
            callback(null, res)
    });
};


exports.findById = function (id, callback) {
    profiles.findOne({_id: getObjectId(id)}, function (e, res) {
        if (e)
            callback(e)
        else
            callback(null, res)
    });
};


exports.getProfileByProfileName = function (pname, callback) {
    profiles.find({profileName: pname}).toArray(function (e, res) {
        if (e)
            callback(e);
        else
            callback(null, res)
    });
}

/* auxiliary methods */

var getObjectId = function (id) {
    return profiles.db.bson_serializer.ObjectID.createFromHexString(id)
};
