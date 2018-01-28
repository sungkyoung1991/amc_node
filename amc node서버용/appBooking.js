// 모듈을 추출합니다.
var socketio = require('socket.io');
var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');



// 변수를 선언합니다.
var seats =[];
var cancelSeats =[];
var arrayN = [];
var clientList = [];

// 웹 서버를 생성합니다.
var app = express();
var router = express.Router();

// 미들웨어를 설정합니다.
app.use('/', router);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

app.set('cinema', __dirname + '/cinema');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//===== 데이터베이스 연결 ========//
var MongoClient = require('mongodb').MongoClient;
var database;
var screenNo;
var databaseUrl = 'mongodb://183.98.215.171:26017/amc';
//var databaseUrl = 'mongodb://localhost:27017/test';
function connectDB() {
	// 데이터베이스 연결 정보
		
	// 데이터베이스 연결
	MongoClient.connect(databaseUrl, function(err, db) {
		if (err) throw err;
		
		console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
		database = db;
	});
}
//=============================//

// 라우트를 수행합니다.
app.get('/selectSeat', function (request, response, next) {
    
    //1. 상영정보번호를 추출한다.
    //http://127.0.0.1:52273/selectSeat?screenNo=1020 => 상영정보번호를 get
    screenNo = request.query.screenNo;
    console.log("req받은 screenNo는 : "+screenNo);
    
    
    database.collection('seats').find({"screencontent_no":screenNo}, {"_id":false, "screencontent_no":false, "screen_theater":false}).toArray(function(err, docs){
   
            if (err) throw err;
            seats =[];
        
            docs[0].seat_no.forEach(function(docc, index) { 
                
                arrayN =[];
                for (i = 0; i < docc.row.length; i++) { 
                    arrayN.push(docc.row[i]);
                }
                
             seats.push(arrayN); 
               
            });  
        
     });
    
    response.render('page', {no : screenNo});   
})

app.get('/JSONselectSeat', function (request, response, next) {
    
    //1. 상영정보번호를 추출한다.
    //http://127.0.0.1:52273/JSONselectSeat?screenNo=1020 => 상영정보번호를 get
    screenNo = request.query.screenNo;
    console.log("Request for JSON :: screenNo는 : "+screenNo);
    var seats =[];
    var colLength;
    var rowLength=0;
        
    database.collection('seats').find({"screencontent_no":screenNo}, {"_id":false, "screencontent_no":false, "screen_theater":false}).toArray(function(err, docs){
   
            if (err) throw err;
           
            
            docs[0].seat_no.forEach(function(docc, index) { 
                colLength = docc.row.length;
                
                for (i = 0; i < docc.row.length; i++) { 
                    seats.push(docc.row[i]);  
                    
                }
                rowLength++;

            });    
        var json = JSON.stringify({ 
        colLength: colLength, 
        rowLength: rowLength, 
        seats: seats
        });
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(json); 
        console.log(json);
     });    
   
    
})


app.get('/cancelAlarm', function (request, response, next) {
    //http://127.0.0.1:52273/cancelAlarm?screenNo=10172
    screenNo = request.query.screenNo; 
    
    database.collection('seats').find({"screencontent_no":screenNo}, {"_id":false, "screencontent_no":false, "screen_theater":false}).toArray(function(err, docs){
   
            if (err) throw err;
            cancelSeats =[];
        
            docs[0].seat_no.forEach(function(docc, index) { 
                arrayN =[];
                for (i = 0; i < docc.row.length; i++) { 
                    arrayN.push(docc.row[i]);
                }
             cancelSeats.push(arrayN); 
            });       
     });
    
    response.render('cancel_alarm', {no : screenNo});   
});

app.get('/alarmSeats', function (request, response, next) {
    console.log("/alarmSeats 요청옴");
    response.send(cancelSeats);
});

app.get('/seats', function (request, response, next) {
    console.log("/seats 요청옴");
    response.send(seats);
});


