const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный Email')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email: value})
                if (user) {
                    return Promise.reject('Такой email уже зарегитрирован')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(),
    body('password', 'Пароль должен быть минимум 6 символов')
        .isLength({min: 6, max: 56})
        .isAlphanumeric()
        .trim(),
    body('confirm').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Паполи должны совпадать')
        } else {
            return true
        }
    }).trim(),
    body('name').isLength({min: 3})
        .withMessage('Логин минимум 3 символа').trim()
]

exports.courseValidators = [
    body('title').isLength({min: 3})
        .withMessage('Минимальная длина 3 символа').trim(),
    body('price').isNumeric().withMessage('Введите корретную цену'),
    body('img','Введите корретный URL').isURL()

]