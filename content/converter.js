if( !EmojiPrint ){
  var EmojiPrint = {};
}
EmojiPrint.Converter = {
  'iso-2022-jp': function( content, convFunc, css ){
    var ret = '';
    var len = content.length;
    var isdouble = 0;
    var resultdouble = 0;
    var pos = 0;
    while( pos < len ){
      var c1 = content.charAt(pos);
      pos++;
      if( c1.charCodeAt() == 27 ){
	var c2 = content.charAt(pos);
	var c3 = content.charAt(pos+1);
	pos += 2;
	if( c2 == '$' ){
	  isdouble = 1;
	}else if( c2 == '(' ){
	  isdouble = 0;
	}
      }else{
        if( isdouble == 1 || c1.charCodeAt() > 127 ){
	  // double bytes
	  var c2 = content.charAt(pos);
	  pos++;
	  var emoji = convFunc( c1, c2 );
	  if( emoji ){
	    if( resultdouble == 1 ){
	      resultdouble = 0;
	      ret = ret + String.fromCharCode(27) + '(B';
	    }
	    ret += css.emoji_content(emoji);
	  }else{
	    if( resultdouble == 0 ){
	      resultdouble = 1;
	      ret = ret + String.fromCharCode(27) + '$B';
	    }
	    ret = ret + c1 + c2;
	  }
	}else{
	  // single bytes
	  if( resultdouble == 1 ){
	    resultdouble = 0;
	    ret = ret + String.fromCharCode(27) + '(B';
	  }
	  if( c1.charCodeAt() == 10 ){
	    ret += '<br />'
	  }else{
	    ret += EmojiPrint.Utility.sanitize(c1);
	  }
	}
      }
    }
    if( resultdouble == 1 ){
      resultdouble = 0;
      ret = ret + String.fromCharCode(27) + '(B';
    }
    return ret;
  },
  'shift_jis': function( content, convFunc, css ){
    var ret = '';
    var len = content.length;
    var pos = 0;
    while( pos < len ){
      var c1 = content.charAt(pos);
      pos++;
      if( ( c1.charCodeAt() >= 129 && c1.charCodeAt() <= 159 ) || ( c1.charCodeAt() >= 224 && c1.charCodeAt() <= 253 ) ){
	var c2 = content.charAt(pos);
	pos++;
	var emoji = convFunc( c1, c2 );
	if( emoji ){
	  ret += css.emoji_content(emoji);
	}else{
	  ret = ret + c1 + c2;
	}
      }else if( c1.charCodeAt() == 10 ){
	ret += '<br />'
      }else{
	ret += EmojiPrint.Utility.sanitize(c1);
      }
    }
    return ret;
  },
  'utf-8': function( content, convFunc, css ){
    var ret = '';
    var len = content.length;
    var pos = 0;
    while( pos < len ){
      var c1 = content.charAt(pos);
      var c2 = content.charAt(pos+1);
      var c3 = content.charAt(pos+2);
      var c4 = content.charAt(pos+3);

      if( c1.charCodeAt < 128 ){
	  pos++;
	  ret = ret + c1;
      }else if( c1.charCodeAt >= 192 && c1.charCodeAt <= 223 ){
	  pos+=2;
	  ret = ret + c1+c2;
      }else if( c1.charCodeAt >= 224 && c1.charCodeAt <= 239 ){
	  pos+=3
	  var emoji = convFunc( c1, c2, c3 );
	  if( emoji ){
            ret += css.emoji_content(emoji);
	  }else{
	    ret = ret + c1 + c2 + c3;
	  }
      }else if( c1.charCodeAt >= 240 && c1.charCodeAt <= 247 ){
	  pos+=4;
	  ret = ret + c1+c2+c3+c4;
      }else{
	  pos++;
	  ret = ret + c1;
      }
    }
      
  }
};
