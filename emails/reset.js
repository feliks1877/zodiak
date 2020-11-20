const keys = require('../keys')
module.exports = function (email,token){
    return{
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Восстановление доступа',
        html: `
     <h1>Восстановить доступ</h1>
  <p>Перейдите по ссылке</p>
  <p><a href="${keys.BASE_URL}/auth/password/${token}">Подтвердить</a></p>
     <hr />
     <a href="${keys.BASE_URL}">Магазин курсов</a>
     `
    }
}