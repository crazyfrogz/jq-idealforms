/**
 * @namespace Errors
 * @locale en
 */
$.idealforms.errors = {

  required: 'This field is required.',
  number: 'Must be a number.',
  digits: 'Must be only digits.',
  name: 'Must be at least 3 characters long, and must only contain letters.',
  username: 'Must be at between 4 and 32 characters long and start with a letter. You may use letters, numbers, underscores, and one dot (.)',
  pass: 'Must be at least 6 characters long, and contain at least one number, one uppercase and one lowercase letter.',
  strongpass: 'Must be at least 8 characters long and contain at least one uppercase and one lowercase letter and one number or special character.',
  email: 'Must be a valid e-mail address. <em>(e.g. user@gmail.com)</em>',
  phone: 'Must be a valid US phone number. <em>(e.g. 555-123-4567)</em>',
  zip: 'Must be a valid US zip code. <em>(e.g. 33245 or 33245-0003)</em>',
  url: 'Must be a valid URL. <em>(e.g. www.google.com)</em>',
  min: 'Must be at least <strong>{0}</strong> characters long.',
  minOption: 'Check at least <strong>{0}</strong> options.',
  max: 'No more than <strong>{0}</strong> characters long.',
  maxOption: 'No more than <strong>{0}</strong> options allowed.',
  date: 'Must be a valid date. <em>(e.g. {0})</em>',
  exclude: '"{0}" is not available.',
  excludeOption: '{0}',
  equalto: 'Must be the same value as <strong>"{0}"</strong>',
  extension: 'File(s) must have a valid extension. <em>(e.g. "{0}")</em>'

}

/**
 * Get all default filters
 * @returns object
 */
var getFilters = function () {

  var filters = {

    required: {
      error: $.idealforms.errors.required
    },

    number: {
      regex: /\d+/,
      error: $.idealforms.errors.number
    },

    digits: {
      regex: /^\d+$/,
      error: $.idealforms.errors.digits
    },

    name: {
      regex: /^[A-Za-z]{3,}$/,
      error: $.idealforms.errors.name
    },

    username: {
      regex: /^[a-z](?=[\w.]{3,31}$)\w*\.?\w*$/i,
      error: $.idealforms.errors.username
    },

    pass: {
      regex: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
      error: $.idealforms.errors.pass
    },

    strongpass: {
      regex: /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      error: $.idealforms.errors.strongpass
    },

    email: {
      regex: /[^@]+@[^@]/,
      error: $.idealforms.errors.email
    },

    phone: {
      regex: /^[2-9]\d{2}-\d{3}-\d{4}$/,
      error: $.idealforms.errors.phone
    },

    zip: {
      regex: /^\d{5}$|^\d{5}-\d{4}$/,
      error: $.idealforms.errors.zip
    },

    url: {
      regex: /^(?:(ftp|http|https):\/\/)?(?:[\w\-]+\.)+[a-z]{3,6}$/i,
      error: $.idealforms.errors.url
    },

    min: {
      regex: function (input, value) {
        var i = input.input,
            min = input.userOptions.data.min
        if (i.is('[type="checkbox"], [type="radio"], select')) {
          this.error = $.idealforms.errors.minOption.replace('{0}', min)
          return i.filter(':checked').length >= min
        }
        this.error = $.idealforms.errors.min.replace('{0}', min)
        return value.length >= min
      }
    },

    max: {
      regex: function (input, value) {
        var i = input.input,
            max = input.userOptions.data.max
        if (i.is('[type="checkbox"], [type="radio"], select')) {
          this.error = $.idealforms.errors.maxOption.replace('{0}', max)
          return i.filter(':checked').length <= max
        }
        this.error = $.idealforms.errors.max.replace('{0}', max)
        return value.length <= max
      }
    },

    date: {
      regex: function (input, value) {
        var

        userFormat =
          input.userOptions.data && input.userOptions.data.date
            ? input.userOptions.data.date
            : 'mm/dd/yyyy', // default format

        delimiter = /[^mdy]/.exec(userFormat)[0],
        theFormat = userFormat.split(delimiter),
        theDate = value.split(delimiter),

        isDate = function (date, format) {
          var m, d, y
          for (var i = 0, len = format.length; i < len; i++) {
            if (/m/.test(format[i])) m = date[i]
            if (/d/.test(format[i])) d = date[i]
            if (/y/.test(format[i])) y = date[i]
          }
          return (
            m > 0 && m < 13 &&
            y && y.length === 4 &&
            d > 0 && d <= (new Date(y, m, 0)).getDate()
          )
        }
        this.error = $.idealforms.errors.date.replace('{0}', userFormat)
        return isDate(theDate, theFormat)
      }
    },

    dob: {
      regex: function (input, value) {
        var isDate = filters.date.regex(input, value),
            theYear = /\d{4}/.exec(value),
            minYear = 1900,
            maxYear = new Date().getFullYear() // This year
        this.error = 'Must be a valid date of birth.'
        return theYear >= minYear && theYear <= maxYear
      }
    },

    exclude: {
      regex: function (input, value) {
        var i = input.input
        if (i.is('[type="checkbox"], [type="radio"], select'))
          this.error = $.idealforms.errors.excludeOption.replace('{0}', value)
        else
          this.error = $.idealforms.errors.exclude.replace('{0}', value)
        return !~$.inArray(value, input.userOptions.data.exclude)
      }
    },

    equalto: {
      regex: function (input, value) {
        var $equals = $(input.userOptions.data.equalto),
            $input = input.input,
            name = $equals.attr('name') || $equals.attr('id'),
            isValid =
              $equals
                .parents('.ideal-field')
                .filter(function(){ return $(this).data('isValid') === true })
                .length
        if (!isValid) return false
        this.error = $.idealforms.errors.equalto.replace('{0}', name)
        return $input.val() === $equals.val()
      }
    },

    extension: {
      regex: function (input, value) {
        var files = input.input[0].files || [{ name: value }],
            extensions = input.userOptions.data.extension,
            re = new RegExp('\\.'+ extensions.join('|') +'$', 'i'),
            valid = false
        for (var i = 0, len = files.length; i < len; i++)
          valid = re.test(files[i].name) ? true : false
        this.error = $.idealforms.errors.extension.replace('{0}', extensions.join('", "'))
        return valid
      }
    }
  }

  return filters

}
