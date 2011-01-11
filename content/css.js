if( !EmojiPrint ){
    var EmojiPrint = {};
}
EmojiPrint.CssBuilder = function(){
    this.check_version();
    this.clear();
}
EmojiPrint.CssBuilder.prototype = {
    check_version: function(){
	if( typeof GetSelectedMessages != "undefined" ){
	    this.useCss = false; 
	}else{
	    this.useCss = false;     
	}
    },
    clear: function(){
	this.count = 0;
	this.stock = [];
    },
    add: function(dat){
	this.count++;
	this.stock.push( dat );
	return this.count;
    },
    get: function(i){
	if( i < 0 || i > this.count ){
	    return undefined;
	}
	return this.stock[ i ];
    },
    emoji_content: function( str ){
	if( this.useCss ){
	    var id = "EMOJI"+this.add(str);
	    return '<span id="'+id+'" style=\'width:16px; height:16px; background: url("' + str + '") no-repeat top left;\'>&nbsp;</span>';
	}else{
	    return '<img style="vertical-align:text-bottom;" src="'+str+'">';
	}
    },
    add_style: function( content ){
	if( !this.useCss ){
	    return;
	}
	var StyleElement = content.createElement("style");
	StyleElement.type = "text/css";
	var stylecontent='';
	for( var i=0; i<this.count; i++ ){
	    var id = i+1;
	    stylecontent = stylecontent + '\
span#EMOJI'+id+' {\n\
 background: url("' + this.stock[i]+ '") no-repeat top left;\n\
}\n\
';
	}
	alert ( stylecontent );
	var styletext = document.createTextNode(stylecontent);
	StyleElement.appendChild(styletext);
	content.getElementsByTagName("head").item(0).appendChild(StyleElement);
    }
}
