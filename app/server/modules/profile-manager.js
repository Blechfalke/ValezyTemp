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

//exports.updateProfile = function (newData, callback) {
//    profiles.findOne({user: newData.user}, function (e, o) {
//        o.name = newData.name;
//        o.email = newData.email;
//        o.country = newData.country;
//        if (newData.pass == '') {
//            profiles.save(o, {safe: true}, function (err) {
//                if (err)
//                    callback(err);
//                else
//                    callback(null, o);
//            });
//        } else {
//            saltAndHash(newData.pass, function (hash) {
//                o.pass = hash;
//                profiles.save(o, {safe: true}, function (err) {
//                    if (err) callback(err);
//                    else callback(null, o);
//                });
//            });
//        }
//    });
//}

/* account lookup methods */

exports.getAllProfiles = function (callback) {
    profiles.find().toArray(function (e, res) {
        if (e)
            callback(e);
        else
            callback(null, res)
    });
};

exports.getProfilesFromUser = function(user, callback)
{
    profiles.find({user:user}).toArray(function (e, res) {
        if (e)
            callback(e);
        else
            callback(null, res)
    });
};

var getObjectId = function (id) {
    return profiles.db.bson_serializer.ObjectID.createFromHexString(id)
};

exports.getProfileById = function(id, callback)
{
    //profiles.find({_id:getObjectId(id)}).toArray(function (e, res) {
    //if (e)
    //    callback(e);
    //else
    //    console.log("Profile found to edit: "+res.profileName)
    //    callback(null, res)
    //});
    profiles.findOne({_id:id}, function(e, o){
        console.log("Profile found to edit, length = "+ o.length)
        callback(o);
    });


}

exports.getProfileByProfileName = function(pname, callback)
{
    profiles.find({profileName:pname}).toArray(function (e, res) {
        if (e)
            callback(e);
        else
            callback(null, res)
    });
}

/* auxiliary methods */


var findById = function (id, callback) {
    profiles.findOne({_id: getObjectId(id)}, function (e, res) {
        if (e)
            callback(e);
        else
            callback(null, res)
    });
};
