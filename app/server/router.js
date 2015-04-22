var CT 		= require('./modules/country-list');
var AM 		= require('./modules/account-manager');
var PM 		= require('./modules/profile-manager');
var EM 		= require('./modules/email-dispatcher');
var multer  = require('multer');
var util	= require('util');

module.exports = function (app, rooms) {

// main login page //

    app.get('/', function (req, res) {
        // check if the user's credentials are saved in a cookie //
        if (req.cookies.user == undefined || req.cookies.pass == undefined) {
            res.render('login', {title: 'Hello - Please Login To Your Account'});
        } else {
            // attempt automatic login //
            AM.autoLogin(req.cookies.user, req.cookies.pass, function (o) {
                if (o != null) {
                    req.session.user = o;
                    res.redirect('/home');
                } else {
                    res.render('login', {title: 'Hello - Please Login To Your Account'});
                }
            });
        }
    });

    app.post('/', function (req, res) {
        AM.manualLogin(req.param('user'), req.param('pass'), function (e, o) {
            if (!o) {
                res.send(e, 400);
            } else {
                req.session.user = o;
                if (req.param('remember-me') == 'true') {
                    res.cookie('user', o.user, {maxAge: 900000});
                    res.cookie('pass', o.pass, {maxAge: 900000});
                }
                res.send(o, 200);
            }
        });
    });

// logged-in user homepage //

    app.get('/home', function (req, res) {
        if (req.session.user == null) {
            // if user is not logged-in redirect back to login page //
            res.redirect('/');
        } else {
            res.render('home', {
                title: 'Control Panel',
                countries: CT,
                udata: req.session.user
            });
        }
    });

    app.post('/home', function (req, res) {
        if (req.param('user') != undefined) {
            AM.updateAccount({
                user: req.param('user'),
                name: req.param('name'),
                email: req.param('email'),
                country: req.param('country'),
                pass: req.param('pass')
            }, function (e, o) {
                if (e) {
                    res.send('error-updating-account', 400);
                } else {
                    req.session.user = o;
                    // update the user's login cookies if they exists //
                    if (req.cookies.user != undefined && req.cookies.pass != undefined) {
                        res.cookie('user', o.user, {maxAge: 900000});
                        res.cookie('pass', o.pass, {maxAge: 900000});
                    }
                    res.send('ok', 200);
                }
            });
        } else if (req.param('logout') == 'true') {
            res.clearCookie('user');
            res.clearCookie('pass');
            req.session.destroy(function (e) {
                res.send('ok', 200);
            });
        }
    });

// creating new accounts //

    app.get('/signup', function (req, res) {
        res.render('signup', {title: 'Signup', countries: CT});
    });

    app.post('/signup', function (req, res) {
        AM.addNewAccount({
            name: req.param('name'),
            email: req.param('email'),
            user: req.param('user'),
            pass: req.param('pass'),
            country: req.param('country')
        }, function (e) {
            if (e) {
                res.send(e, 400);
            } else {
                res.send('ok', 200);
            }
        });
    });

// password reset //

    app.post('/lost-password', function (req, res) {
        // look up the user's account via their email //
        AM.getAccountByEmail(req.param('email'), function (o) {
            if (o) {
                res.send('ok', 200);
                EM.dispatchResetPasswordLink(o, function (e, m) {
                    // this callback takes a moment to return //
                    // should add an ajax loader to give user feedback //
                    if (!e) {
                        //	res.send('ok', 200);
                    } else {
                        res.send('email-server-error', 400);
                        for (k in e) console.log('error : ', k, e[k]);
                    }
                });
            } else {
                res.send('email-not-found', 400);
            }
        });
    });

    app.get('/reset-password', function (req, res) {
        var email = req.query["e"];
        var passH = req.query["p"];
        AM.validateResetLink(email, passH, function (e) {
            if (e != 'ok') {
                res.redirect('/');
            } else {
                // save the user's email in a session instead of sending to the client //
                req.session.reset = {email: email, passHash: passH};
                res.render('reset', {title: 'Reset Password'});
            }
        })
    });

    app.post('/reset-password', function (req, res) {
        var nPass = req.param('pass');
        // retrieve the user's email from the session to lookup their account and reset password //
        var email = req.session.reset.email;
        // destory the session immediately after retrieving the stored email //
        req.session.destroy();
        AM.updatePassword(email, nPass, function (e, o) {
            if (o) {
                res.send('ok', 200);
            } else {
                res.send('unable to update password', 400);
            }
        })
    });

    //profile management

    app.get('/profiles', function (req, res) {
        if (req.session.user == null) {
            // if user is not logged-in redirect back to login page //
            res.redirect('/');
        } else {
            PM.getProfilesFromUser(req.session.user.user, function (e, profiles) {
                if (e) return next(e);

                return res.render('profiles', {
                    title: 'My Profiles',
                    profiles: profiles,
                    udata: req.session.user
                });
            })
        }
    });

    app.get('/add-profiles', function (req, res) {
        if (req.session.user == null) {
            // if user is not logged-in redirect back to login page //
            res.redirect('/');
        } else {
            res.render('add-profiles', {
                title: 'Add Profiles',
                udata: req.session.user
            });
        }
    });

    app.post('/add-profiles', function (req, res) {
        if (req.session.user == null) {
            // if user is not logged-in redirect back to login page //
            res.redirect('/');
        } else {
            PM.addNewProfile({
                user: req.session.user.user,
                profileName: req.param('profile-name'),
                description: req.param('description'),
                name: req.param('name'),
                age: req.param('age')
            }, function (e) {
                if (e) {
                    res.send(e, 400);
                } else {
                    res.redirect('profiles');
                }
            });
        }
    });

    app.get('/edit-profiles/:id', function (req, res) {
        console.log('edit profile with id: ' + req.params.id);
        if (req.session.user == null) {
            // if user is not logged-in redirect back to login page //
            res.redirect('/');
        } else {
            PM.findById(req.params.id, function (e, profile) {
            	if (e) 
                	return next(e);

                console.log(profile);
                return res.render('edit-profiles', {
                    title: 'Edit Profiles',
                    profile: profile,
                    udata: req.session.user
                });
            })
        }
    });

    app.post('/edit-profiles/:id', function (req, res) {
        PM.updateProfile({
            id: req.param('id'),
            user: req.param('user'),
            profileName: req.param('profile-name'),
            description : req.param('description'),
            name: req.param('name'),
            age: req.param('age')
        }, function (e) {
            if (e) {
                res.send(e, 400);
            } else {
                res.send('ok', 200);
                res.redirect('profiles');
            }
        });
    });

    app.get('/photos', function (req, res) {
        if (req.session.user == null) {
            // if user is not logged-in redirect back to login page //
            res.redirect('/');
        } else {
            //PM.getProfilesFromUser(req.session.user.user, function (e, profiles) {
                //if (e) return next(e);
                return res.render('photos', {
                    title: 'My Photos',
                    udata: req.session.user
                });
            //})
        }
    });
    
    
    
    
    var multerUp = multer({ dest: './uploads/',
    	rename: function (fieldname, filename) {
    		return filename+Date.now();
    	},
    	onFileUploadStart: function (file) {
    		console.log(file.originalname + ' is starting ...')
    	},
    	onFileUploadComplete: function (file) {
    		console.log(file.fieldname + ' uploaded to  ' + file.path)
    		done=true;
    	}
    });
    
    app.post('/api/photo', multerUp, function(req, res) {

            console.log('IN POST (/api/photo)');
            console.log(req.body)

            var filesUploaded = 0;

            if ( Object.keys(req.files).length === 0 ) {
                console.log('no files uploaded');
            } else {
                console.log(req.files)

                var files = req.files.file1;
                if (!util.isArray(req.files.file1)) {
                    files = [ req.files.file1 ];
                } 

                filesUploaded = files.length;
            }

            res.json({ message: 'Finished! Uploaded ' + filesUploaded + ' files.  Route is /files2' });
        });


//    app.post('/api/photo',function(req,res){
//    	console.log('waiting');
//    	if(app.locals.done == true){
//    		console.log(req.files);
//    		res.end("File uploaded.");
//    	}
//    });
    

// view & delete accounts/profiles //
    app.get('/print', function (req, res) {
        AM.getAllRecords(function (e, accounts) {
            res.render('print', {
                title: 'Account List',
                accts: accounts
            });
        })
    });

    app.get('/print-profiles', function (req, res) {
        PM.getAllProfiles(function (e, profiles) {
            res.render('print-profiles', {
                title: 'Profile List',
                profiles: profiles
            });
        })
    });

    app.post('/delete', function (req, res) {
        AM.deleteAccount(req.body.id, function (e, obj) {
            if (!e) {
                res.clearCookie('user');
                res.clearCookie('pass');
                req.session.destroy(function (e) {
                    res.send('ok', 200);
                });
            } else {
                res.send('record not found', 400);
            }
        });
    });

    app.post('/delete-profile', function (req, res) {
        PM.deleteProfile(req.body.id, function (e, obj) {
            if (!e) {
                res.send('ok', 200);
            } else {
                res.send('record not found', 400);
            }
        });
    });

    app.get('/reset', function (req, res) {
        AM.delAllRecords(function () {
            res.redirect('/print');
        });
    });

    //chatrooms

    //go to chatrooms
    app.get('/chatrooms', function(req, res, next){

        //render the chatrooms file
        res.render('chatrooms', {title:'Chatrooms', udata:req.session.user});

    })

    //go to specific chat room ( room/:id -> :id = any id given in the url)
    app.get('/room/:id', function(req, res, next){

        //get room name
        var room_name = findTitle(req.params.id);

        //req.params.id = get id from url parameters
        res.render('room', {udata : req.session.user, room_number : req.params.id, room_name : room_name})

    })

    //get room name
    function findTitle (room_id) {

        var n = 0;

        //loop through all rooms
        while(n < rooms.length){

            //check if room_id given is = to room_number in DB
            if (rooms[n].room_number == room_id) {

                //return name
                return rooms[n].room_name;
                break;

            }else{

                n++;
                continue;

            }

        }

    }


    app.get('*', function (req, res) {
        res.render('404', {title: 'Page Not Found'});
    });

};
