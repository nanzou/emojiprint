var EmojiPrint = {
  onLoad: function() {
    // initialization code
    EmojiPrint.initialized = true;
    EmojiPrint.messagePane = document.getElementById('messagepane');
    EmojiPrint.messagePane.addEventListener("load", EmojiPrint.convert, true);
  },
  stripHeaderFromMessage: function( message ){
    var ret = message;
    return ret;
  },
  getContentFromMessageURI: function(uri){
    var messageService = messenger.messageServiceFromURI(uri);
    var messageStream = Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance().QueryInterface(Components.interfaces.nsIInputStream);
    var inputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance().QueryInterface(Components.interfaces.nsIScriptableInputStream);
    inputStream.init(messageStream);
    messageService.streamMessage(uri, messageStream, {}, null, false, null);

    var body = "";
    inputStream.available();
    while (inputStream.available()) {
      body = body + inputStream.read(512);
    }
    messageStream.close();
    inputStream.close();
    return EmojiPrint.stripHeaderFromMessage(body);
  },
  convert: function() {
    var carrier = EmojiPrint.detectCarrier();
    if( !carrier ){
      return;
    }
    var css = new EmojiPrint.CssBuilder();
    var content = EmojiPrint.getMessageContent(carrier, css);
    if( content ){
      var messageDocument = EmojiPrint.messagePane.contentDocument;
      messageDocument.body.innerHTML = '<div style="line-height: 18px;">'+content+'</div>';
      css.add_style( messageDocument );
    }
  },
  adjustCarrier: function( carrier, mail ){
    var name = carrier.name;
    if( mail.throughSoftbank == true ){
      carrier =  EmojiPrint.Carrier.softbank;
    } else if( mail.account == 'yahoo' && name == 'docomo' ){
      carrier = EmojiPrint.Carrier.docomo_yahoo;
    } else if( mail.account == 'yahoo' && name == 'softbank' ){
      carrier = EmojiPrint.Carrier.softbank_yahoo;
      EmojiPrint.Carrier.softbank_yahoo.str = "";
    } else if( mail.account == 'softbank' && ( name == 'docomo' || name == 'willcom' || name == 'au' ) ){
      carrier = EmojiPrint.Carrier.softbank;
    } else if( ( mail.account == 'willcom' || mail.account == 'docomo' ) && ( name == 'softbank' ) ){
      carrier = EmojiPrint.Carrier.docomo;
    }
    return carrier; 
  },
  getMessagesWrapper: function(){
      if( typeof GetSelectedMessages != "undefined" ){
          return GetSelectedMessages();
      }else{
          return gFolderDisplay.selectedMessageUris;
      }
  },
  getMessageContent: function(carrier, css) {
    if( !carrier ){
      return;
    }
    var messages = EmojiPrint.getMessagesWrapper();
    if( !messages ) {
      return;
    }
    var source = EmojiPrint.getContentFromMessageURI(messages[0]);
    var mail = new EmojiPrint.Mail(source);
    if( !mail.charset ){
      return;
    }
    carrier = EmojiPrint.adjustCarrier(carrier, mail );
    var charset = mail.charset.toLowerCase();
    if( mail.transfer == 'quoted-printable' ){
      mail.body = EmojiPrint.Utility.decode_quoted_printable(mail.body);
    }
    if( EmojiPrint.Converter[charset] && carrier[charset] ){
      var content = EmojiPrint.Converter[charset]( mail.body, carrier[charset], css );
    }
    if( carrier.filter ){
      content = carrier.filter(content);
    }
    var uconv = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                    createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    uconv.charset = mail.charset;
    content = uconv.ConvertToUnicode(content);

    // url to link
    content = EmojiPrint.Utility.url_to_link(content);
    return content;
  },
  detectCarrier: function() {
    var messages = EmojiPrint.getMessagesWrapper();
    if( !messages ) {
      return;
    }
    var hdr = messenger.msgHdrFromURI(messages[0]);
    var author = hdr.author;
    if( author.match(/\<([^\>]+)\>/) ){
      author = RegExp.$1;
    }
    if( author.match(/\@ezweb\.ne\.jp$/) ){
      return EmojiPrint.Carrier.au;
    }
    if( author.match(/\@docomo\.ne\.jp$/) ){
      return EmojiPrint.Carrier.docomo;
    }
    if( author.match(/\@softbank\.ne\.jp$/) ||
        author.match(/\@i\.softbank\.jp$/) ||
        author.match(/\@(\w+\.)?vodafone\.ne\.jp$/) ){
      return EmojiPrint.Carrier.softbank;
    }
    if( author.match(/\@pdx\.ne\.jp$/) ||
        author.match(/\@wm\.pdx\.ne\.jp$/) ||
        author.match(/\@willcom\.com$/) ){
      return EmojiPrint.Carrier.willcom;
    }
    return;
  }
};

window.addEventListener("load", function(e) { EmojiPrint.onLoad(e); }, false);