var abc = require('./routes/abc');
app.get('/addSeats2', function (request, response, next) {
    console.log("/addSeats2 요청옴");
    abc.go();
});
var qs = require('querystring');





app.post('/addSeats', function (request, response) {
    console.log("/addSeats 요청옴!!!!");
    //1. 상영정보번호를 추출한다.
   
    screenNo = request.body.screenNo;
    theater = request.body.theater;
    console.log("좌석현황에 추가할 상영번호 : "+screenNo+", 상영관번호 : "+theater);

    var inputQuery;

    if(theater=='1'){
           database.collection('seats').insertOne({"screen_theater":theater, "screencontent_no":screenNo, "seat_no": [
			{ "row": ["0","0","1","1","0","1","1","1","1","1","1","1","1","0","1","1","1","1"] } ,
			{ "row": ["0","1","1","1","0","1","1","1","1","1","1","1","1","0","1","1","1","0"] } ,
			{ "row": ["1","1","1","1","0","1","1","1","1","1","1","1","1","0","1","1","1","1"] } ,
			{ "row": ["1","1","1","1","0","1","1","1","1","1","1","1","1","0","1","1","1","1"] } ,
			{ "row": ["1","1","1","1","0","1","1","1","1","1","1","1","1","0","1","1","1","1"] } ,
			{ "row": ["1","1","1","1","0","1","1","1","1","1","1","1","1","0","1","1","1","1"] } ,
			{ "row": ["1","1","1","1","0","1","1","1","1","1","1","1","1","0","1","1","1","0"] } ,
			{ "row": ["1","1","1","1","0","1","1","1","1","1","1","1","1","0","1","1","1","1"] } ,
			{ "row": ["0","1","1","1","0","1","1","1","1","1","1","1","1","0","1","1","1","1"] } ,
			{ "row": ["0","0","0","0","0","1","1","1","1","1","1","1","1","0","1","1","1","1"] } ,
			{ "row": ["0","0","0","0","0","1","1","1","1","1","1","1","1","0","1","1","1","1"] }
		    ]
	        }, function(err, res) {

                    if (err) throw err;
                    console.log("1 document inserted");       

                }); 
    }else if(theater=='2'){
        database.collection('seats').insertOne({"screen_theater":theater, "screencontent_no":screenNo, "seat_no": [
            { "row": ["0","0","0","1","1","0","0","0","1","1","0","0","0"] } ,
			{ "row": ["0","0","1","1","1","1","0","1","1","1","1","0","0"] } ,
            { "row": ["0","1","1","1","1","1","1","1","1","1","1","1","0"] } ,
            { "row": ["0","1","1","1","1","1","1","1","1","1","1","1","0"] } ,
            { "row": ["0","1","1","1","1","1","1","1","1","1","1","1","0"] } ,
            { "row": ["0","1","1","1","1","1","1","1","1","1","1","1","0"] } ,
            { "row": ["0","0","1","1","1","1","1","1","1","1","1","0","0"] } ,
            { "row": ["0","0","1","1","1","1","1","1","1","1","1","0","0"] } ,
            { "row": ["0","0","0","1","1","1","1","1","1","1","0","0","0"] } ,
            { "row": ["0","0","0","0","1","1","1","1","1","0","0","0","0"] } ,
            { "row": ["0","0","0","0","0","1","1","1","0","0","0","0","0"] } ,
            { "row": ["0","0","0","0","0","0","1","0","0","0","0","0","0"] } 
		    ]
	        }, function(err, res) {

                    if (err) throw err;
                    console.log("1 document inserted");       

                });

    }else{
        console.log("상영관번호 지정이 잘못되었습니다.");
    }
    
    response.writeHead(200, {'Content-Type': 'application/x-www-form-urlencoded'});
    response.end('this is the end of response from node.js');
});



