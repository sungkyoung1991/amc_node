var movieNm = null;
app = require('http').createServer(handler),
io = require('socket.io').listen(app),
fs = require('fs'),
util = require('util'),
twitter = require('twitter');
url = require('url');

console.log("dddddddddddddddddd");

app.listen(1337);

var twit = new twitter({
   consumer_key : 'LmnNn1k591QN5Qt3gJmqG8Wva',
   consumer_secret : 'sj6Lz2YsjfLqR0k296eTLsYcfwQDzsoSM1YmiL3xbh2WgWnvG3',
   access_token_key : '1085015442-ZCgpAIChz0ADPdiG91R239xObjQpcIzmRpPt3wH',
   access_token_secret : 'Hc6x6joEgIv2Hz9TsZkECmkCgkytebrjMrr79xj7cDXF3'
});


function handler(req, res) {


   fs.readFile('./index.html', function(err, data) {

      if (err) {
         res.writeHead(500);
         return res.end('Error loading index.html');
      }


      res.writeHead(200);
//      console.log("dataaaaaaa" + data);
      res.end(data);


   });

}

var iconv = require('iconv-lite');
io.sockets.on('connection', function (socket) {
   socket.check = 1;
   // 클라이언트가 sendchat 이벤트를 전송할 경우 처리할 리스너 함수
   socket.on('sendsearch', function (data) {
      

       
       
      socket.check += 1;
      
      var searchcheck = socket.check;
      socket.data = data;
//      console.log(iconv.decode(new Buffer(data), 'UTF-8').toString());
      twit.stream('statuses/filter', {  track : socket.data}, function(stream) {
         stream.on('data', function(data) {

            if(searchcheck != socket.check){
               console.log(socket.data);
               stream.destroy();
            }
            var searchResult = 
            
		'<div class="col-xs-12 twitterSearch">'+
			'<div class="col-xs-2"><img src="'+data.user.profile_image_url+'"></div>'+
			'<div class="col-xs-10">'+
                '<div class="name">'+data.user.name+
                ' <span class="screenName"> '+data.user.screen_name+'</span>'+
                '</div>'+
                
				'<div class="context">'+data.text+'</div>'+
			'</div>'+

		'</div>'        

            socket.emit('tweet', searchResult);
//            console.log(searchResult);
            console.log('.');
         });
      });
   });
   
   socket.on('disconnect', function(){
      
      console.log('exitexitexitexitexitexitexitexitexitexitexit');
      socket.leave(socket);
   });
});

