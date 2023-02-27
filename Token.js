const Base64 = require('base-64');

class Token {
  constructor(isiToken){
    this.isiToken = isiToken;
  }

  TokenRahasia(){
    let a = 'RestApi#NodeJS';
    let b = Base64.encode(a);
    return b;
  }

  LoginToken(){
    var nilai;
    if (!this.isiToken){
      nilai = false;
    }
    else{
      if (this.isiToken === this.TokenRahasia()){
        nilai = true;
      }
      else{
        nilai = false;
      }
    }
    return nilai;
  }
}

module.exports = {
  TokenRahasia: function(){
    const tokennya = new Token('');
    return tokennya.TokenRahasia();
  },
  LoginToken: function(isi_token) {
    const tokennya = new Token(isi_token);
    return tokennya.LoginToken(tokennya.isiToken);
  },
};