app.get('/random_select', function (request, response, next) {
    
    //1. 상영정보번호를 추출한다.
    //http://127.0.0.1:52273/random_select?screenNo=10000&headCount=2
    screenNo = request.query.screenNo;
    var headCount = request.query.headCount;
    console.log("::::::::::::req받은 screenNo는 : "+screenNo+", 좌석개수 : "+headCount);
 
    var randomRow; 
    var randomCol;
    var randomValue;
    var list = [];
    var c = headCount;
    
    database.collection('seats').find({"screencontent_no":screenNo}, {"_id":false, "screencontent_no":false, "screen_theater":false}).toArray(function(err, docs){
   
            if (err) throw err;
            seats =[];
            
            docs[0].seat_no.forEach(function(docc, index) { 
                arrayN =[];
                for (i = 0; i < docc.row.length; i++) { 
                    arrayN.push(docc.row[i]);
                }
                
             seats.push(arrayN); 
               
            });  
        console.log("DB에서 가져온 좌석현황 : "+seats);
        console.log(" rowLength : "+ docs[0].seat_no.length+",  colLength : "+docs[0].seat_no[0].row.length);
        
    
        function getRandom(){
            //randomRow = randomIntInc(0,(docs[0].seat_no.length)-1);
            randomRow = randomIntInc((docs[0].seat_no.length)-4,(docs[0].seat_no.length)-1);
            randomCol = randomIntInc(0,(docs[0].seat_no[randomRow].row.length)-1);
            randomValue = docs[0].seat_no[randomRow].row[randomCol]
            console.log("randomRow, number2, randomValue : "+randomRow+", "+randomCol+", "+randomValue);
        } 
        while(true){
             getRandom();
            if(randomValue == 1){
                console.log('randomValue가 예매가능한 1입니다.');
                list.push([randomRow, randomCol]);
                console.log('list[0] : '+list[0]+", list[1] : "+list[1]);              
                
                if(headCount==1){
                    console.log('headCount 1');
                    response.render('random_select', {screenNo:screenNo, list:list, ok:"success"});
                    break;
                }else{
                    if(docs[0].seat_no[randomRow].row[(randomCol+1)] == 1){
                        list.push([randomRow, randomCol+1]);
                        response.render('random_select', {screenNo:screenNo, list:list, ok:"success"});
                        break;
                    }else if(docs[0].seat_no[randomRow].row[(randomCol-1)] == 1){
                        list.push([randomRow, randomCol-1]);
                        response.render('random_select', {screenNo:screenNo, list:list, ok:"success"});
                        break;
                    }
                    headCount = 1;
                }
                
            }else if(randomValue == 2){
                console.log('randomValue가 2입니다.');
                response.render('random_select', {screenNo:screenNo, list:list, ok:"failed"});
                list = [];
                break;
            }else if(randomValue == 0){
                console.log('randomValue가 0입니다.'); 
            }else{
                console.log('오마이갓! randomValue가 예상치 못한 값입니다.');
                break;
            }
        }
        
        console.log('random으로 선택된 좌석의 갯수는 : '+list.length);
        if(list.length<1){
            console.log('list.length <1');
        }else if(list.length>=1){
                //1. db의 해당 좌석을 예약상태로 수정한다
            var text =  {[ 'seat_no.'+list[0][0]+'.row.'+list[0][1] ] :"2" };
            var findCondition = { screencontent_no: screenNo};// A는 없어도 될것 같은데
            var updateValue = { $set: text };
            console.log("data.y : "+list[0][0]+"data.x : "+list[0][1]);

            /////db update다 function으로 빼기
            database.collection("seats").updateOne(findCondition, updateValue, function(err, res) {
                console.log("response is : "+res);
                console.log("DB에 좌석정보 업데이트함");
            });

            //2. 예약정보('reserve')를 모든 회원에게 알려준다
            io.sockets.in(screenNo).emit('reserve',{ x:list[0][1], y: list[0][0], roomId : screenNo}); 
            console.log("모든 client에게 새로 업데이트된 좌석정보 알려줌");


            if(c==2){
                var text =  {[ 'seat_no.'+list[1][0]+'.row.'+list[1][1] ] :"2" };
                var findCondition = { screencontent_no: screenNo};
                var updateValue = { $set: text };
                console.log("data.y : "+list[1][0]+"data.x : "+list[1][1]);

                database.collection("seats").updateOne(findCondition, updateValue, function(err, res) {
                    console.log("response is : "+res);
                    console.log("DB에 좌석정보 업데이트함");
                });

                //2. 예약정보('reserve')를 모든 회원에게 알려준다
                io.sockets.in(screenNo).emit('reserve',{ x:list[1][1], y: list[1][0], roomId : screenNo}); 

            }
        }
        
        
        
        
     });
       
});

