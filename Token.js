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

  TokenEmail(){
    return 'token emailnya disini';
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
    const objtkn = new Token('');
    return objtkn.TokenRahasia();
  },
  TokenEmail: function () {
    const objtkn = new Token('');
    return objtkn.TokenEmail();
  },
  LoginToken: function(isi_token) {
    const objtkn = new Token(isi_token);
    return objtkn.LoginToken(objtkn.isiToken);
  },
};