var fs = require('fs');
var multer  = require('multer');
var randomstring = require('randomstring');
var md5 = require('MD5');
var mysql = require('mysql2');
var LineByLineReader = require('line-by-line');
var exec = require('child_process').exec;
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
                res.end(token);
            }
            else {
                console.log("ERROR: No Login Credentials Fits!");
                res.end("ERROR");
            }
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

    var img_token = "";
    var fname="";
    app.post('/upload', [multer(
    {

        dest: __dirname + '/public/uploads/',

        onFileUploadData: function (file, data)
        {
        },
        onFileUploadComplete: function (file)
        {
            console.log(file.fieldname + ' uploaded to  ' + file.path);
            console.log('File name is : ' + file.name);

            var examname = file.fieldname;
            fname = file.name.substr(0, file.name.length-4 );
            img_token = randomstring.generate(5);
            var answer_key="";

            var child = exec("D:/Users/SUUSER/Desktop/Dropbox/NodeJS-Workspace/OFOR.JS/public/uploads/Runner.exe empty.jpg "+ file.name + " " + fname+"_answer.txt" );
            child.stdout.on('data', function(buf)
            {
                console.log(String(buf));
            });
            child.on('close', function(code)
            {
                console.log('MATLAB Closing Code: ' + code);

                db_connection.query("SELECT name, answer_key FROM exams WHERE name='"+ examname +"'" , function(err, rows, fields)
                {
                    if (err)
                        console.log("/exams : FAILED");

                    if(rows.length != 0)
                    {
                        console.log("ANSWER KEY: " + rows[0]['answer_key']);
                        answer_key = rows[0]['answer_key'];
                    }

                });

                lr = new LineByLineReader("d:/Users/SUUSER/Desktop/Dropbox/NodeJS-Workspace/OFOR.JS/public/uploads/" + fname + "_answer.txt");

                var finalString="";
                lr.on('line', function (line)
                {
                    for(f = 0; f<800; f=f+5)
                    {
                        var signed = 0;
                        for(i=0;i<5;i++)
                        {
                            if( line[f+i] == '1')
                                signed++;
                        }
                        if(signed>1 || signed==0)
                        {
                            finalString += 'o';
                        }

                        else if( line[f] == '1')
                            finalString += 'a';
                        else if( line[f+1] == '1' )
                            finalString += 'b';
                        else if( line[f+2] == '1' )
                            finalString += 'c';
                        else if( line[f+3] == '1' )
                            finalString += 'd';
                        else if( line[f+4] == '1' )
                            finalString += 'e';
                    }
                    console.log("Final String: " + finalString);
                });

                lr.on('end', function ()
                {
                    var turkish = 0;
                    var social= 0;
                    var math= 0;
                    var science= 0;
                    var f_turkish = 0;
                    var f_social= 0;
                    var f_math= 0;
                    var f_science= 0;

                    for(a = 0; a<40; a++)
                    {
                        if( finalString[a] == answer_key[a] )
                        {
                            turkish++;
                        }
                        else if( finalString[a] != "o" && finalString[a] != answer_key[a] )
                        {
                            f_turkish++;
                        }
                    }
                    console.log("Turkish [True]: " + turkish);
                    console.log("Turkish [False]: " + f_turkish);
                    for(b = 40; b<80; b++)
                    {
                        if( finalString[b] == answer_key[b] )
                        {
                            social++;
                        }
                        else if( finalString[b] != "o" && finalString[b] != answer_key[b] )
                        {
                            f_social++;
                        }
                    }
                    console.log("Social [True]: " + social);
                    console.log("Social [False]: " + f_social);
                    for(c = 80; c<120; c++)
                    {
                        if( finalString[c] == answer_key[c] )
                        {
                            math++;
                        }
                        else if( finalString[c] != "o" && finalString[c] != answer_key[c] )
                        {
                            f_math++;
                        }
                    }
                    console.log("Math [True]: " + math);
                    console.log("Math [False]: " + f_math);
                    for(d = 120; d<160; d++)
                    {
                        if( finalString[d] == answer_key[d] )
                        {
                            science++;
                        }
                        else if( finalString[d] != "o" && finalString[d] != answer_key[d] )
                        {
                            f_science++;
                        }
                    }
                    console.log("Science [True]: " + science);
                    console.log("Science [False]: " + f_science);

                    var final = turkish + " " + f_turkish + " " + social + " " + f_social + " " + math + " " + f_math + " " + science + " " + f_science;
                    console.log(final);
                    fs.writeFile('D:/Users/SUUSER/Desktop/Dropbox/NodeJS-Workspace/OFOR.JS/public/results/'+img_token+".txt", final, function(err)
                    {
                        if(err) {
                            return console.log(err);
                        }

                        console.log('D:/Users/SUUSER/Desktop/Dropbox/NodeJS-Workspace/OFOR.JS/public/results/'+img_token+".txt WRITTEN!");
                    });
                    console.log("FINAL DEBUG END");
                });
            });
        }
    }), function(req, res){
        res.end(img_token);
        console.log(img_token);
    }]);

    app.get('/results/:file', function (req, res)
    {
        file = req.params.file;
        var dirname = "D:/Users/SUUSER/Desktop/Dropbox/NodeJS-Workspace/OFOR.JS/public/results/";
        var text = fs.readFileSync(dirname + file + ".txt");
        res.end(text);
    });
};