function randomIntInc (low, high) {
     return Math.floor(Math.random() * (high - low + 1) + low);
}

// 웹 서버를 실행합니다.
var server = http.createServer(app)
server.listen(52273, function () {
    console.log('Server Running at ' +databaseUrl);
    connectDB();    
});


// 소켓 서버를 생성 및 실행합니다.
var io = socketio.listen(server);


io.sockets.on('connection', function (socket) {
    
    console.log("client가 connection요쳥했다");
    //예매
    socket.on('message', function a(data) {

        //1. db의 해당 좌석을 예약상태로 수정한다
        var text =  {[ 'seat_no.'+data.y+'.row.'+data.x] :"2" };
        var findCondition = { screencontent_no: screenNo};
        var updateValue = { $set: text };
        console.log("data.y : "+data.y+"data.x : "+data.x);
      
        database.collection("seats").updateOne(findCondition, updateValue, function(err, res) {
            console.log("response is : "+res);
            console.log("DB에 좌석정보 업데이트함");
        });
        

        //2. 예약정보('reserve')를 모든 회원에게 알려준다
        var roomId = data.roomId;
        io.sockets.in(roomId).emit('reserve', data);
        console.log("모든 client에게 새로 업데이트된 좌석정보 알려줌");
 /***********************************************************************/       
        //3. clientList에 예매현황 추가하기
        console.log(socket.id+'님의 요청으로 DB를 업데이트했습니다. clientList에 추가합니다.');
        console.log('id : '+socket.id+', roomId : '+roomId+', x : '+data.x+'. y : '+data.y);
        clientList.push({id:socket.id, payed:'false', roomId:roomId, x:data.x, y:data.y});
        console.log('현재 clientList갯수는 : '+clientList.length);
 /***********************************************************************/ 

    });
    
    socket.on('room', function(room) {
    	console.log('room 이벤트를 받았습니다.');
    	console.dir(room);

        if (room.command === 'join') {  // 방에 입장하기 요청
            socket.join(room.roomId);
            sendResponse(socket, 'room', '200', '방에 입장했습니다.');
            
        } else if (room.command === 'leave') {  // 방 나가기 요청
            socket.leave(room.roomId);
            sendResponse(socket, 'room', '200', '방에서 나갔습니다.');
        }
        
        io.to(socket.id).emit('specific', socket.id);
        //var roomList = getRoomList();
        //var output = {command:'list', rooms:roomList};
        //console.log('클라이언트로 보낼 데이터 : ' + JSON.stringify(output));
        console.log(room.roomId+'방에 입장했습니다.');

        //클라이언트에게 자기 socket.id 알려주기
        

    });
    
    
/***********************************************************************/
    socket.on('disconnect', function() {
       console.log('client socket is disconnected!');       
        
        rollback(socket.id);

    });
    
    
    
    function rollback(clientIdd){
        console.log('rollback들어옴');
        for (i = 0; i < clientList.length; i++) { 
            if(clientList[i].id ==clientIdd){
                console.log('같은 아이디 인거 찾았따');
                console.log('clientList[i].id: '+clientList[i].id);
                if(clientList[i].payed=='false'){
                    
                    //1.1 db롤백
                    console.log('결제안하고 예매취소한 고객이므로 db를 롤백하려고합니다.');
                    
                    var ty = clientList[i].y+'';
                    var tx = clientList[i].x+'';
                    var ts = clientList[i].roomId+'';
                    
                    console.log('clientList[i].y : '+ty+', clientList[i].x : '+tx+', clientList[i].roomId : '+ts); 
                    var text =  {['seat_no.'+ty+'.row.'+tx]: "1" }; 
                    var findCondition = {screencontent_no:ts};
                    var updateValue = { $set: text };                    
                    
      
                     database.collection("seats").updateOne(findCondition, updateValue, function(err, res) {
                        console.log("response is : "+res);
                        console.log("DB에 좌석정보 업데이트함");
                    });
                    
                    //1.2 clientList에서 없애기
                    //clientList.splice(i,1);

                    //2. 채팅방에 알려주기
                     var tt = { x:tx, y:ty, roomId: ts };

                    io.sockets.in(ts).emit('cancel',tt);
                    console.log("모든 client에게 새로 업데이트된 좌석정보 알려줌");
                    
                    //3. 취소표알리미에게 알려주기
                    //http://127.0.0.1:8080/alarm/json/push/cancelAlarm?serialNo=10303&alarmSeatNo=0,2
                    var options = {
                        host: 'localhost', 
                        path: '/alarm/json/push/cancelAlarm?serialNo='+ts+'&alarmSeatNo='+tx+','+ty,
                        port: 8080,
                        method: 'GET',
                        headers: 'application/x-www-form-urlencoded'
                        
                    };
                    function handleResponse(response){
                        
                        var serverData = '';
                        response.on('data', function (chunk) {
                            serverData += chunk;
                        });
                        response.on('end', function () {
                            console.log(serverData);
                        });
                    }
                    http.request(options, function(response){
                        console.log('gg');
                      handleResponse(response);
                    }).end();
                    
                    console.log('spring서버에 취소표생겼다고 알려줬다');
                    //취소표알리미에 알려주기 끝*/
                }
            }
        }
        
    }
 /***********************************************************************/       
    
});



