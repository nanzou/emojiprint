if( !EmojiPrint ){
  var EmojiPrint = {};
}
EmojiPrint.Utility = {
  sanitize: function( c ){
    var ret = c;
    switch(c){
    case "<":
      ret = "&lt;";
      break;
    case ">":
      ret = "&gt;"
      break;
    case "&":
      ret = "&amp;";
      break;
    case "\"":
      ret = "&quot;";
      break;
    case "'":
      ret = "&#39;"
      break;
    }
    return ret;
  },
  url_to_link: function( content ){
    var pattern = /(https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g ;
    return content.replace(pattern,"<a href=\"$1\">$1</a>");
  },
  decode_quoted_printable: function( content ){
    var ret = '';
    var len = content.length;
    var pos = 0;
    while( pos < len ){
      var c1 = content.charAt(pos);
      pos++;
      if( c1 == '=' ){
	var c2 = content.charAt(pos);
	var c3 = content.charAt(pos+1);
	if( c2.charCodeAt() == 10 || c2.charCodeAt() == 13 ){
	  pos++;
	  if( c3.charCodeAt() == 10 || c3.charCodeAt() == 13 ){
	    pos++;
	  }
	}else{
	  ret += String.fromCharCode(parseInt("0x"+c2+c3));
	  pos+=2;
	}
      }else{
	ret += c1;
      }
    }
    return ret;
  },
  conv_jis2sjis: function(k1, k2) {
    if (k1 & 0x01) {
      k1 >>= 1;
      if (k1 < 0x2f) k1 += 0x71; else k1 -= 0x4f;
      if (k2 > 0x5f) k2 += 0x20; else k2 += 0x1f;
    } else {
      k1 >>= 1;
      if (k1 < 0x2f) k1 += 0x70; else k1 -= 0x50;
      k2 += 0x7e;
    }
    return ((k1 & 0xff) << 8) | k2;
  },
  get_account_info: function( acount_name ){
    var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
    var account = accountManager.getAccount(acount_name);
    var server = account.incomingServer;
    var hostname = server.hostName;
//    alert( "hostname:" + hostname );
    if( hostname.match(/mail\.yahoo\.co\.jp$/)){
      return "yahoo";
    }
    if( hostname.match(/softbank\.jp$/) ){
      return "softbank";
    }
    if( hostname.match(/pdx\.ne\.jp$/) ){
      return "willcom";
    }
    return "other";
  }
};
