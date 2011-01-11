if( !EmojiPrint ){
  var EmojiPrint = {};
}
EmojiPrint.Mail = function( source ){
  this.source = source;
  this.throughSoftbank = false;
  this.parseBody();
};
EmojiPrint.Mail.prototype = {
  parseBody: function(){
    var lines =	this.source.split(String.fromCharCode(10));
    var count = lines.length;
    for(var i=0; i<count; i++){
      var line = lines[i];
      if( line.substr( -1, 1 ) == String.fromCharCode(13) ){
	line = line.substr( 0, line.length-1);
      }
      if( line == '' ){
	this.body = '';
	
	for( var j=i+1; j<count; j++ ){
	  this.body += lines[j]+String.fromCharCode(10);
	}
	if( this.mimetype && this.mimetype.type == 'multipart' && this.boundary ){
	  this.parseMultipartBody();
	}
	break;
      }
      for( var m=i+1; m<count; m++ ){
	if( lines[m].match(/^\s+(.+?)\r?$/) ){
	  line += " "+RegExp.$1;
          i = m;
	}else{
	  break;
	}
      }
      // Content-Type: multipart/mixed; boundary="-----=_NextPart_49828_68804_22244"
      // Content-Type: text/plain; charset="iso-2022-jp"
      // Content-Type: text/plain; charset="Shift_JIS"
      if( line.match(/^Content-Type:\s*(\w+)\/((?:x-)?\w+)\;\s*(.+)/)){
	this.mimetype = {
	  type: RegExp.$1,
	  subtype: RegExp.$2,
	};
	var rest = RegExp.$3;
	if( rest.match(/^charset\=(?:\"|\')?([^\"\']+)(?:\"|\')?/) ){
	  this.charset = RegExp.$1;
	}else if( rest.match(/^boundary\=(?:\"|\')([^\"\']+)(?:\"|\')/) ){
	  this.boundary = RegExp.$1;
	}
      }else if( line.match(/^Content-Transfer-Encoding:\s*(.+)/) ){
	this.transfer =	RegExp.$1;
      }else if( line.match(/^X-Account-Key:\s*(.+)/)){
        this.account = EmojiPrint.Utility.get_account_info(RegExp.$1);
      }else if( line.match(/^Received:\s*(.*)$/)){
	var receiver = RegExp.$1;
        if(receiver.indexOf("i.softbank.jp") > -1){
	    this.throughSoftbank = true;
	}
      }
    }
  },
  parseMultipartBody: function(){
    var lines =	this.body.split(String.fromCharCode(10));
    var count = lines.length;
    var isheader = 0;
    var body = "";
    var mimetype = {};
    var charset = "";
    this.body = "";
    for(var i=0; i<count; i++){
      var line = lines[i];
      if( line.indexOf(this.boundary) > -1 ){
	if( body && mimetype.type == 'text' && mimetype.subtype == 'plain' ){
	  this.body = body;
	  this.mimetype = {
	    type: mimetype.type,
	    subtype: mimetype.subtype,
	  };
	  this.transfer = mimetype.transfer;
	  this.charset = charset;
	}
	var isheader = 1;
	var body = "";
	var mimetype = {};
	var charset = "";
      }else if( isheader == 1){
	if( line.match(/^Content-Type:\s*(\w+)\/(\w+)\;\s*(.+)/)){
	  mimetype.type = RegExp.$1;
	  mimetype.subtype = RegExp.$2;
	  var rest = RegExp.$3;
	  if( rest.match(/^charset\=(?:\"|\')?([A-Za-z0-9_¥-]+)(?:\"|\')?/) ){
	    charset = RegExp.$1;
	  }
	}else if( line.match(/^Content-Transfer-Encoding:\s*(.+)/) ){
	  mimetype.transfer = RegExp.$1;
	}else if( line == '' && isheader == 1 ){
	  isheader = 0;
	  body = '';
	}
      }else{
	body += line + String.fromCharCode(10);
      }
    }
  }
};