//좌석 예매취소
app.post('/deleteResv',function(request,response, next){
    
    console.log('/deleteResv요청옴');
    request.accepts('application/application/x-www-form-urlencoded');

    bodyData = request.body;
    console.log('screencontent_no is :'+bodyData.screenNo);
    
    /****************************/
    //rollback(bodyData.clientId);
    
    /****************************/
    
    console.log('seat number is :'+bodyData.seat);
    var temp1 = bodyData.seat;
    var temp2 = temp1.split(",");

    console.log("뚱 좌석 데이터 확인해보쟝 : "+temp2+" 그리고[0] : "+temp2[0]+", hh : "+temp2[1]+", temp2.length: "+temp2.length);
    var i;
    var k=0;
    for(i=0; i<temp2.length ;i+=2){
        console.log('지워야할 좌석 갯수 : '+temp2.length+", temp2/length = "+temp2.length/2);
        console.log('i : '+i);
        //i = k;
        //1. db의 해당 좌석을 예약취소상태로 수정한다
        var t1 =temp2[i]+'';
        var t2 = temp2[i+1]+'';
        var text =  {[ 'seat_no.'+t1+'.row.'+t2] :"1" };
        var findCondition = { screencontent_no: bodyData.screenNo };// A는 없어도 될것 같은데
        var updateValue = { $set: text };
        console.log("data.y : "+temp2[i]+"data.x : "+temp2[i+1]);

        database.collection("seats").updateOne(findCondition, updateValue, function(err, res) {
            console.log("response is : "+res);
            console.log("DB에 좌석정보 업데이트함");
        });
        console.log("roomId 1 : "+bodyData.screenNo);        
        var roomId = bodyData.screenNo;

        //2. 예약정보('reserve')를 모든 회원에게 알려준다

        var tt = { x: t2, y: t1, roomId: roomId };
        console.log("roomId 3 : "+roomId);
        console.log('tt : '+tt+', tt.x : '+tt.x);

        io.sockets.in(roomId).emit('cancel',tt);
        console.log("모든 client에게 새로 업데이트된 좌석정보 알려줌");
        //k= k+2;

    }
    response.writeHead(200, {'Content-Type': 'application/x-www-form-urlencoded'});
    response.end('this is the end of response from node.js');
    
    /////////////////////////////////////////////////////////////////////////
    response.send({});
 
});

