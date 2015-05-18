var fs = require('fs');
var multer  = require('multer');
var randomstring = require('randomstring');
var md5 = require('MD5');
var mysql = require('mysql2');
var db_connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'ofor_cs310'
});



module.exports = function(app)
{
	app.get('/',function(req,res)
    {
	    res.end("OFOR.JS");
    });


    app.post('/auth', function (req, res)
    {

        var name = '';
        var pw = '';

        name = req.body.username;
        pw = req.body.password;

        var hashed_pw = md5(pw);
        var token = randomstring.generate(7);

        var isExist = false;

        db_connection.query("SELECT username FROM users WHERE " +"username='"+name+"'" + " AND password='" + hashed_pw + "'" , function(err, rows, fields)
        {
            if (err)
                console.log("ERROR: Querying users");

            if(rows.length != 0)
            {
                isExist = true;
                db_connection.query("INSERT INTO token (username, token) VALUES ('" + name + "'," +"'" + token + "')", function(err, rows, fields)
                {
                    isExist=true;

                    if(err)
                        console.log("ERROR: Querying users 2");
                });
            }
            else
                res.end("ERROR: No Login Credentials Fits!");

            if(isExist)
            {
                setTimeout(function()
                {
                    db_connection.query("DELETE FROM token WHERE username='" + name + "'", function(err, rows, fields)
                    {
                        if(err)
                            console.log("ERROR: Deleting token");
                    });
                }, 60 * 1000); // 1 Minutes of Token Validity
            }
        });



        console.log("Hash: " + token);
        console.log("Hashed Password: " + hashed_pw);
        res.end(token);
    });

    app.get('/exams/check', function(req, res)
        {
            var examname = req.query.examname;

            db_connection.query("SELECT name FROM exams WHERE name='" + examname + "'" , function (err, rows, fields)
            {
                if (err)
                    console.log("ERROR: Querying token on '/exams/add'");

                if (rows.length != 0)
                {
                    console.log("ERROR: There is an exam same name!");
                    res.end("ERROR");
                }
                else {
                    console.log("LOG: There is no exam with specified name");
                    res.end("SUCCESS");
                }
            });

        }
    );




    app.get('/exams/add', function(req, res)
    {
        var token = req.query.token;
        var examname = req.query.examname;
        var answerkey = req.query.answerkey;

        console.log(token);

        db_connection.query("SELECT * FROM token WHERE token='" + token + "'", function (err, rows, fields)
        {
            if (err)
                console.log("ERROR: Querying token on '/exams/add'");

            if (rows.length != 0)
            {
                //console.log("SUCCESS");
                //console.log(rows);
                //console.log(rows[0]['username']);

                db_connection.query("INSERT INTO exams (name, answer_key, teacher_name) VALUES ('" + examname + "','"+ answerkey + "','" + rows[0]['username']+"')", function (err, rows, fields)
                {
                    if(err)
                        console.log("ERROR: Inserting exam to database failed on '/exams/add'");
                    else {
                        console.log("SUCCESS");
                        res.send("SUCCESS");
                        res.end();
                    }
                });

            }
            else
            {
                console.log("ERROR");
                res.send("ERROR");
                res.end();
            }
        });
    });


    app.get('/exams/get', function(req, res)
    {
        db_connection.query('SELECT * from exams', function(err, rows, fields)
        {
            if (!err)
                console.log("/exams : SUCCESS");
            else
                console.log("/exams : FAILED");

            res.send(rows);
            res.end();
        });
    });

    app.post('/upload', multer(
    {
        dest: __dirname + '/public/uploads/',

        onFileUploadData: function (file, data)
        {
            console.log(data.length + ' of ' + file.fieldname + ' arrived');
        },
        onFileUploadComplete: function (file)
        {
            console.log(file.fieldname + ' uploaded to  ' + file.path);
            console.log('File name is : ' + file.name);
        }
    }));

    app.get('/uploads/:file', function (req, res)
    {
        file = req.params.file;
        var dirname = "D:/Users/SUUSER/Desktop/OFOR.JS";
        var img = fs.readFileSync(dirname + "/uploads/" + file);
        res.writeHead(200, {'Content-Type': 'image/jpg' });
        res.end(img, 'binary');

    });
};