app.post('/confirmSeat',function(request,response, next){
    
    console.log('/confirmSea요청옴');
    request.accepts('application/application/x-www-form-urlencoded');

    var clientId = request.body.clientId;

    for (i = clientList.length-1; i >=0; i--) { 
        if(clientList[i].id == clientId){
            console.log('결제완료한 아이디 인거 찾았따 : '+clientList[i].id);
            clientList.splice(i,1);
        }
    }
    if(clientList.length>0){
         for(i=0; i<clientList.length;i++){
            console.log(i+': '+clientList[i].id);
         }
    }else{
        console.log('list가 비어있습니다.');
    }
   
    response.writeHead(200, {'Content-Type': 'application/x-www-form-urlencoded'});
    response.end('this is the end of response from node.js');
    response.send({});
 
});

//*******11.16 오후 8시 안드로이드 어플 예매자를 위한 업데이트 ************//
app.post('/android_addBooking', function(request,response, next){

    console.log('/android_addBooking');
    request.accepts('application/application/x-www-form-urlencoded');

    var bodyData = request.body;
    console.log('seats:'+bodyData.seatsNo+' ');
    
    var temp2 = bodyData.seatsNo.split(",");
    
    console.log("뚱 좌석 데이터 확인해보쟝 : "+temp2+" 그리고[0] : "+temp2[0]+", hh : "+temp2[1]+", temp2.length: "+temp2.length);
    var i;
    var k=0;
    for(i=0; i<temp2.length ;i+=2){

        //1. db의 해당 좌석을 예약취소상태로 수정한다
        var t1 =temp2[i]+'';
        var t2 = temp2[i+1]+'';
        var text =  {[ 'seat_no.'+t1+'.row.'+t2] :"2" };
        var findCondition = { screencontent_no: bodyData.screenNo };// A는 없어도 될것 같은데
        var updateValue = { $set: text };
        console.log("data.y : "+temp2[i]+"data.x : "+temp2[i+1]);

        database.collection("seats").updateOne(findCondition, updateValue, function(err, res) {
            console.log("response is : "+res);
            console.log("DB에 좌석정보 업데이트함");
        });
       
      
        //2. 예약정보('reserve')를 모든 회원에게 알려준다
        console.log("roomId 1 : "+bodyData.screenNo);
        var tt = { x: t2, y: t1, roomId: roomId };
        var roomId = bodyData.screenNo;
        io.sockets.in(roomId).emit('reserve', tt);
        console.log("모든 client에게 새로 업데이트된 좌석정보 알려줌");
    }   
    
    response.writeHead(200, {'Content-Type': 'application/x-www-form-urlencoded'});
    response.status(200);
    response.end('[for android booking service] this is the end of response from node.js');
    
    /////////////////////////////////////////////////////////////////////////
    response.send(200);
    
});
//******************end**********************************************//





// 응답 메시지 전송 메소드 //밖으로 빼봅니다.
function sendResponse(socket, command, code, message) {
    
   var statusObj = {command: command, code: code, message: message};
   socket.emit('response', statusObj);
}
        
app.post('/event', function(req, res) {  
  res.sendStatus(200);   
});